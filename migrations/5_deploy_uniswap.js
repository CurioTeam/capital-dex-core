const {
    ether,
    constants,
} = require("@openzeppelin/test-helpers");

const { ZERO_ADDRESS } = constants;

const UniswapFactory = artifacts.require("UniswapV2Factory.sol");
const UniswapRouter = artifacts.require("UniswapV2Router02.sol");

const wethAddress = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";   // KOVAN WETH address

const owner = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";

const feeToAddress = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";
const fee = ether("0.1");  // 10%

const dexWhitelistAddress = "0x56D11549597a6685D48CFE9B571A66F7b819B9D9";

module.exports = async function(deployer) {
    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    // UniswapFactory deployment
    let uniswapFactory = await deployer.deploy(UniswapFactory,
        curDeployer
    );
    console.log("uniswapFactory address: ", uniswapFactory.address);

    // UniswapRouter deployment
    let uniswapRouter = await deployer.deploy(UniswapRouter,
        uniswapFactory.address,
        wethAddress
    );
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