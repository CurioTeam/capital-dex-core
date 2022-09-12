const {
    BN,
    ether,
    constants,
} = require("@openzeppelin/test-helpers");

const { ZERO_ADDRESS } = constants;

const ERC20Mock = artifacts.require("ERC20FixedSupplyMock.sol");

const Reservoir = artifacts.require("Reservoir");
const MasterChef = artifacts.require("MasterChef");
const IERC20 = artifacts.require("IERC20.sol");

const owner = ""; // TODO: set
const rewardTokenAddress = ""; // TODO: set
const dexWhitelistAddress = ""; // TODO: set

const rewardPerBlock = new BN("0"); // in wei TODO: set
// new BN("9.2592593e+15") - apr. 200k/mo for Kovan (1 block – 4 seconds)
// new BN("289351851851851851") - 50k/mo for Goerli (1 block - 15 seconds)
// new BN("289351851851851851") - 50k/mo for Mainnet (1 block - 15 seconds)

const startBlock = 0;
const bonusEndBlock = 0;

const initialReservoirSupply = ether(new BN("0")); // TODO: set if needed

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    // get RewardToken from address
    let rewardToken = await IERC20.at(rewardTokenAddress);

    // MasterChef deployment
    await deployer.deploy(MasterChef,
        rewardToken.address,
        ZERO_ADDRESS,
        rewardPerBlock,
        startBlock,
        bonusEndBlock,
        dexWhitelistAddress
    );
    let masterChef = await MasterChef.deployed();
    console.log("MasterChef: ", masterChef.address);

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
    await masterChef.add(
        ether("1"),
        dummyToken.address,
        false,
    );

    // Reservoir deployment
    await deployer.deploy(Reservoir,
        rewardToken.address,
        masterChef.address
    );
    let reservoir = await Reservoir.deployed();
    console.log("Reservoir: ", reservoir.address);

    // transfer RewardTokens to Reservoir
    if (initialReservoirSupply) {
        await rewardToken.transfer(
          reservoir.address,
          initialReservoirSupply
        );
    }

    // set Reservoir address to MasterChef
    await masterChef.setSushiReservoir(
        reservoir.address
    );

    // set WL to MasterChef
    await masterChef.setWhitelist(
        dexWhitelistAddress
    );

    // transfer owner permission
    await masterChef.transferOwnership(owner);
};
