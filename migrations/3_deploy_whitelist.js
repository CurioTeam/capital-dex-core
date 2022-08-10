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

    let dexWhitelist = await deployProxy(DexWhitelist, [], {
        unsafeAllowCustomTypes: true,
    });
    console.log("DexWhitelistProxy: ", dexWhitelist.address);

    // activate all WLs
    await dexWhitelist.setWlActive(isLiquidityWlActive, isSwapWlActive, isFarmWlActive, isTokenWlActive);

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
