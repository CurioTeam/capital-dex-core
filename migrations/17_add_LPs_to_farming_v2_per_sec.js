const {
    ether
} = require("@openzeppelin/test-helpers");

const MasterChefV2PerSec = artifacts.require("MasterChefV2PerSec.sol");

const masterChefV2PerSecAddress = ""; // TODO: set

// TODO: set
const pools = [{
        pid: 0,
        pair: "",
        allocPoint: ether("1"),
    }, {
        pid: 1,
        pair: "",
        allocPoint: ether("1"),
    }
];

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    const masterChefV2 = await MasterChefV2PerSec.at(masterChefV2PerSecAddress);

    console.log("Adding pairs...");

    for (const pool of pools) {
        await masterChefV2.add(
          pool.allocPoint,
          pool.pair,
          false,
        );
        console.log("added pair: ", pool.pair);
    }
};
