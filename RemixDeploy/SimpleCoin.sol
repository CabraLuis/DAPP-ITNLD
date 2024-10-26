// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

contract SimpleCoin {
    address public owner;
    mapping(address => uint256) public coinBalance;
    mapping(address => bool) public frozenAccount;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event FreezeAccount(address target, bool frozen);

    bool public isReleased;

    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        isReleased = false;
        mint(owner, _initialSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function release() public onlyOwner {
        isReleased = true;
    }

    function transfer(address _to, uint256 amount) public {
        require(isReleased, "Token not released");
        require(coinBalance[msg.sender] >= amount, "Insufficient balance");
        require(!frozenAccount[_to], "Recipient account is frozen");

        coinBalance[msg.sender] -= amount;
        coinBalance[_to] += amount;
        emit Transfer(msg.sender, _to, amount);
    }

    function mint(address recipient, uint256 _mintedAmount) public onlyOwner {
        coinBalance[recipient] += _mintedAmount;
        emit Transfer(owner, recipient, _mintedAmount);
    }

    function freezeAccount(address target, bool freeze) public onlyOwner {
        frozenAccount[target] = freeze;
        emit FreezeAccount(target, freeze);
    }

    mapping(address => mapping(address => uint256)) public allowance;

    function setAllowance(address address1, address address2, uint256 coins) public {
        allowance[address1][address2] = coins;
    }

    function authorize(address _authAccount, uint256 _allowance) public returns(bool success) {
        allowance[msg.sender][_authAccount] = _allowance;
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns(bool success) {
        require(_to != address(0), "Cannot transfer to the zero address");
        require(coinBalance[_from] >= _amount, "Insufficient balance");
        require(!frozenAccount[_from], "Sender account is frozen");
        require(_amount <= allowance[_from][msg.sender], "Allowance exceeded");

        coinBalance[_from] -= _amount;
        coinBalance[_to] += _amount;
        allowance[_from][msg.sender] -= _amount;
        emit Transfer(_from, _to, _amount);
        return true;    
    }
}