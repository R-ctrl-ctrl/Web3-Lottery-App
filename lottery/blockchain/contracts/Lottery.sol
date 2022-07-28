// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract Lottery is VRFConsumerBaseV2 {
  VRFCoordinatorV2Interface COORDINATOR;

  uint64 s_subscriptionId;
  address vrfCoordinator = 0x6168499c0cFfCaCD319c818142124B7A15E857ab;

  bytes32 keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
  uint32 callbackGasLimit = 100000;
  uint16 requestConfirmations = 3;
  uint32 numWords =  1;

  uint256[] public s_randomWords;
  uint256 public s_requestId;
  address public owner;
  mapping(uint => address payable) public map;

  constructor(uint64 subscriptionId) VRFConsumerBaseV2(vrfCoordinator) {
    COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
    owner = msg.sender;
    s_subscriptionId = subscriptionId;
  }

  

  function requestRandomWords() external onlyOwner {
    s_requestId = COORDINATOR.requestRandomWords(
      keyHash,
      s_subscriptionId,
      requestConfirmations,
      callbackGasLimit,
      numWords
    );
  }
  
  function fulfillRandomWords(
    uint256, /* requestId */
    uint256[] memory randomWords
  ) internal override {
    s_randomWords = randomWords;
  }



  

  address payable[] public players;
  uint public lotteryId;

  function getLotteryHistory(uint Lid) public view returns(address payable){
    return map[Lid];
  } 

  function enter() public payable{
    require(msg.value == 0.1 ether);
    players.push(payable(msg.sender));
  }

  function getBalance() public view returns(uint256){
    return address(this).balance;
  }

  function getplayers() public view returns(address payable[] memory){
    return players;
  }


  function payWinner() public onlyOwner{
    uint index = s_randomWords[0] % players.length;
    players[index].transfer(address(this).balance);
    map[lotteryId] = players[index];

    players = new  address  payable[](0);
    lotteryId += 1;
    
    
  }

  





  modifier onlyOwner() {

    require(msg.sender == owner);
    _;
  }
}

