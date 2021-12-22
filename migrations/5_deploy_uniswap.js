const fs = require("fs");
const path = require("path");

const {
    ether
} = require("@openzeppelin/test-helpers");

const UniswapFactory = artifacts.require("UniswapV2Factory.sol");
const UniswapRouter = artifacts.require("UniswapV2Router02.sol");

const wethAddress = "0xd0A1E359811322d97991E03f863a0C30C2cF029C"; // KOVAN WETH address
// const wethAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // Mainnet WETH address
// const wethAddress = "0xD2Aaa00700000000000000000000000000000000"; // SKALE Mainnet ETH address

const owner = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";
// const owner = "0x94ddecAFF0109b615e51C482e07312abce704042"; // Mainnet
// const owner = "0xF08256540D0Ef017F27933e58713f7E136777e2A"; // SKALE Mainnet

const feeToAddress = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";
// const feeToAddress = "0x94ddecAFF0109b615e51C482e07312abce704042"; // Mainnet
// const feeToAddress = "0xF08256540D0Ef017F27933e58713f7E136777e2A"; // SKALE Mainnet

const fee = ether("0.1");  // 10%

const dexWhitelistAddress = "0xC8A46b066BC148E08c80cfc6638Ea1bC1774538c";
// const dexWhitelistAddress = "0xB2C747Aed3e54da0ad14D41B710CC40F88E51aA9"; // Mainnet
// const dexWhitelistAddress = "0x1Da4933B725Afc12C6cCA017d71bBb06d5b096Ef"; // SKALE Mainnet

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    // UniswapFactory deployment
    await deployer.deploy(UniswapFactory,
        curDeployer
    );
    let uniswapFactory = await UniswapFactory.deployed();
    console.log("uniswapFactory address: ", uniswapFactory.address);

    console.log("pairCodeHash: ", await uniswapFactory.pairCodeHash());

    // UniswapRouter deployment
    await deployer.deploy(UniswapRouter,
        uniswapFactory.address,
        wethAddress
    );
    let uniswapRouter = await UniswapRouter.deployed();
    console.log("uniswapRouter address: ", uniswapRouter.address);

    // set WL to UniswapFactory
    await uniswapFactory.setWhitelist(
        dexWhitelistAddress
    );

    // set feeTo in UniswapFactory
    await uniswapFactory.setFeeTo(
        feeToAddress
    );

    // set fee in UniswapFactory
    await uniswapFactory.setFee(
        fee
    );

    // set router permission for UniswapRouter in UniswapFactory
    await uniswapFactory.setRouterPermission(
        uniswapRouter.address,
        true
    );

    // transfer owner permission
    await uniswapFactory.setOwner(
        owner
    );

    // write addresses and ABI to files
    const contractsAddresses = {
        uniswapFactory: uniswapFactory.address,
        uniswapRouter: uniswapRouter.address,
        dexWhitelistAddress: dexWhitelistAddress
    };

    const contractsAbi = {
        uniswapFactory: uniswapFactory.abi,
        uniswapRouter: uniswapRouter.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
        fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, `${network}_uniswap_addresses.json`), JSON.stringify(contractsAddresses, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_uniswap_abi.json`), JSON.stringify(contractsAbi, null, 2));
};
