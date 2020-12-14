const fs = require("fs");
const path = require("path");

const { deployProxy, admin } = require("@openzeppelin/truffle-upgrades");

const DexWhitelist = artifacts.require("DexWhitelist");

const owner = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";
const manager = "0x622153C82dA8E31fB6193c0F8c2768a360f3Db18";

const proxyAdmin = "0xE006A0BB078291e539B3c7b9c8A8aF7f29215600";

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
    await dexWhitelist.setWlActive(true, true, true, true);

    await dexWhitelist.addAdmin(curDeployer);

    // add new admin and manager
    await dexWhitelist.addAdmin(owner);
    await dexWhitelist.addManager(owner);
    await dexWhitelist.addManager(manager);

    // transfer owner permission
    await dexWhitelist.removeAdmin(curDeployer);
    await dexWhitelist.transferOwnership(owner);

    // transfer ProxyAdmin owner permission
    await admin.changeProxyAdmin(dexWhitelist.address, proxyAdmin)

    // write addresses and ABI to files
    const contractsAddresses = {
        dexWhitelist: dexWhitelist.address,
        proxyAdmin: proxyAdmin
    };

    const contractsAbi = {
        dexWhitelist: dexWhitelist.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
        fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, `${network}_whitelist_addresses.json`), JSON.stringify(contractsAddresses, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_whitelist_abi.json`), JSON.stringify(contractsAbi, null, 2));
};
