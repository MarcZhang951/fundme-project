const { network } = require("hardhat")
const { developmentChains, networkConfig, LOCK_TIME, CONFIRMATIONS } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { firstAccount } = await getNamedAccounts()
    const { deploy, log } = deployments

    let dataFeedAddr
    let confirmations
    if (developmentChains.includes(network.name)) {
        dataFeedAddr = (await deployments.get("MockV3Aggregator")).address
        confirmations = 0
    } else {
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed
        confirmations = CONFIRMATIONS
    }

    // 重新部署时需删除 deployments 目录，或加 --reset
    const fundMe = await deploy("FundMe", {
        from: firstAccount,
        args: [LOCK_TIME, dataFeedAddr],
        log: true,
        waitConfirmations: confirmations
    })

    if (network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address, [LOCK_TIME, dataFeedAddr])
    } else {
        log("Network is not sepolia, verification skipped...")
    }
}

module.exports.tags = ["all", "fundme"]
