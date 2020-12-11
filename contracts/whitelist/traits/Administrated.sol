pragma solidity 0.6.12;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

/**
 * @title Administrated
 *
 * @dev Contract provides a basic access control mechanism for Admin role.
 */
contract Administrated is Initializable, OwnableUpgradeSafe {
    using EnumerableSet for EnumerableSet.AddressSet;

    event AddAdmin(address indexed admin);
    event RemoveAdmin(address indexed admin);

    EnumerableSet.AddressSet internal admins;

    /**
     * @dev Throws if called by any account other than the admin.
     */
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Administrated: sender is not admin");
        _;
    }

    /**
     * @dev Checks if an account is admin.
     * @param _admin The address of admin account to check.
     */
    function isAdmin(address _admin) public view returns (bool) {
        return admins.contains(_admin);
    }

    /**
     * @dev Returns count of added admins accounts.
     */
    function getAdminCount() external view returns (uint256) {
        return admins.length();
    }

    /**
     * @dev Allows the owner to add admin account.
     *
     * Emits a {AddAdmin} event with `admin` set to new added admin address.
     *
     * @param _admin The address of admin account to add.
     */
    function addAdmin(address _admin) external onlyOwner {
        admins.add(_admin);
        emit AddAdmin(_admin);
    }

    /**
     * @dev Allows the owner to remove admin account.
     *
     * Emits a {RemoveAdmin} event with `admin` set to removed admin address.
     *
     * @param _admin The address of admin account to remove.
     */
    function removeAdmin(address _admin) external onlyOwner {
        admins.remove(_admin);
        emit RemoveAdmin(_admin);
    }
}
