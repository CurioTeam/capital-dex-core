pragma solidity >=0.6.0;

interface ICarTokenController {
    function isInvestorAddressActive(address account) external view returns (bool);
}