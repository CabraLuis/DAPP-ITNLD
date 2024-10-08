// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.19;

contract Token {
    enum UserType {
        TokenHolder,
        Admin,
        Owner
    }

    struct UserInfo {
        address account;
        string firstName;
        string lastName;
        UserType userType;
    }

    mapping (address => uint) public tokenBalance;
    mapping (address => UserInfo) public registeredUser;
    mapping (address => bool) public frozenAccount;

    address public owner = 0x7410Ad86D6134A5D477e54b59F0123e163398c9D;
    uint256 public constant maxTransferLimit = 15000;

    event Transfer(address from, address to, uint256 value);
    event FreezeAccount(address target, bool frozen);

    modifier onlyOwner {
        require (msg.sender == owner);
        _;
    }

// El constructor solo se ejecuta 1 vez, entonces el contrato no se puede modificar una vez hecho el deploy
    constructor(uint256 _initialSupply) public {
        owner = msg.sender;
    }
}