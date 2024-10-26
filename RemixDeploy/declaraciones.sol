// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

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

    mapping(address => uint256) public tokenBalance;
    mapping(address => UserInfo) public registeredUser;
    mapping(address => bool) public frozenAccount;

    address public owner;
    uint256 public constant maxTransferLimit = 15000;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event FreezeAccount(address indexed target, bool frozen);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        tokenBalance[owner] = _initialSupply; // Assign initial supply to the owner
    }

    function registerUser(address _account, string memory _firstName, string memory _lastName, UserType _userType) public onlyOwner {
        require(registeredUser[_account].account == address(0), "User already registered");
        registeredUser[_account] = UserInfo(_account, _firstName, _lastName, _userType);
    }

    function transfer(address _to, uint256 _amount) public {
        require(!frozenAccount[msg.sender], "Sender account is frozen");
        require(!frozenAccount[_to], "Recipient account is frozen");
        require(tokenBalance[msg.sender] >= _amount, "Insufficient balance");
        require(_amount <= maxTransferLimit, "Amount exceeds max transfer limit");

        tokenBalance[msg.sender] -= _amount;
        tokenBalance[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
    }

    function freezeAccount(address target, bool freeze) public onlyOwner {
        frozenAccount[target] = freeze;
        emit FreezeAccount(target, freeze);
    }
}
