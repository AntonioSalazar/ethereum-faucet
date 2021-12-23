// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "./Owned.sol";
import "./Logger.sol";
import "./IFaucet.sol";

contract Faucet is Owned, Logger, IFaucet {

    uint public numOfFunders;
    mapping(address => bool) public funders;
    mapping(uint => address) public lutFunders;


    modifier limitWithdraw(uint withdrawAmount){
        require(withdrawAmount < 1000000000000000000, "Withdraw amount should be less than one ether");
        _;
    }

    function emitLog() public override pure returns (bytes32){
        return "Hello World";
    }

    receive() external payable {}


    function addFunds() external payable override {
        address funder = msg.sender;
        if(!funders[funder]){
            uint index = numOfFunders++;
            funders[funder] = true;
            lutFunders[index] = funder;
        }
    }

    function withdraw(uint withdrawAmount) external override limitWithdraw(withdrawAmount) {
        payable(msg.sender).transfer(withdrawAmount);
    }

    function getAllFunders() external view returns(address[] memory){
        address[] memory _funders = new address[](numOfFunders);

        for (uint256 i = 0; i < numOfFunders; i++) {
          _funders[i] = lutFunders[i];  
        } 

        return _funders;
    }

    function getFunderAtIndex(uint index) external view returns(address){
        return lutFunders[index];
    }
}

// const instance = await Faucet.deployed();
// instance.addFunds({from: accounts[1], value: "1500000000000000000"})
// instance.addFunds({from: accounts[2], value: "1500000000000000000"})
// instance.withdraw("5000000000000000000", {from: accounts[1]})