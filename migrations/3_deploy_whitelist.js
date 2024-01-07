const { deployProxy, admin } = require("@openzeppelin/truffle-upgrades");

const DexWhitelist = artifacts.require("DexWhitelist");

const owner = ""; // TODO: set

const proxyAdmin = ""; // TODO: set

const isLiquidityWlActive = false; // TODO: set
const isSwapWlActive = false; // TODO: set
const isFarmWlActive = false; // TODO: set
const isTokenWlActive = true; // TODO: set

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    console.log("Deploying ProxyAdmin and DexWhitelist...");
    let dexWhitelist = await deployProxy(DexWhitelist, [], {
        unsafeAllowCustomTypes: true,
    });
    console.log("DexWhitelistProxy: ", dexWhitelist.address);

    // activate all WLs
    console.log("Setting whitelist statuses...");
    await dexWhitelist.setWlActive(isLiquidityWlActive, isSwapWlActive, isFarmWlActive, isTokenWlActive);
    console.log("Whitelist statuses have been set");

    console.log("Adding deployer as Admin: ", curDeployer);
    await dexWhitelist.addAdmin(curDeployer);
    console.log("Admin has been added");

    // add new admin and manager
    console.log("Adding owner as Admin: ", owner);
    await dexWhitelist.addAdmin(owner);
    console.log("Admin has been added");

    console.log("Adding owner as Manager: ", owner);
    await dexWhitelist.addManager(owner);
    console.log("Manager has been added");

    if (owner.toLowerCase() !== curDeployer.toLowerCase()) {
        console.log("Removing deployer as Admin: ", curDeployer);
        await dexWhitelist.removeAdmin(curDeployer);
        console.log("Admin has been removed");

        console.log("Transferring ownership: ", owner);
        await dexWhitelist.transferOwnership(owner);
        console.log("Ownership has been transferred");
    }

    // transfer ProxyAdmin owner permission
    console.log("Transferring ProxyAdmin ownership to proxy admin account: ", proxyAdmin);
    await admin.changeProxyAdmin(dexWhitelist.address, proxyAdmin);
    console.log("Ownership has been transferred");
};
