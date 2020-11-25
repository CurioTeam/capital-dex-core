pragma solidity >=0.6.0;

interface IDexWhitelist {
    function isLiquidityWLActive() external view returns (bool);
    function isSwapWLActive() external view returns (bool);

    function isLiquidityWhitelisted(address) external view returns (bool);
    function isSwapWhitelisted(address) external view returns (bool);
}