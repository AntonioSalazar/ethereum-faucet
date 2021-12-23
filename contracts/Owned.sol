// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Owned {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner (){
        require(owner == msg.sender, "Only the owner can call this function");
        _;
    }
}