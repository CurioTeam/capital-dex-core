pragma solidity 0.6.12;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";

// import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

contract Administrated is Initializable, OwnableUpgradeSafe {
    using EnumerableSet for EnumerableSet.AddressSet;

    // ** EVENTS **

    event AddAdmin(address indexed admin);
    event RemoveAdmin(address indexed admin);

    // ** STATE VARIABLES **

    EnumerableSet.AddressSet internal admins;

    // ** MODIFIERS **

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Administrated: sender is not admin");
        _;
    }

    // ** PUBLIC VIEW functions **

    function isAdmin(address _admin) public view returns (bool) {
        return admins.contains(_admin);
    }

    function getAdminCount() external view returns (uint256) {
        return admins.length();
    }

    // ** OWNER functions **

    function addAdmin(address _admin) external onlyOwner {
        admins.add(_admin);
        emit AddAdmin(_admin);
    }

    function removeAdmin(address _admin) external onlyOwner {
        admins.remove(_admin);
        emit RemoveAdmin(_admin);
    }
}
