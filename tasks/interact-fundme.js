const { task } = require("hardhat/config")

// Fund FundMe from two accounts and print the balances
// Without --addr, uses the FundMe address recorded by hardhat-deploy
task("interact-fundme", "fund FundMe with two accounts and print balances")
    .addOptionalParam("addr", "FundMe contract address")
    .addOptionalParam("amount", "ETH amount per account", "0.5")
    .setAction(async (taskArgs, hre) => {
        const { ethers, deployments } = hre
        const addr = taskArgs.addr || (await deployments.get("FundMe")).address
        const fundMe = await ethers.getContractAt("FundMe", addr)
        const [firstAccount, secondAccount] = await ethers.getSigners()
        const value = ethers.parseEther(taskArgs.amount)

        await (await fundMe.fund({ value })).wait()
        console.log(`Balance of the contract is ${await ethers.provider.getBalance(addr)}`)

        if (secondAccount) {
            await (await fundMe.connect(secondAccount).fund({ value })).wait()
            console.log(`Balance of the contract is ${await ethers.provider.getBalance(addr)}`)
        }

        for (const account of [firstAccount, secondAccount].filter(Boolean)) {
            console.log(`fundersToAmount[${account.address}] = ${await fundMe.fundersToAmount(account.address)}`)
        }
    })
