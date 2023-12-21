const WBNB = artifacts.require("WBNB.sol");

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    await deployer.deploy(WBNB);
    let wBNB = await WBNB.deployed();
    console.log("WBNB: ", wBNB.address);
};
