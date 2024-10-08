// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.20;

import './SimpleCoin.sol';

contract SimpleCrowdSale {
    uint256 public startTime;
    uint256 public endTime;
    uint256 public weiTokenPrice;
    uint256 public weiInvestmentObjective;

    mapping(address => uint256) public investmentAmountOf;

    uint256 public investmentReceived;
    uint256 public investRefunded;
    bool public isFinalized;
    bool public isRefundedAllowed;
    address public owner;
    SimpleCoin public crowdSaleToken;

    modifier onlyOwner() {
        if(msg.sender != owner) revert();
        _;
    }

    constructor (uint256 _startTime, uint256 _endTime, uint256 _weiTokenPrice, uint256 _etherInvestmentObjective) public {
            require(_startTime >= block.timestamp);
            require(_endTime >= _startTime);
            require(_weiTokenPrice != 0);
            require(_etherInvestmentObjective != 0);
            startTime = _startTime;
            endTime = _endTime;
            weiTokenPrice = _weiTokenPrice;
            weiInvestmentObjective = _etherInvestmentObjective * 1000000000000000000;
            crowdSaleToken = new SimpleCoin(0);
            isFinalized = false;
            isRefundedAllowed = false;
            owner = msg.sender;
        }
}