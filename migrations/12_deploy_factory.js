const {
    ether
} = require("@openzeppelin/test-helpers");

const UniswapFactory = artifacts.require("UniswapV2Factory.sol");

const feeToAddress = ""; // TODO: set

const fee = ether("0.1");  // 10% TODO: set

const dexWhitelistAddress = ""; // TODO: set

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
    console.log("UniswapV2Factory: ", uniswapFactory.address);

    console.log("pairCodeHash: ", await uniswapFactory.pairCodeHash());

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
};
