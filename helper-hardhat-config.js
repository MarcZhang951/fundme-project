// MockV3Aggregator 参数：8 位小数，ETH 价格 3000 USD
const DECIMAL = 8
const INITIAL_ANSWER = 300000000000
const developmentChains = ["hardhat", "localhost"]
// FundMe 的众筹窗口（秒）
const LOCK_TIME = 180
// 测试网部署时等待的区块确认数（Etherscan 验证前需要）
const CONFIRMATIONS = 5

const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    97: {
        name: "bnbTestnet",
        ethUsdDataFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    }
}

module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    developmentChains,
    networkConfig,
    LOCK_TIME,
    CONFIRMATIONS
}
