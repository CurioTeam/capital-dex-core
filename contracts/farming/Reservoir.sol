pragma solidity 0.6.12;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Reservoir {
    IERC20 public token;
    address public target;

    constructor(IERC20 _token, address _target) public {
        token = _token;
        target = _target;
    }

    function drip(uint256 requestedTokens)
        external
        returns (uint256 sentTokens)
    {
        address target_ = target;
        IERC20 token_ = token;
        require(msg.sender == target_, "Reservoir: permission denied");

        uint256 reservoirBalance = token_.balanceOf(address(this));
        sentTokens = (requestedTokens > reservoirBalance)
            ? reservoirBalance
            : requestedTokens;

        token_.transfer(target_, sentTokens);
    }
}
