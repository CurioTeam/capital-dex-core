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
};
