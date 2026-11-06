// MockV3Aggregator parameters: 8 decimals, ETH price of 3000 USD
const DECIMAL = 8
const INITIAL_ANSWER = 300000000000
const developmentChains = ["hardhat", "localhost"]
// FundMe funding window (seconds)
const LOCK_TIME = 180
// Block confirmations to wait for on testnets (required before Etherscan verification)
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
