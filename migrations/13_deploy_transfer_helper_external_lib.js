const TransferHelperExternal = artifacts.require("TransferHelperExternal.sol");

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // TransferHelperExternal library deployment
    await deployer.deploy(TransferHelperExternal);
};
