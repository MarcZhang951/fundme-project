const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { developmentChains, LOCK_TIME } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
? describe.skip
: describe("FundToken (handwritten token)", function () {
    let token
    let firstAccount
    let secondAccount

    beforeEach(async function () {
        ({ firstAccount, secondAccount } = await getNamedAccounts())
        const factory = await ethers.getContractFactory("FundToken")
        token = await factory.deploy("FundToken", "FT")
        await token.waitForDeployment()
    })

    it("mint increases balance and totalSupply", async function () {
        await token.mint(100)
        expect(await token.balanceOf(firstAccount)).to.equal(100)
        expect(await token.totalSupply()).to.equal(100)
    })

    it("transfer moves balance and reverts when balance is insufficient", async function () {
        await token.mint(100)
        await token.transfer(secondAccount, 40)
        expect(await token.balanceOf(firstAccount)).to.equal(60)
        expect(await token.balanceOf(secondAccount)).to.equal(40)
        await expect(token.transfer(secondAccount, 61))
            .to.be.revertedWith("You do not have enough balance to transfer")
    })
})

!developmentChains.includes(network.name)
? describe.skip
: describe("FundTokenERC20 (minted from FundMe funding)", function () {
    let fundMe
    let token
    let tokenSecondAccount
    let secondAccount

    async function closeWindow() {
        await helpers.time.increase(LOCK_TIME + 20)
        await helpers.mine()
    }

    beforeEach(async function () {
        await deployments.fixture(["all"])
        secondAccount = (await getNamedAccounts()).secondAccount
        fundMe = await ethers.getContract("FundMe")
        token = await ethers.getContract("FundTokenERC20")
        tokenSecondAccount = await ethers.getContract("FundTokenERC20", secondAccount)
    })

    it("deploy script authorizes the token contract on FundMe", async function () {
        // setFunderToAmount is only callable by the registered erc20 address
        await expect(fundMe.setFunderToAmount(secondAccount, 1))
            .to.be.revertedWith("you do not have permission to call this funtion")
    })

    it("cannot mint before getFund succeeds", async function () {
        await fundMe.connect(await ethers.getSigner(secondAccount)).fund({ value: ethers.parseEther("0.5") })
        await expect(tokenSecondAccount.mint(ethers.parseEther("0.1")))
            .to.be.revertedWith("The fundme is not completed yet")
    })

    describe("after getFund succeeds", function () {
        beforeEach(async function () {
            // 0.5 + 0.5 ETH * 3000 USD = 3000 USD >= 1000 USD target
            await fundMe.fund({ value: ethers.parseEther("0.5") })
            await fundMe.connect(await ethers.getSigner(secondAccount)).fund({ value: ethers.parseEther("0.5") })
            await closeWindow()
            await fundMe.getFund()
        })

        it("funder mints up to their funded amount and the record decreases", async function () {
            await tokenSecondAccount.mint(ethers.parseEther("0.3"))
            expect(await token.balanceOf(secondAccount)).to.equal(ethers.parseEther("0.3"))
            expect(await fundMe.fundersToAmount(secondAccount)).to.equal(ethers.parseEther("0.2"))
            await expect(tokenSecondAccount.mint(ethers.parseEther("0.3")))
                .to.be.revertedWith("You cannot mint this many tokens")
        })

        it("claim burns tokens", async function () {
            await tokenSecondAccount.mint(ethers.parseEther("0.5"))
            await tokenSecondAccount.claim(ethers.parseEther("0.2"))
            expect(await token.balanceOf(secondAccount)).to.equal(ethers.parseEther("0.3"))
            await expect(tokenSecondAccount.claim(ethers.parseEther("1")))
                .to.be.revertedWith("You dont have enough ERC20 tokens")
        })
    })
})
