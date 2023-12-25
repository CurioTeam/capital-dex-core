const DexWhitelist = artifacts.require("DexWhitelist");

const dexWhitelistProxyAddress = ""; // TODO: set

const tokensAddresses = [ // TODO: set
  ""
]

const tokensActiveStatuses = [ // TODO: set
    true
]

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    let dexWhitelist = await DexWhitelist.at(dexWhitelistProxyAddress);

    console.log("Adding token to whitelist...");
    await dexWhitelist.setTokenAddressesActive(
        tokensAddresses,
        tokensActiveStatuses,
    );
    console.log("Tokens have been added");
};
