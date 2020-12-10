pragma solidity 0.6.12;

import "../../../whitelist/traits/Administrated.sol";

/**
 * @title AdministratedMock
 * @dev This contract is a mock to test administrated functionality
 */
contract AdministratedMock is Administrated {
    function initialize() external initializer {
        __Ownable_init();
    }

    function onlyAdminFunction() external view onlyAdmin returns(bool) {
        return true;
    }
}
