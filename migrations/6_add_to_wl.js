const { utf8ToHex } = web3.utils;

const DexWhitelist = artifacts.require("DexWhitelist");

const dexWhitelistAddress = "0xC8A46b066BC148E08c80cfc6638Ea1bC1774538c";

const tCGTAddress = "0x2f4d4cFAb714e4573189B300293944673Fe0efF7";
const tCSCAddress = "0x558FC7FA5471Ff77c56b9cB37207d099EAcE8379";
const tCURAddress = "0x42Bbfc77Ee4Ed0efC608634859a672D0cf49e1b4";
const tDAIAddress = "0x330294de10bAd15f373BA7429Ab9685eDe43c13f";
const wethAddress = "0xd0A1E359811322d97991E03f863a0C30C2cF029C";   // KOVAN WETH address

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const admin = accounts[0];

    // create users
    let users = {
        admin: {
            key: utf8ToHex('admin'),
            keyNormalize: utf8ToHex('admin').padEnd(66, '0'),
            address: admin,
        }
    };

    // get dexWhitelist from address
    let dexWhitelist = await DexWhitelist.at(dexWhitelistAddress);

    // add admin to whitelist
    await dexWhitelist.addNewInvestors(
        [users.admin.key],
        [users.admin.address],
    );

    // add tokens to whitelist
    await dexWhitelist.setTokenAddressesActive(
        [tCGTAddress, tCSCAddress, tCURAddress, tDAIAddress, wethAddress],
        [true, true, true, true, true],
    );
};
