const { deployProxy, admin } = require("@openzeppelin/truffle-upgrades");

const DexWhitelist = artifacts.require("DexWhitelist");

const owner = ""; // TODO: set

const proxyAdmin = ""; // TODO: set

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    let dexWhitelist = await deployProxy(DexWhitelist, [], {
        unsafeAllowCustomTypes: true,
    });
    console.log("dexWhitelist address: ", dexWhitelist.address);

    // activate all WLs
    await dexWhitelist.setWlActive(false, false, false, true);

    await dexWhitelist.addAdmin(curDeployer);

    // add new admin and manager
    await dexWhitelist.addAdmin(owner);
    await dexWhitelist.addManager(owner);

    // transfer owner permission
    await dexWhitelist.removeAdmin(curDeployer);
    await dexWhitelist.transferOwnership(owner);

    // transfer ProxyAdmin owner permission
    await admin.changeProxyAdmin(dexWhitelist.address, proxyAdmin)
};
