const fs = require("fs");
const path = require("path");

const {
    BN,
    ether,
} = require("@openzeppelin/test-helpers");

const ERC20Mock = artifacts.require("ERC20FixedSupplyMock.sol");
const TokenFaucet = artifacts.require("TokenFaucet");

// tCGT params
const tCGTName = "tCGT";
const tCGTSymbol = "tCGT";
const tCGTSupply = ether(new BN(1e8));  // 100M
const tCGTFaucetAmt = ether("1000");    // 1000
const tCGTTransferAmt = ether(new BN(4.5e7));   // 45M

// tCSC params
const tCSCName = "tCSC";
const tCSCSymbol = "tCSC";
const tCSCSupply = ether(new BN(1e8));  // 100M
const tCSCFaucetAmt = ether("1000");    // 1000
const tCSCTransferAmt = ether(new BN(4.5e7));   // 45M

// tCUR params
const tCURName = "tCUR";
const tCURSymbol = "tCUR";
const tCURSupply = ether(new BN(2e6));  // 2M
const tCURFaucetAmt = ether("1000");    // 1000
const tCURTransferAmt = ether(new BN(9.5e5));   // 950k

// tDAI params
const tDAIName = "tDAI";
const tDAISymbol = "tDAI";
const tDAISupply = ether(new BN(1e8));  // 100M
const tDAIFaucetAmt = ether("1000");    // 1000
const tDAITransferAmt = ether(new BN(4.5e7));   // 45M

const faucetOwner = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";
const tokensToAddress = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

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

    // set faucet gulp amount for test tokens
    tokenFaucet.setAmt(tCGT.address, tCGTFaucetAmt);
    tokenFaucet.setAmt(tCSC.address, tCSCFaucetAmt);
    tokenFaucet.setAmt(tCUR.address, tCURFaucetAmt);
    tokenFaucet.setAmt(tDAI.address, tDAIFaucetAmt);

    // transfer faucet ownership to new owner
    await tokenFaucet.transferOwnership(faucetOwner);

    // transfer tCGT to TokenFaucet and tokensTo addresses
    await tCGT.transfer(
        tokenFaucet.address,
        tCGTTransferAmt
    );
    await tCGT.transfer(
        tokensToAddress,
        tCGTTransferAmt
    );

    // transfer tCSC to TokenFaucet and tokensTo addresses
    await tCSC.transfer(
        tokenFaucet.address,
        tCSCTransferAmt
    );
    await tCSC.transfer(
        tokensToAddress,
        tCSCTransferAmt
    );

    // transfer tCUR to TokenFaucet and tokensTo addresses
    await tCUR.transfer(
        tokenFaucet.address,
        tCURTransferAmt
    );
    await tCUR.transfer(
        tokensToAddress,
        tCURTransferAmt
    );

    // transfer tDAI to TokenFaucet and tokensTo addresses
    await tDAI.transfer(
        tokenFaucet.address,
        tDAITransferAmt
    );
    await tDAI.transfer(
        tokensToAddress,
        tDAITransferAmt
    );

    // write addresses and ABI to files
    const contractsAddresses = {
        tCGT: tCGT.address,
        tCSC: tCSC.address,
        tCUR: tCUR.address,
        tDAI: tDAI.address,
        TokenFaucet: tokenFaucet.address
    };

    const contractsAbi = {
        token: tCGT.abi,
        TokenFaucet: tokenFaucet.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
        fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, `${network}_mocks_addresses.json`), JSON.stringify(contractsAddresses, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_mocks_abi.json`), JSON.stringify(contractsAbi, null, 2));
};
