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
const MasterChefV2 = artifacts.require("MasterChefV2");
const IERC20 = artifacts.require("IERC20.sol");

// Kovan
const rewardTokenAddress = "0x2f4d4cFAb714e4573189B300293944673Fe0efF7";
const dexWhitelistAddress = "0xC8A46b066BC148E08c80cfc6638Ea1bC1774538c";
const rewardPerBlock = new BN("9.2592593e+15"); // 200k/mo for KOVAN (1 block – 4 seconds)
const initialReservoirSupply = ether(new BN(4.8e6));

/*
// Mainnet
const rewardTokenAddress = "0xF56b164efd3CFc02BA739b719B6526A6FA1cA32a"; // Mainnet CGT
const dexWhitelistAddress = "0xB2C747Aed3e54da0ad14D41B710CC40F88E51aA9";
const rewardPerBlock = new BN("289351851851851851"); // 50k/mo for Mainnet (1 block - 15 seconds)
const initialReservoirSupply = ether(new BN(0)); // not used in migration
*/

// SKALE Mainnet
// const rewardTokenAddress = "0x134EbAb7883dFa9D04d20674dd8A8A995fB40Ced"; // SKALE Mainnet CGT
// const dexWhitelistAddress = "0x1Da4933B725Afc12C6cCA017d71bBb06d5b096Ef";
// const rewardPerBlock = new BN("0"); // 50k/mo for Mainnet (1 block - 15 seconds)
// const initialReservoirSupply = ether(new BN(0)); // not used in migration

// SKALE Testnet V2
// const rewardTokenAddress = "0x026aAED0178856f93a4eB4Bec1ab2A86eFf29222"; // SKALE Testnet V2 CGT
// const dexWhitelistAddress = "0xB7092f6ED01f56BA19d78D225E26aDfa9974F9d5";
// const rewardPerBlock = new BN("0");
// const initialReservoirSupply = ether(new BN(0)); // not used in migration

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
    console.log("masterChefV2 address: ", masterChefV2.address);

    // DummyToken deployment
    /*
    await deployer.deploy(ERC20Mock,
        "DUMMY",
        "DUMMY",
        curDeployer,
        ether("1")
    );
    let dummyToken = await ERC20Mock.deployed();
    console.log("dummyToken address: ", dummyToken.address);
    */

    // add reward to DummyToken
    /*
    await masterChefV2.add(
        ether("1"),
        dummyToken.address,
        false,
    );
    */

    // Reservoir deployment
    await deployer.deploy(Reservoir,
        rewardToken.address,
        masterChefV2.address
    );
    let reservoir = await Reservoir.deployed();
    console.log("reservoir address: ", reservoir.address);

    // Testnet only
    // transfer RewardTokens to Reservoir
    /*
    if (network !== "mainnet" && network !== "skale_mainnet") {
        await rewardToken.transfer(
            reservoir.address,
            initialReservoirSupply
        );
    }
    */

    // set Reservoir address to MasterChefV2
    await masterChefV2.setSushiReservoir(
        reservoir.address
    );

    // set WL to MasterChefV2
    await masterChefV2.setWhitelist(
        dexWhitelistAddress
    );

    // write addresses and ABI to files
    const contractsAddresses = {
        masterChefV2: masterChefV2.address,
        reservoir: reservoir.address,
        // dummyToken: dummyToken.address,
        rewardTokenAddress: rewardTokenAddress,
        dexWhitelistAddress: dexWhitelistAddress
    };

    const contractsAbi = {
        masterChefV2: masterChefV2.abi,
        reservoir: reservoir.abi,
        // dummyToken: dummyToken.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
        fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, `${network}_farming_v2_addresses.json`), JSON.stringify(contractsAddresses, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_farming_v2_abi.json`), JSON.stringify(contractsAbi, null, 2));
};
