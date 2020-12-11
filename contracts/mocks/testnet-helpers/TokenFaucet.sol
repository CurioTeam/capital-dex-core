// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title TokenFaucet
 * @dev This contract is a token faucet for testing
 */
contract TokenFaucet is Ownable {

    mapping (address => uint256) public amt;
    mapping (address => mapping (address => bool)) public done;

    function mul(uint256 x, uint256 y) internal pure returns (uint256 z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    function gulp(address gem) external {
        require(!done[msg.sender][address(gem)], "token-faucet: already used faucet");
        require(IERC20(gem).balanceOf(address(this)) >= amt[gem], "token-faucet: not enough balance");
        done[msg.sender][address(gem)] = true;
        IERC20(gem).transfer(msg.sender, amt[gem]);
    }

    function gulp(address gem, address[] calldata addrs) external {
        require(IERC20(gem).balanceOf(address(this)) >= mul(amt[gem], addrs.length), "token-faucet: not enough balance");

        for (uint256 i = 0; i < addrs.length; i++) {
            require(!done[addrs[i]][address(gem)], "token-faucet: already used faucet");
            done[addrs[i]][address(gem)] = true;
            IERC20(gem).transfer(addrs[i], amt[gem]);
        }
    }

    function shut(IERC20 gem) external onlyOwner {
        gem.transfer(msg.sender, gem.balanceOf(address(this)));
    }

    function setAmt(address gem, uint256 amt_) external onlyOwner {
        amt[gem] = amt_;
    }
}