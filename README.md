# FundMe

Author: Marc Zhang

FundMe is a time-locked crowdfunding contract on Ethereum that values ETH contributions in USD with Chainlink price feeds. If the funding goal is met, contributors can receive an ERC20 token. The project uses Hardhat and hardhat-deploy, with mock price feeds for local development and support for deploying to Sepolia.

> This code has not been audited. Do not use it in production without your own review.

## How it works

1. **Funding window.** When `FundMe` is deployed, a funding window of `LOCK_TIME` seconds (default 180) opens. During the window, anyone can call `fund()` with at least 100 USD worth of ETH. The USD value comes from the Chainlink ETH/USD price feed. Each funder's total is recorded in `fundersToAmount`.
2. **After the window closes:**
   - If the contract holds at least **1000 USD**, the owner calls `getFund()` to withdraw the full balance. This marks the campaign as successful.
   - If the goal is not met, each funder can call `refund()` to get their ETH back.
3. **Tokens.** After a successful campaign, funders can mint `FundTokenERC20` (symbol `FT`) up to the amount they contributed. Their recorded balance in `FundMe` goes down by the amount they mint. Holders call `claim()` to burn tokens when they redeem them.

## Contracts

| Contract | Description |
| --- | --- |
| `FundMe` | Crowdfunding logic: USD conversion through Chainlink, funding window, withdrawal, refunds. Emits `FundWithdrawByOwner` and `RefundByFunder`. |
| `FundTokenERC20` | OpenZeppelin ERC20 token minted against a funder's recorded contribution. It is the only address allowed to update `FundMe.fundersToAmount`. |
| `FundToken` | A minimal, dependency-free token (`mint`, `transfer`, `balanceOf`), included as a lightweight reference implementation. |
| `mocks/MockV3Aggregator` | Chainlink price feed mock for local networks. It reports ETH at 3000 USD. |

## Project structure

```
contracts/                Solidity sources
deploy/                   hardhat-deploy scripts, run in order
  00-deploy-mocks.js        price feed mock (local networks only)
  01-deploy-fund-me.js      FundMe (+ Etherscan verification on Sepolia)
  02-deploy-fund-token-erc20.js  FundTokenERC20 + FundMe.setErc20Addr
tasks/                    Hardhat tasks for interacting with deployed contracts
test/unit/                Unit tests (local network only)
test/staging/             Integration tests (Sepolia only)
helper-hardhat-config.js  Price feed addresses per chain, lock time, confirmations
```

On local networks (`hardhat` and `localhost`), the deploy scripts use the mock price feed. On live networks, they read the feed address for the current chain ID from `helper-hardhat-config.js`.

## Getting started

Requires Node.js (an LTS release that Hardhat supports, e.g. 22) and npm.

```bash
npm install
npx hardhat compile
npx hardhat test
```

### Testing

```bash
npx hardhat test                            # all unit tests
npx hardhat test test/unit/FundMe.test.js   # one file
npx hardhat test --grep "claim"             # tests matching a name
REPORT_GAS=true npx hardhat test            # with a gas report
```

### Local node

```bash
npx hardhat node                                  # terminal 1: start a node and deploy everything
npx hardhat interact-fundme --network localhost   # terminal 2: fund from two accounts
```

## Deploying to Sepolia

1. Store secrets encrypted with [`@chainlink/env-enc`](https://www.npmjs.com/package/@chainlink/env-enc):

   ```bash
   npx env-enc set-pw
   npx env-enc set
   ```

   | Variable | Purpose |
   | --- | --- |
   | `SEPOLIA_RPC_URL` | Sepolia RPC endpoint |
   | `PRIVATE_KEY` | Deployer / owner account |
   | `PRIVATE_KEY_1` | Second account, used by `interact-fundme` |
   | `ETHERSCAN_API_KEY` | Optional. Turns on contract verification |

2. Fund the accounts with Sepolia ETH (for example from https://faucets.chain.link).

3. Deploy:

   ```bash
   npx hardhat deploy --network sepolia
   ```

   This deploys `FundMe` and `FundTokenERC20`, gives the token contract permission to update `FundMe`, and verifies both contracts on Etherscan when `ETHERSCAN_API_KEY` is set. To redeploy, add `--reset`.

4. Run the integration tests (optional). They take a few minutes because each test waits for the funding window to close, and they spend test ETH:

   ```bash
   npx hardhat test --network sepolia
   ```

## Tasks

If `--addr` is not given, the tasks use the contract addresses recorded by hardhat-deploy for the selected network.

| Task | Description |
| --- | --- |
| `interact-fundme [--addr <address>] [--amount <eth>]` | Funds from the first two accounts (0.5 ETH each by default) and prints balances. |
| `get-fund` | Owner withdraws the balance (window closed, goal reached). |
| `refund` | Caller gets their contribution back (window closed, goal not reached). |
| `mint-ft --amount <tokens>` | Mints FT against the caller's recorded contribution (after `get-fund`). |

Example:

```bash
npx hardhat interact-fundme --network sepolia
npx hardhat get-fund --network sepolia
npx hardhat mint-ft --amount 0.1 --network sepolia
```

## Configuration

Adjust these in `helper-hardhat-config.js`:

- `LOCK_TIME`: length of the funding window in seconds.
- `CONFIRMATIONS`: blocks to wait on live networks before verification.
- `networkConfig`: Chainlink ETH/USD feed address for each chain ID. To support another network, add it here and in `hardhat.config.js`.

The minimum contribution (100 USD) and the funding goal (1000 USD) are constants in `contracts/FundMe.sol`.

## License

MIT. See [LICENSE](./LICENSE).
