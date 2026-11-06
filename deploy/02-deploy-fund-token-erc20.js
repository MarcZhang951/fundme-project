const { network, ethers } = require("hardhat")
const { developmentChains, CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// FundTokenERC20 mints tokens based on FundMe.fundersToAmount.
// After deployment, the FundMe owner calls setErc20Addr so the token can update fundersToAmount.
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments
    const isDev = developmentChains.includes(network.name)

    const fundMeDeployment = await deployments.get("FundMe")
    const fundTokenERC20 = await deploy("FundTokenERC20", {
        from: firstAccount,
        args: [fundMeDeployment.address],
        log: true,
        waitConfirmations: isDev ? 0 : CONFIRMATIONS
    })

    const fundMe = await ethers.getContractAt("FundMe", fundMeDeployment.address, await ethers.getSigner(firstAccount))
    const tx = await fundMe.setErc20Addr(fundTokenERC20.address)
    await tx.wait(isDev ? 1 : CONFIRMATIONS)
    log(`FundMe.setErc20Addr(${fundTokenERC20.address}) done`)

    if (network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        await verify(fundTokenERC20.address, [fundMeDeployment.address])
    }
}

module.exports.tags = ["all", "token"]
module.exports.dependencies = ["fundme"]
