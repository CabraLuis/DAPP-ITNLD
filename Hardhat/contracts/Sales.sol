// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Sales is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _salesIDs;
    struct Sale {
        uint256 saleID;
        uint256 userID;
        string[] items;
        uint256[] prices;
    }
    mapping(uint256 => Sale) public sales;

    function GetSales() public view returns (Sale[] memory) {
        Sale[] memory salesArray = new Sale[](_salesIDs.current());
        for (uint256 i = 0; i < _salesIDs.current(); i++) {
            Sale storage sale = sales[i + 1];
            salesArray[i] = sale;
        }
        return salesArray;
    }
}
