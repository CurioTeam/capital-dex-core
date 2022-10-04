const {
    BN,
    ether,
    constants,
} = require("@openzeppelin/test-helpers");

const { ZERO_ADDRESS } = constants;

const ERC20Mock = artifacts.require("ERC20FixedSupplyMock.sol");

const Reservoir = artifacts.require("Reservoir");
const MasterChefV2PerSec = artifacts.require("MasterChefV2PerSec");
const IERC20 = artifacts.require("IERC20.sol");

const owner = ""; // TODO: set
const rewardTokenAddress = ""; // TODO: set
const dexWhitelistAddress = ""; // TODO: set

const rewardPerSec = new BN("0"); // in wei TODO: set
// new BN("3858024691358024") - 10,000 tokens with 18 decimals / 30 days
// new BN("19290123456790120") - 50,000 tokens with 18 decimals / 30 days

const transferRewardTokens = false; // TODO: set true if needed transfer reward token to Reservoir
const initialReservoirSupply = ether("0"); // TODO: set if needed

const dummyDeployment = false; // TODO: set true if needed dummy token deployment

const startTimestamp = 0;
const bonusEndTimestamp = 0;

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    // get RewardToken from address
    let rewardToken = await IERC20.at(rewardTokenAddress);

    // MasterChefV2PerSec deployment
    await deployer.deploy(MasterChefV2PerSec,
        rewardToken.address,
        ZERO_ADDRESS,
        rewardPerSec,
        startTimestamp,
        bonusEndTimestamp,
        dexWhitelistAddress
    );
    let masterChefV2PerSec = await MasterChefV2PerSec.deployed();
    console.log("MasterChefV2PerSec: ", masterChefV2PerSec.address);

    if (dummyDeployment) {
        // DummyToken deployment
        await deployer.deploy(ERC20Mock,
          "DUMMY",
          "DUMMY",
          curDeployer,
          ether("1")
        );
        let dummyToken = await ERC20Mock.deployed();
        console.log("ERC20FixedSupplyMock_DUMMY: ", dummyToken.address);

        // add reward to DummyToken
        console.log("Adding dummyToken pool...");
        await masterChefV2PerSec.add(
          ether("1"),
          dummyToken.address,
          false,
        );
        console.log("dummyToken pool added");
    }

    // Reservoir deployment
    await deployer.deploy(Reservoir,
        rewardToken.address,
        masterChefV2PerSec.address
    );
    let reservoir = await Reservoir.deployed();
    console.log("Reservoir: ", reservoir.address);

    // transfer RewardTokens to Reservoir
    if (transferRewardTokens) {
        console.log("Transferring initialReservoirSupply to Reservoir...");
        await rewardToken.transfer(
          reservoir.address,
          initialReservoirSupply
        );
        console.log("initialReservoirSupply transferred");
    }

    // set Reservoir address to MasterChefV2PerSec
    console.log("Setting reservoir in MasterChefV2PerSec...");
    await masterChefV2PerSec.setSushiReservoir(
        reservoir.address
    );
    console.log("Reservoir has been set");

    // set WL to MasterChefV2PerSec
    console.log("Setting whitelist in MasterChefV2PerSec...");
    await masterChefV2PerSec.setWhitelist(
        dexWhitelistAddress
    );
    console.log("Whitelist has been set");

    // transfer owner permission
    console.log("Transferring ownership of MasterChefV2PerSec...");
    await masterChefV2PerSec.transferOwnership(owner);
    console.log("Ownership transferred");
};
