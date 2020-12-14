const fs = require("fs");
const path = require("path");

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

const rewardTokenAddress = "0x2f4d4cFAb714e4573189B300293944673Fe0efF7";
const dexWhitelistAddress = "0xC8A46b066BC148E08c80cfc6638Ea1bC1774538c";

const rewardPerBlock = new BN("9.2592593e+15"); // apr. 200k/mo for KOVAN (1 block – 4 seconds)
const startBlock = 0;
const bonusEndBlock = 0;

const initialReservoirSupply = ether(new BN(4.8e6));

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

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

    // DummyToken deployment
    let dummyToken = await deployer.deploy(ERC20Mock,
        "DUMMY",
        "DUMMY",
        curDeployer,
        ether("1")
    );
    console.log("dummyToken address: ", dummyToken.address);

    // add reward to DummyToken
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

    // write addresses and ABI to files
    const contractsAddresses = {
        masterChef: masterChef.address,
        reservoir: reservoir.address,
        dummyToken: dummyToken.address,
        rewardTokenAddress: rewardTokenAddress,
        dexWhitelistAddress: dexWhitelistAddress
    };

    const contractsAbi = {
        masterChef: masterChef.abi,
        reservoir: reservoir.abi,
        dummyToken: dummyToken.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
        fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, `${network}_farming_addresses.json`), JSON.stringify(contractsAddresses, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_farming_abi.json`), JSON.stringify(contractsAbi, null, 2));
};
