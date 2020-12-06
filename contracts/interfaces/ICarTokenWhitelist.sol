pragma solidity >=0.6.0;

interface ICarTokenWhitelist {
    function isInvestorAddressActive(address account) external view returns (bool);
}