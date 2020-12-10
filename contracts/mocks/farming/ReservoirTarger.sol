pragma solidity 0.6.12;

import "../../farming/interfaces/IReservoir.sol";

contract ReservoirTarget {
    IReservoir public reservoir;

    function setReservoir(IReservoir _reservoir) public {
        reservoir = _reservoir;
    }

    function runDrip(uint256 _amount) public {
        reservoir.drip(_amount);
    }
}
