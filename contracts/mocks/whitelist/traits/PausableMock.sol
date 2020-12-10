pragma solidity 0.6.12;

import "../../../whitelist/traits/Pausable.sol";

/**
 * @title PausableMock
 * @dev This contract is a mock to test pausable functionality
 */
contract PausableMock is Pausable {
    function initialize() external initializer {
        __Ownable_init();
    }

    function whenPausedFunction() external view whenPaused returns(bool) {
        return true;
    }

    function whenNotPausedFunction() external view whenNotPaused returns(bool) {
        return true;
    }


}
