/*
 * Capital DEX
 *
 * Copyright ©️ 2020 CurioDAO Association
 * Incorporated and registered in Zug, Switzerland.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.0;

/**
 * @dev Interface of CarTokenController (part of security token contracts).
 *
 * CarTokenController contract source: https://github.com/CurioTeam/security-token-contracts/blob/dd5c82e566d24d0e87639316a9420afdb9b30e71/contracts/CarTokenController.sol
 */
interface ICarTokenController {
    function isInvestorAddressActive(address account) external view returns (bool);
}
