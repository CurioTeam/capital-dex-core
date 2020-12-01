pragma solidity 0.6.12;

// import "@openzeppelin/upgrades/contracts/Initializable.sol";
import "../access/Manageable.sol";

contract Whitelist is Initializable, ManageableUpgradeSafe {

    mapping(address => bool) public liquidityWhitelist;
    mapping(address => bool) public swapWhitelist;
    mapping(address => bool) public tokenWhitelist;

    function initialize() public initializer {
        __Ownable_init();
    }

    // TODO: add events

    // TODO: add getters

    function isLiquidityWLActive() external view virtual returns (bool) {
        // TODO: 
    }
    function isSwapWLActive() external view virtual returns (bool)  {
        // TODO: 
    }
    function isTokenWLActive() external view virtual returns (bool)  {
        // TODO: 
    }

    function isLiquidityWhitelisted(address user) external view virtual returns (bool)  {
        // TODO: 
    }
    function isSwapWhitelisted(address user) external view virtual returns (bool)  {
        // TODO: 
    }
    function isTokenWhitelisted(address token) external view virtual returns (bool)  {
        // TODO: 
    }


    // liquidityWhitelist
    function setLiquidityWhitelistPermission(address _account, bool _status) public onlyOwnerOrAdminOrManager {
        liquidityWhitelist[_account] = _status;
        // TODO: emit
    }

    function setLiquidityWhitelistPermissions(address[] memory _account, bool _status) public onlyOwnerOrAdminOrManager {
        for (uint i = 0; i < _account.length; i++) {
            liquidityWhitelist[_account[i]] = _status;
            // TODO: emit
        }
    }

    // swapWhitelist
    function setSwapWhitelistPermission(address _account, bool _status) public onlyOwnerOrAdminOrManager {
        swapWhitelist[_account] = _status;
        // TODO: emit
    }

    function setSwapWhitelistPermissions(address[] memory _account, bool _status) public onlyOwnerOrAdminOrManager {
        for (uint i = 0; i < _account.length; i++) {
            swapWhitelist[_account[i]] = _status;
            // TODO: emit
        }
    }

    // tokenWhitelist
    function setTokenWhitelistPermission(address _account, bool _status) public onlyOwnerOrAdminOrManager {
        tokenWhitelist[_account] = _status;
        // TODO: emit
    }

    function setTokenWhitelistPermissions(address[] memory _account, bool _status) public onlyOwnerOrAdminOrManager {
        for (uint i = 0; i < _account.length; i++) {
            tokenWhitelist[_account[i]] = _status;
            // TODO: emit
        }
    }
}