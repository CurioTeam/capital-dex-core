pragma solidity >=0.6.0;

interface IReservoir {
    function drip(uint256 requestedTokens)
        external
        returns (uint256 sentTokens);
}
