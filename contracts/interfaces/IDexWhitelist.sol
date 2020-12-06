pragma solidity >=0.6.0;

interface IDexWhitelist {
    function isInvestorAddressActive(address _addr)
        external
        view
        returns (bool);

    // success if address is in investor WL or liquidity WL is not active
    function isLiquidityAddressActive(address _addr)
        external
        view
        returns (bool);

    // success if address is in investor WL or swap WL is not active
    function isSwapAddressActive(address _addr)
        external
        view
        returns (bool);

    // success if address is in investor WL or swap WL is not active
    function isFarmAddressActive(address _addr)
        external
        view
        returns (bool);

    // success if address is in token WL or token WL is not active
    function isTokenAddressActive(address _addr)
        external
        view
        returns (bool);
}
