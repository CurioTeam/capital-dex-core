const fs = require("fs");
const path = require("path");

const Multicall = artifacts.require("Multicall.sol");

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    console.log("Deployer:", curDeployer);
    console.log("Balance:", (await web3.eth.getBalance(curDeployer)).toString());


    // Multicall deployment
    await deployer.deploy(Multicall);
    let multicall = await Multicall.deployed();
    console.log("multicall address: ", multicall.address);

    // write addresses and ABI to files
    const contractsAddresses = {
        multicall: multicall.address
    };

    const contractsAbi = {
        multicall: multicall.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
        fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, `${network}_multicall_addresses.json`), JSON.stringify(contractsAddresses, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_multicall_abi.json`), JSON.stringify(contractsAbi, null, 2));
};
