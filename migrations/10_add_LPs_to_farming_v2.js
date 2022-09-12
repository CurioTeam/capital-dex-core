const {
    ether
} = require("@openzeppelin/test-helpers");

const IERC20 = artifacts.require("IERC20.sol");
const MasterChefV2 = artifacts.require("MasterChefV2.sol");

const masterChefV2Address = "0x3f52B3D865fEa5B5E7D4e814D05EDcBaDe2411Ee"; // TODO: set

// TODO: set
const pools = [{
        pid: 1,
        pair: "0x566982E84aCe98AAB455eB05A9942aE7A7587e6B",
        allocPoint: ether("1"),
    }, {
        pid: 2,
        pair: "0x033C131F330957F590F101CF217f7E659b8d073e",
        allocPoint: ether("1"),
    }
];

const dummyTokenAddress = "0xd7FbF9dc453Fe0B07458fd14843145f11254585e"; // TODO: set
const dummyTokenPid = 0;
const dummyAllocPoint = ether("4"); // 2/3 to DummyToken TODO: set

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

    await masterChefV2.set(
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
          masterChefV2.address,
          await pair.balanceOf(user)
        );
        console.log("approved LP: ", pool.pair);

        // deposit LP
        await masterChefV2.deposit(
          pool.pid,
          await pair.balanceOf(user)
        );
        console.log("deposited LP: ", pool.pair);
    }

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
};
