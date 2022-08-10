const Multicall = artifacts.require("Multicall.sol");

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // Multicall deployment
    await deployer.deploy(Multicall);
    let multicall = await Multicall.deployed();

    console.log("Multicall: ", multicall.address);
};
