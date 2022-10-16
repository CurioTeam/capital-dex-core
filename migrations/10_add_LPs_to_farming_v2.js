const {
    BN,
    ether
} = require("@openzeppelin/test-helpers");

const IERC20 = artifacts.require("IERC20.sol");
const MasterChefV2 = artifacts.require("MasterChefV2.sol");

const masterChefV2Address = ""; // TODO: set

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

const dummyTokenAddress = ""; // TODO: set
const dummyTokenPid = 0;
const dummyAllocPoint = ether("0"); // TODO: set

const withLPDeposit = false; // TODO: set

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    const masterChefV2 = await MasterChefV2.at(masterChefV2Address);

    console.log("Adding pairs...");

    for (const pool of pools) {
        await masterChefV2.add(
          pool.allocPoint,
          pool.pair,
          false,
        );
        console.log("added pair: ", pool.pair);
    }

    if (dummyTokenAddress !== "") {
        console.log("Setting dummyToken LP...");
        await masterChefV2.set(
          dummyTokenPid,
          dummyAllocPoint,
          true,
        );
        console.log("set dummyToken LP");
    }

    if (withLPDeposit) {
        console.log("Depositing LP tokens...");

        // stake LP to pools
        for (const pool of pools) {
            let pair  = await IERC20.at(pool.pair);

            const amount = (await pair.balanceOf(user)).div(new BN("2"));

            // approve tokens
            await pair.approve(
              masterChefV2.address,
              amount
            );
            console.log("approved LP: ", pool.pair);

            // deposit LP
            await masterChefV2.deposit(
              pool.pid,
              amount
            );
            console.log("deposited LP: ", pool.pair);
        }
    }

    if (dummyTokenAddress !== "") {
        console.log("Depositing dummyToken ...");

        let dummyToken = await IERC20.at(dummyTokenAddress);

        // approve tokens
        await dummyToken.approve(
          masterChefV2.address,
          await dummyToken.balanceOf(user)
        );
        console.log("dummyToken approved");

        // deposit DummyToken liquidity
        await masterChefV2.deposit(
          dummyTokenPid,
          await dummyToken.balanceOf(user)
        );
        console.log("deposited dummyToken");
    }
};
