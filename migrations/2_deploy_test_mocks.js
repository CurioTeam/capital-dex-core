const {
    BN,
    ether,
} = require('@openzeppelin/test-helpers');

const ERC20Mock = artifacts.require("ERC20FixedSupplyMock.sol");
const TokenFaucet = artifacts.require('TokenFaucet');

// tCGT params
const tCGTName = "tCGT";
const tCGTSymbol = "tCGT";
const tCGTSupply = ether(new BN(1e8));  // 100M

// tCSC params
const tCSCName = "tCSC";
const tCSCSymbol = "tCSC";
const tCSCSupply = ether(new BN(1e8));  // 100M

// tCUR params
const tCURName = "tCUR";
const tCURSymbol = "tCUR";
const tCURSupply = ether(new BN(2e6));  // 2M

// tDAI params
const tDAIName = "tDAI";
const tDAISymbol = "tDAI";
const tDAISupply = ether(new BN(1e8));  // 100M

const faucetOwner = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";

module.exports = async function(deployer) {
    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

	// deploy tCGT
	let tCGT = await deployer.deploy(ERC20Mock, tCGTName, tCGTSymbol, curDeployer, tCGTSupply);
    console.log("tCGT address: ", tCGT.address);

    // deploy tCSC
	let tCSC = await deployer.deploy(ERC20Mock, tCSCName, tCSCSymbol, curDeployer, tCSCSupply);
    console.log("tCSC address: ", tCSC.address);

    // deploy tCUR
	let tCUR = await deployer.deploy(ERC20Mock, tCURName, tCURSymbol, curDeployer, tCURSupply);
    console.log("tCUR address: ", tCUR.address);

    // deploy tDAI
	let tDAI = await deployer.deploy(ERC20Mock, tDAIName, tDAISymbol, curDeployer, tDAISupply);
    console.log("tDAI address: ", tDAI.address);
    
    // deploy TokenFaucet
	let tokenFaucet = await deployer.deploy(TokenFaucet);
    console.log("TokenFaucet address: ", tokenFaucet.address);

    // transfer faucet ownership to new owner
    await tokenFaucet.transferOwnership(faucetOwner);
};