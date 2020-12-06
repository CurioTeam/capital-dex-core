pragma solidity 0.6.12;

// import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

contract AdminableUpgradeSafe is Initializable, OwnableUpgradeSafe {

    mapping(address => bool) public admins;

    event AdminPermissionChanged(address indexed account, bool isAdmin);

    function __Adminable_init(address _admin) internal initializer {
        admins[_admin] = true;
    }

    modifier onlyOwnerOrAdmin {
        require(msg.sender == owner() ||
                admins[msg.sender], "Permission denied");
        _;
    }

    modifier onlyAdmin {
        require(admins[msg.sender], "Permission denied");
        _;
    }

    function setAdminPermission(address _admin, bool _status) public onlyOwner {
        admins[_admin] = _status;
        emit AdminPermissionChanged(_admin, _status);
    }

    function setAdminsPermission(address[] memory _admins, bool _status) public onlyOwner {
        for (uint i = 0; i < _admins.length; i++) {
            admins[_admins[i]] = _status;
            emit AdminPermissionChanged(_admins[i], _status);
        }
    }

    uint256[50] private ______gap;
}