pragma solidity 0.6.12;

// import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "./Administrated.sol";

contract Managed is Initializable, Administrated {
    using EnumerableSet for EnumerableSet.AddressSet;

    // ** EVENTS **

    event AddManager(address indexed manager, address indexed admin);
    event RemoveManager(address indexed manager, address indexed admin);

    // ** STATE VARIABLES **

    EnumerableSet.AddressSet internal managers;

    // ** MODIFIERS **

    modifier onlyAdminOrManager() {
        require(
            isAdmin(msg.sender) || isManager(msg.sender),
            "Managered: sender is not admin or manager"
        );
        _;
    }

    modifier onlyManager() {
        require(isManager(msg.sender), "Managered: sender is not manager");
        _;
    }

    // ** PUBLIC VIEW functions **

    function isManager(address _manager) public view returns (bool) {
        return managers.contains(_manager);
    }

    function getManagerCount() external view returns (uint256) {
        return managers.length();
    }

    // ** ADMIN functions **

    function addManager(address _manager) external onlyAdmin {
        managers.add(_manager);
        emit AddManager(_manager, msg.sender);
    }

    function removeManager(address _manager) external onlyAdmin {
        managers.remove(_manager);
        emit RemoveManager(_manager, msg.sender);
    }
}
