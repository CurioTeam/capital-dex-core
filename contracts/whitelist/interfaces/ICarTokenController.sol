pragma solidity >=0.6.0;

/**
 * @dev Interface of CarTokenController (part of security token contracts).
 *
 * CarTokenController contract source: https://github.com/CurioTeam/security-token-contracts/blob/dd5c82e566d24d0e87639316a9420afdb9b30e71/contracts/CarTokenController.sol
 */
interface ICarTokenController {
    function isInvestorAddressActive(address account) external view returns (bool);
}
