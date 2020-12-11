pragma solidity 0.6.12;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

/**
 * @title Pausable
 *
 * @dev Contract provides a stop emergency mechanism.
 */
contract Pausable is Initializable, OwnableUpgradeSafe {
    event Paused();
    event Unpaused();

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
     * Emits a {Paused} event.
     */
    function pause() public onlyOwner whenNotPaused {
        _paused = true;
        emit Paused();
    }

    /**
     * @dev Allows the owner to do unpause, returns to normal state.
     *
     * Emits a {Unpaused} event.
     */
    function unpause() public onlyOwner whenPaused {
        _paused = false;
        emit Unpaused();
    }
}
