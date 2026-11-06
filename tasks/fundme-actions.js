const { task } = require("hardhat/config")

async function getFundMe(hre) {
    const { ethers, deployments } = hre
    return ethers.getContractAt("FundMe", (await deployments.get("FundMe")).address)
}

task("get-fund", "owner withdraws all funds after the window closes (target reached)")
    .setAction(async (_, hre) => {
        const fundMe = await getFundMe(hre)
        const receipt = await (await fundMe.getFund()).wait()
        console.log(`getFund tx: ${receipt.hash}`)
    })

task("refund", "funder gets refund after the window closes (target not reached)")
    .setAction(async (_, hre) => {
        const fundMe = await getFundMe(hre)
        const receipt = await (await fundMe.refund()).wait()
        console.log(`refund tx: ${receipt.hash}`)
    })

task("mint-ft", "mint FundTokenERC20 using your recorded funding amount (after getFund)")
    .addParam("amount", "token amount in ether units, e.g. 0.1")
    .setAction(async (taskArgs, hre) => {
        const { ethers, deployments } = hre
        const token = await ethers.getContractAt("FundTokenERC20", (await deployments.get("FundTokenERC20")).address)
        const [signer] = await ethers.getSigners()
        await (await token.mint(ethers.parseEther(taskArgs.amount))).wait()
        console.log(`FT balance of ${signer.address}: ${ethers.formatEther(await token.balanceOf(signer.address))}`)
    })
