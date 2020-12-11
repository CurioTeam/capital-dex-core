const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const DexWhitelist = artifacts.require('DexWhitelist');

const owner = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";
const manager = "0x622153C82dA8E31fB6193c0F8c2768a360f3Db18";

module.exports = async function(deployer) {
    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];
    
    let dexWhitelist = await deployProxy(DexWhitelist, [], {
        unsafeAllowCustomTypes: true,
    });
    console.log("dexWhitelist address: ", dexWhitelist.address);

    // activate all WLs
    await dexWhitelist.setWlActive(true, true, true, true);

    await dexWhitelist.addAdmin(curDeployer);

    // add new admin and manager
    await dexWhitelist.addAdmin(owner);
    await dexWhitelist.addManager(owner);
    await dexWhitelist.addManager(manager);

    // transfer owner permission
    await dexWhitelist.removeAdmin(curDeployer);
    await dexWhitelist.transferOwnership(owner);
};