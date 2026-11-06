//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title FundToken: a minimal handwritten token (not ERC20-compliant)
/// @author Marc Zhang
contract FundToken {
    // 1. token name
    // 2. token symbol
    // 3. total supply
    // 4. owner address
    // 5. balance address => uint256
    string public tokenName;
    string public tokenSymbol;
    uint256 public totalSupply;
    address public owner;
    mapping(address => uint256) public balances;

    constructor(string memory _tokenName, string memory _tokenSymbol) {
        tokenName = _tokenName;
        tokenSymbol = _tokenSymbol;
        owner = msg.sender;
    }

    // mint: create tokens for the caller
    function mint(uint256 amountToMint) public {
        balances[msg.sender] += amountToMint;
        totalSupply += amountToMint;
    }

    // transfer: move tokens to another address
    function transfer(address payee, uint256 amount) public {
        require(balances[msg.sender] >= amount, "You do not have enough balance to transfer");
        balances[msg.sender] -= amount;
        balances[payee] += amount;
    } 

    // balanceOf: get the token balance of an address
    function balanceOf(address addr) public view returns(uint256) {
        return balances[addr];
    }

}