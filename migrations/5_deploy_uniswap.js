const {
    ether
} = require("@openzeppelin/test-helpers");

const UniswapFactory = artifacts.require("UniswapV2Factory.sol");
const UniswapRouter = artifacts.require("UniswapV2Router02.sol");

const wethAddress = ""; // TODO: set

const owner = ""; // TODO: set

const feeToAddress = ""; // TODO: set

const fee = ether("0.1");  // 10%

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
};
