//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 本地测试用 Chainlink 喂价 Mock（直接复用 @chainlink/contracts 中的实现）
// @author Marc Zhang
import "@chainlink/contracts/src/v0.8/shared/mocks/MockV3Aggregator.sol";
