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
 *
 * Source https://github.com/Uniswap/uniswap-v2-core
 * Subject to the GPL-3.0 license.
 */
// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.5.0;

interface IUniswapV2Factory {
    event PairCreated(address indexed token0, address indexed token1, address pair, uint);

    function feeTo() external view returns (address);
    function owner() external view returns (address);

    function whitelist() external view returns (address);

    function fee() external view returns (uint);
    function feeInfo() external view returns (address feeToAddress, uint feeShare);

    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function allPairs(uint) external view returns (address pair);
    function allPairsLength() external view returns (uint);

    function isRouter(address router) external view returns (bool);

    function createPair(address tokenA, address tokenB) external returns (address pair);

    function setFeeTo(address) external;
    function setOwner(address) external;

    function setFee(uint) external;
    function setRouterPermission(address router, bool permission) external;
    function setWhitelist(address) external;
}
