pragma solidity 0.6.12;

import "../../../whitelist/traits/Managed.sol";

/**
 * @title ManagedMock
 * @dev This contract is a mock to test managed functionality
 */
contract ManagedMock is Managed {
    function initialize() external initializer {
        __Ownable_init();
    }

    function onlyManagerFunction() external view onlyManager returns(bool) {
        return true;
    }

    function onlyAdminOrManagerFunction() external view onlyAdminOrManager returns(bool) {
        return true;
    }
}
