const UniswapFactory = artifacts.require("UniswapV2Factory.sol");
const UniswapV2Router02 = artifacts.require("UniswapV2Router02.sol");

const factoryAddress = ""; // TODO: set address
const wethAddress = ""; // TODO: set address

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // Router deployment
    await deployer.deploy(UniswapV2Router02,
      factoryAddress,
      wethAddress
    );
    let uniswapV2Router02 = await UniswapV2Router02.deployed();
    console.log("UniswapV2Router02: ", uniswapV2Router02.address);

    // get UniswapFactory from address
    let uniswapFactory = await UniswapFactory.at(factoryAddress);

    // set router permission for UniswapRouter in UniswapFactory
    await uniswapFactory.setRouterPermission(
      uniswapV2Router02.address,
      true
    );
};
