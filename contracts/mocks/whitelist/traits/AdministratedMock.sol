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
pragma solidity 0.6.12;

import "../../../whitelist/traits/Administrated.sol";

/**
 * @title AdministratedMock
 * @dev This contract is a mock to test administrated functionality
 */
contract AdministratedMock is Administrated {
    function initialize() external initializer {
        __Ownable_init();
    }

    function onlyAdminFunction() external view onlyAdmin returns(bool) {
        return true;
    }
}
