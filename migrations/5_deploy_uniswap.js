const {
    ether
} = require("@openzeppelin/test-helpers");

const UniswapFactory = artifacts.require("UniswapV2Factory.sol");
const UniswapRouter = artifacts.require("UniswapV2Router02.sol");

const wethAddress = ""; // TODO: set

const owner = ""; // TODO: set

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

    // UniswapRouter deployment
    await deployer.deploy(UniswapRouter,
        uniswapFactory.address,
        wethAddress
    );
    let uniswapRouter = await UniswapRouter.deployed();
    console.log("UniswapV2Router02: ", uniswapRouter.address);

    console.log("Setting whitelist for Factory...");
    await uniswapFactory.setWhitelist(
        dexWhitelistAddress
    );
    console.log("Whitelist have been set");

    console.log("Setting feeTo address for Factory...");
    await uniswapFactory.setFeeTo(
        feeToAddress
    );
    console.log("feeTo address have been set");

    console.log("Setting fee value for Factory...");
    await uniswapFactory.setFee(
        fee
    );
    console.log("Fee value have been set");

    console.log("Setting router permission for Factory...");
    await uniswapFactory.setRouterPermission(
        uniswapRouter.address,
        true
    );
    console.log("Router permission have been set");

    // transfer owner permission
    console.log("Transferring Factory ownership: ", owner);
    await uniswapFactory.setOwner(
        owner
    );
    console.log("Ownership has been transferred");
};
