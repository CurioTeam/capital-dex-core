pragma solidity >=0.6.0;

interface IDexWhitelist {
    function isLiquidityWLActive() external view returns (bool);
    function isSwapWLActive() external view returns (bool);
    function isTokenWLActive() external view returns (bool);

    function isLiquidityWhitelisted(address user) external view returns (bool);
    function isSwapWhitelisted(address user) external view returns (bool);
    function isTokenWhitelisted(address token) external view returns (bool);
}