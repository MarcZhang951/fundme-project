const { network } = require("hardhat")
const { DECIMAL, INITIAL_ANSWER, developmentChains } = require("../helper-hardhat-config")

// 本地网络没有 Chainlink 喂价合约，部署 MockV3Aggregator 代替
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log } = deployments
    if (!developmentChains.includes(network.name)) {
        log("environment is not local, mock contract deployment is skipped")
        return
    }

    const { firstAccount } = await getNamedAccounts()
    await deployments.deploy("MockV3Aggregator", {
        from: firstAccount,
        args: [DECIMAL, INITIAL_ANSWER],
        log: true
    })
}

module.exports.tags = ["all", "mock"]
