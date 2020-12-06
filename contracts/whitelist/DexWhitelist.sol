pragma solidity 0.6.12;

// import "@openzeppelin/upgrades/contracts/Initializable.sol";

import "./traits/Managed.sol";
import "./traits/Pausable.sol";
import "./interfaces/ICarTokenController.sol";

contract DexWhitelist is Initializable, Managed, Pausable {
    // ** STATE VARIABLES **

    ICarTokenController public controller;

    struct Investor {
        address addr;
        bool active;
    }

    mapping(bytes32 => Investor) public investors;
    mapping(address => bytes32) public keyOfInvestor;

    // whitelisted tokens
    mapping(address => bool) public tokens;

    // enable/disable whitelists
    bool public isLiquidityWlActive;
    bool public isSwapWlActive;
    bool public isFarmWlActive;
    bool public isTokenWlActive;

    // ** EVENTS **

    event SetController(address indexed controller);

    event AddNewInvestor(bytes32 indexed key, address indexed addr);
    event SetInvestorActive(bytes32 indexed key, bool active);
    event ChangeInvestorAddress(
        address indexed sender,
        bytes32 indexed key,
        address indexed oldAddr,
        address newAddr
    );

    event SetLiquidityWlActive(bool active);
    event SetSwapWlActive(bool active);
    event SetFarmWlActive(bool active);
    event SetTokenWlActive(bool active);

    event SetTokenAddressActive(address indexed token, bool active);

    // ** INITIALIZERS **

    function initialize() external initializer {
        __Ownable_init();
    }

    // ** PUBLIC VIEW functions **

    function isInvestorAddressActive(address _addr) public view returns (bool) {
        return
            investors[keyOfInvestor[_addr]].active ||
            (
                address(controller) != address(0)
                    ? controller.isInvestorAddressActive(_addr)
                    : false
            );
    }

    // success if address is in investor WL or liquidity WL is not active
    function isLiquidityAddressActive(address _addr)
        public
        view
        returns (bool)
    {
        return !isLiquidityWlActive || isInvestorAddressActive(_addr);
    }

    // success if address is in investor WL or swap WL is not active
    function isSwapAddressActive(address _addr) public view returns (bool) {
        return !isSwapWlActive || isInvestorAddressActive(_addr);
    }

    // success if address is in investor WL or farm WL is not active
    function isFarmAddressActive(address _addr) public view returns (bool) {
        return !isFarmWlActive || isInvestorAddressActive(_addr);
    }

    // success if address is in token WL or token WL is not active
    function isTokenAddressActive(address _addr) public view returns (bool) {
        return !isTokenWlActive || tokens[_addr];
    }

    // ** USER functions **

    function changeMyAddress(bytes32 _investorKey, address _newAddr)
        external
        whenNotPaused
    {
        require(
            investors[_investorKey].addr == msg.sender,
            "Investor address and msg.sender does not match"
        );

        _changeInvestorAddress(_investorKey, _newAddr);
    }

    // ** ADMIN or MANAGER functions **

    function addNewInvestors(
        bytes32[] calldata _keys,
        address[] calldata _addrs
    ) external onlyAdminOrManager {
        uint256 len = _keys.length;
        require(
            len == _addrs.length,
            "Lengths of keys and address does not match"
        );

        for (uint256 i = 0; i < len; i++) {
            _setInvestorAddress(_keys[i], _addrs[i]);

            emit AddNewInvestor(_keys[i], _addrs[i]);
        }
    }

    function setInvestorActive(bytes32 _key, bool _active)
        external
        onlyAdminOrManager
    {
        require(investors[_key].addr != address(0), "Investor does not exists");
        investors[_key].active = _active;

        emit SetInvestorActive(_key, _active);
    }

    // ** ADMIN functions **

    function changeInvestorAddress(bytes32 _investorKey, address _newAddr)
        external
        onlyAdmin
    {
        _changeInvestorAddress(_investorKey, _newAddr);
    }

    function setTokenAddressActive(address _token, bool _active)
        external
        onlyAdmin
    {
        _setTokenAddressActive(_token, _active);
    }

    function setTokenAddressesActive(
        address[] calldata _tokens,
        bool[] calldata _active
    ) external onlyAdmin {
        uint256 len = _tokens.length;
        require(
            len == _active.length,
            "Lengths of tokens and active does not match"
        );

        for (uint256 i = 0; i < len; i++) {
            _setTokenAddressActive(_tokens[i], _active[i]);
        }
    }

    // ** OWNER functions **

    function setController(ICarTokenController _controller) external onlyOwner {
        controller = _controller;
        emit SetController(address(_controller));
    }

    function setLiquidityWlActive(bool _active) external onlyOwner {
        _setLiquidityWlActive(_active);
    }

    function setSwapWlActive(bool _active) external onlyOwner {
        _setSwapWlActive(_active);
    }

    function setFarmWlActive(bool _active) external onlyOwner {
        _setFarmWlActive(_active);
    }

    function setTokenWlActive(bool _active) external onlyOwner {
        _setTokenWlActive(_active);
    }

    // all WLActive setters in one function
    function setWlActive(
        bool _liquidityWlActive,
        bool _swapWlActive,
        bool _farmWlActive,
        bool _tokenWlActive
    ) external onlyOwner {
        _setLiquidityWlActive(_liquidityWlActive);
        _setSwapWlActive(_swapWlActive);
        _setFarmWlActive(_farmWlActive);
        _setTokenWlActive(_tokenWlActive);
    }

    // ** INTERNAL functions **

    function _setInvestorAddress(bytes32 _key, address _addr) internal {
        require(investors[_key].addr == address(0), "Investor already exists");
        require(keyOfInvestor[_addr] == bytes32(0), "Address already claimed");

        investors[_key] = Investor(_addr, true);
        keyOfInvestor[_addr] = _key;
    }

    function _changeInvestorAddress(bytes32 _investorKey, address _newAddr)
        internal
    {
        address oldAddress = investors[_investorKey].addr;
        require(oldAddress != _newAddr, "Old address and new address the same");

        keyOfInvestor[investors[_investorKey].addr] = bytes32(0);
        investors[_investorKey] = Investor(address(0), false);

        _setInvestorAddress(_investorKey, _newAddr);

        emit ChangeInvestorAddress(
            msg.sender,
            _investorKey,
            oldAddress,
            _newAddr
        );
    }

    function _setTokenAddressActive(address _token, bool _active) internal {
        tokens[_token] = _active;
        emit SetTokenAddressActive(_token, _active);
    }

    function _setLiquidityWlActive(bool _active) internal {
        isLiquidityWlActive = _active;
        emit SetLiquidityWlActive(_active);
    }

    function _setSwapWlActive(bool _active) internal {
        isSwapWlActive = _active;
        emit SetSwapWlActive(_active);
    }

    function _setFarmWlActive(bool _active) internal {
        isFarmWlActive = _active;
        emit SetFarmWlActive(_active);
    }

    function _setTokenWlActive(bool _active) internal {
        isTokenWlActive = _active;
        emit SetTokenWlActive(_active);
    }
}
