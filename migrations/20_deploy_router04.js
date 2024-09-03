const UniswapFactory = artifacts.require("UniswapV2Factory.sol");
const UniswapV2Router04 = artifacts.require("UniswapV2Router04.sol");

const factoryAddress = ""; // TODO: set address

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // Router deployment
    await deployer.deploy(UniswapV2Router04,
      factoryAddress
    );
    let uniswapV2Router04 = await UniswapV2Router04.deployed();
    console.log("UniswapV2Router04: ", uniswapV2Router04.address);

    // get UniswapFactory from address
    let uniswapFactory = await UniswapFactory.at(factoryAddress);

    // set router permission for UniswapRouter in UniswapFactory
    await uniswapFactory.setRouterPermission(
      uniswapV2Router04.address,
      true
    );
};
