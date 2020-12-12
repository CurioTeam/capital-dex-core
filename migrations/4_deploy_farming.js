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

const owner = "0xB844C65F3E161061bA5D5dD8497B3C04B71c4c83";

const rewardTokenAddress = "0x6ac3698da68a8e3eF7FB3EEC6E688d904DF21146";
const dexWhitelistAddress = "0x56D11549597a6685D48CFE9B571A66F7b819B9D9";

const rewardPerBlock = new BN("9.2592593e+15"); // apr. 200k/mo for KOVAN
const startBlock = 0;
const bonusEndBlock = 0;

const initialReservoirSupply = ether(new BN(4.8e6));

module.exports = async function(deployer) {
    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    // get RewardToken from address
    let rewardToken = await IERC20.at(rewardTokenAddress);

    // MasterChef deployment
    let masterChef = await deployer.deploy(MasterChef,
        rewardToken.address,
        ZERO_ADDRESS,
        rewardPerBlock,
        startBlock,
        bonusEndBlock,
        dexWhitelistAddress
    );
    console.log("masterChef address: ", masterChef.address);

    // add 2/3 reward to DummyToken
    let dummyToken = await deployer.deploy(ERC20Mock,
        "DUMMY",
        "DUMMY",
        curDeployer,
        ether("1")
    );
    await masterChef.add(
        ether("1"),
        dummyToken.address,
        false,
    );

    // Reservoir deployment
    let reservoir = await deployer.deploy(Reservoir,
        rewardToken.address,
        masterChef.address
    );
    console.log("reservoir address: ", reservoir.address);

    // transfer RewardTokens to Reservoir
    await rewardToken.transfer(
        reservoir.address,
        initialReservoirSupply
    );

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