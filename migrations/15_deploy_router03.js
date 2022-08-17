const UniswapFactory = artifacts.require("UniswapV2Factory.sol");
const UniswapV2Router03 = artifacts.require("UniswapV2Router03.sol");

const transferHelperExternalAddress = ""; // TODO: set address
const factoryAddress = ""; // TODO: set address
const wethAddress = ""; // TODO: set address

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // Link TransferHelperExternal library to Router
    await UniswapV2Router03.link("TransferHelperExternal", transferHelperExternalAddress);

    // Router deployment
    await deployer.deploy(UniswapV2Router03,
      factoryAddress,
      wethAddress
    );
    let uniswapV2Router03 = await UniswapV2Router03.deployed();
    console.log("UniswapV2Router03: ", uniswapV2Router03.address);

    // get UniswapFactory from address
    let uniswapFactory = await UniswapFactory.at(factoryAddress);

    // set router permission for UniswapRouter in UniswapFactory
    await uniswapFactory.setRouterPermission(
      uniswapV2Router03.address,
      true
    );
};
