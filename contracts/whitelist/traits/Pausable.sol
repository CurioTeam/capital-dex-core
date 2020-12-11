pragma solidity 0.6.12;

import "./Administrated.sol";

/**
 * @title Pausable
 *
 * @dev Contract provides a stop emergency mechanism.
 */
contract Pausable is Initializable, Administrated {
    event Paused(address admin);
    event Unpaused(address admin);

    bool private _paused;

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view returns (bool) {
        return _paused;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     */
    modifier whenNotPaused() {
        require(!_paused, "Pausable: paused");
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     */
    modifier whenPaused() {
        require(_paused, "Pausable: not paused");
        _;
    }

    /**
     * @dev Allows the owner to pause, triggers stopped state.
     *
     * Emits a {Paused} event with `admin` set to admin who paused it.
     */
    function pause() public onlyAdmin whenNotPaused {
        _paused = true;
        emit Paused(msg.sender);
    }

    /**
     * @dev Allows the owner to do unpause, returns to normal state.
     *
     * Emits a {Unpaused} event with `admin` set to admin who unpaused it.
     */
    function unpause() public onlyAdmin whenPaused {
        _paused = false;
        emit Unpaused(msg.sender);
    }
}
