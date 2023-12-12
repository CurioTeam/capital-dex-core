const WETH9 = artifacts.require("WETH9.sol");

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    await deployer.deploy(WETH9);
    let wEth = await WETH9.deployed();
    console.log("WETH: ", wEth.address);
};
