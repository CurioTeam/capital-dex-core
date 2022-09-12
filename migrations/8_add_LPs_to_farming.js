const {
    ether
} = require("@openzeppelin/test-helpers");

const IERC20 = artifacts.require("IERC20.sol");
const MasterChef = artifacts.require("MasterChef.sol");

const masterChefAddress = ""; // TODO: set

// TODO: set
const pools = [{
        pid: 1,
        pair: "",
        allocPoint: ether("1"),
    }, {
        pid: 2,
        pair: "",
        allocPoint: ether("1"),
    }, {
        pid: 3,
        pair: "",
        allocPoint: ether("1"),
    },
];

const dummyTokenAddress = ""; // TODO: set
const dummyTokenPid = 0;
const dummyAllocPoint = ether("6"); // 2/3 to DummyToken TODO: set

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    const masterChef = await MasterChef.at(masterChefAddress);

    console.log("Adding pairs...");

    for (const pool of pools) {
        await masterChef.add(
          pool.allocPoint,
          pool.pair,
          false,
        );
        console.log("added pair: ", pool.pair);
    }

    await masterChef.set(
      dummyTokenPid,
      dummyAllocPoint,
      true,
    );
    console.log("set dummyToken LP");

    console.log("Depositing LP tokens...");

    // stake LP to pools
    for (const pool of pools) {
        let pair  = await IERC20.at(pool.pair);

        // approve tokens
        await pair.approve(
          masterChef.address,
          await pair.balanceOf(user)
        );
        console.log("approved LP: ", pool.pair);

        // deposit LP
        await masterChef.deposit(
          pool.pid,
          await pair.balanceOf(user)
        );
        console.log("deposited LP: ", pool.pair);
    }

    console.log("Depositing dummyToken ...");

    let dummyToken = await IERC20.at(dummyTokenAddress);

    // approve tokens
    await dummyToken.approve(
      masterChef.address,
      await dummyToken.balanceOf(user)
    );
    console.log("dummyToken approved");


    // deposit DummyToken liquidity
    await masterChef.deposit(
        dummyTokenPid,
        await dummyToken.balanceOf(user)
    );
    console.log("deposited dummyToken");
};
