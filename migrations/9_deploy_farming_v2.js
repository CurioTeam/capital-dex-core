const {
    BN,
    ether,
    constants,
} = require("@openzeppelin/test-helpers");

const { ZERO_ADDRESS } = constants;

const ERC20Mock = artifacts.require("ERC20FixedSupplyMock.sol");

const Reservoir = artifacts.require("Reservoir");
const MasterChefV2 = artifacts.require("MasterChefV2");
const IERC20 = artifacts.require("IERC20.sol");

const owner = ""; // TODO: set
const rewardTokenAddress = ""; // TODO: set
const dexWhitelistAddress = ""; // TODO: set

const rewardPerBlock = new BN("0"); // in wei TODO: set
// new BN("9.2592593e+15") - apr. 200k/mo for Kovan (1 block – 4 seconds)
// new BN("289351851851851851") - 50k/mo for Goerli (1 block - 15 seconds)
// new BN("289351851851851851") - 50k/mo for Mainnet (1 block - 15 seconds)

const transferRewardTokens = false; // TODO: set true if needed transfer reward token to Reservoir
const initialReservoirSupply = ether(new BN("0")); // TODO: set if needed

const dummyDeployment = false; // TODO: set true if needed dummy token deployment

const startBlock = 0;
const bonusEndBlock = 0;

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    // get RewardToken from address
    let rewardToken = await IERC20.at(rewardTokenAddress);

    // MasterChefV2 deployment
    await deployer.deploy(MasterChefV2,
        rewardToken.address,
        ZERO_ADDRESS,
        rewardPerBlock,
        startBlock,
        bonusEndBlock,
        dexWhitelistAddress
    );
    let masterChefV2 = await MasterChefV2.deployed();
    console.log("MasterChefV2: ", masterChefV2.address);

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
        await masterChefV2.add(
          ether("1"),
          dummyToken.address,
          false,
        );
        console.log("dummyToken pool added");
    }

    // Reservoir deployment
    await deployer.deploy(Reservoir,
        rewardToken.address,
        masterChefV2.address
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

    // set Reservoir address to MasterChefV2
    console.log("Setting reservoir in MasterChefV2...");
    await masterChefV2.setSushiReservoir(
        reservoir.address
    );
    console.log("Reservoir has been set");

    // set WL to MasterChefV2
    console.log("Setting whitelist in MasterChefV2...");
    await masterChefV2.setWhitelist(
        dexWhitelistAddress
    );
    console.log("Whitelist has been set");

    // transfer owner permission
    console.log("Transferring ownership of MasterChefV2...");
    await masterChefV2.transferOwnership(owner);
    console.log("Ownership transferred");
};
