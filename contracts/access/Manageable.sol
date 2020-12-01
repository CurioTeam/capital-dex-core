pragma solidity 0.6.12;

// import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "./Adminable.sol";

contract ManageableUpgradeSafe is Initializable, AdminableUpgradeSafe {

    mapping(address => bool) public managers;

    event ManagerPermissionChanged(address indexed account, bool isManager);

    function __Manageable_init(address _manager) internal initializer {
        managers[_manager] = true;
    }

    modifier onlyOwnerOrAdminOrManager {
        require(msg.sender == owner() ||
                admins[msg.sender] ||
                managers[msg.sender], "Permission denied");
        _;
    }

    modifier onlyAdminOrManager {
        require(admins[msg.sender] ||
                managers[msg.sender], "Permission denied");
        _;
    }

    modifier onlyManager {
        require(managers[msg.sender], "Permission denied");
        _;
    }

    function setManagerPermission(address _manager, bool _status) public onlyOwnerOrAdmin {
        managers[_manager] = _status;
        emit ManagerPermissionChanged(_manager, _status);
    }

    function setManagersPermission(address[] memory _managers, bool _status) public onlyOwnerOrAdmin {
        for (uint i = 0; i < _managers.length; i++) {
            managers[_managers[i]] = _status;
            emit ManagerPermissionChanged(_managers[i], _status);
        }
    }

    uint256[50] private ______gap;
}