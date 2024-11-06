// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Users is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _userIDs;
    struct User {
        string firstName;
        string lastName;
        uint256 amountSpent;
        uint256 userID;
    }
    mapping(uint256 => User) public users;

    function InsertUser(
        string memory firstName,
        string memory lastName
    ) public onlyOwner returns (uint256) {
        _userIDs.increment();
        uint256 newUserID = _userIDs.current();
        User memory newUser = User(firstName, lastName, 0, newUserID);
        users[newUserID] = newUser;
        return newUserID;
    }

    function GetUser() public view returns (User[] memory) {
        User[] memory usersArray = new User[](_userIDs.current());
        for (uint256 i = 0; i < _userIDs.current(); i++) {
            User storage user = users[i + 1];
            usersArray[i] = user;
        }
        return usersArray;
    }

    function GetUserByID(uint256 userID) public view returns (User memory) {
        return users[userID];
    }

    function RegisterSale(uint256 userID, uint256 amount) public onlyOwner {
        users[userID].amountSpent += amount;
    }
}
