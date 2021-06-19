const fs = require("fs");
const path = require("path");

const {
    ether
} = require("@openzeppelin/test-helpers");

const IERC20 = artifacts.require("IERC20.sol");
const MasterChefV2 = artifacts.require("MasterChefV2.sol");

// Kovan
const tCURtDAIPairAddress = "0x83e1f7a2d21a54f846696d2b770ae293bdc2348e";
const kETHtDAIPairAddress = "0x2544df97c605184273367cfe513cd8f7c535c0d8";
const masterChefV2Address = "0xb2253eF8238C5EF57aFeb0ffC90Ae7825445FdF0";
const dummyTokenAddress = "0xf27f67Fa3bd61065BEd50254ccD84f2C518Ebdb4";

const dummyTokenPid = 0;
const tCURtDAIPairPid = 1;
const kETHtDAIPairPid = 2;

const tCURtDAIAllocPoint = ether("1");
const kETHtDAIAllocPoint = ether("1");
const dummyAllocPoint = ether("4");     // 2/3 to DummyToken

/*
// Mainnet
const CGTwCT1PairAddress = "0xf67c990798221fdf41a4e77b6be2ce5c87df771e";
const CGTLINKPairAddress = "0x6456f0176d27265c8b530aacfc1fdadae3d60b04";
const CGTUNIPairAddress = "0x7e6bace61d6f504e2ce186025309676f461d44b8";
const CGT1INCHPairAddress = "0xe2817e5edf6f8260f24c3ace81a0fbd49f67765f";
const CGTXCHFPairAddress = "0x88682534fcf23111bb1cfeec7d4f699b9c9bef90";
const CGTCSCPairAddress = "0x7ca174ee6e7bc23e59747177244a44465f4e432b";

const masterChefV2Address = "0xE115e56a5a725E1fEbf17820E8fb5Ad8f17d5cF1";
const dummyTokenAddress = "0x15eBf077A6245Ad9C0003A52BcD3C0f5a516740b";

const dummyTokenPid = 0;
const CGTwCT1PairPid = 1;
const CGTLINKPairPid = 2;
const CGTUNIPairPid = 3;
const CGT1INCHPairPid = 4;
const CGTXCHFPairPid = 5;
const CGTCSCPairPid = 6;

const CGTwCT1AllocPoint = ether("1");
const CGTLINKAllocPoint = ether("1");
const CGTUNIAllocPoint = ether("1");
const CGT1INCHAllocPoint = ether("1");
const CGTXCHFAllocPoint = ether("1");
const CGTCSCAllocPoint = ether("1");
const dummyAllocPoint = ether("12");     // 2/3 to DummyToken
*/

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    let dummyToken;

    if (network === "mainnet") {
        /*
        let CGTwCT1Pair  = await IERC20.at(CGTwCT1PairAddress);
        let CGTLINKPair  = await IERC20.at(CGTLINKPairAddress);
        let CGTUNIPair = await IERC20.at(CGTUNIPairAddress);
        let CGT1INCHPair  = await IERC20.at(CGT1INCHPairAddress);
        let CGTXCHFPair = await IERC20.at(CGTXCHFPairAddress);
        let CGTCSCPair = await IERC20.at(CGTCSCPairAddress);
        dummyToken = await IERC20.at(dummyTokenAddress);

        let masterChefV2 = await MasterChefV2.at(masterChefV2Address);

        await masterChefV2.add(
            CGTwCT1AllocPoint,
            CGTwCT1Pair.address,
            false,
        );
        console.log("added CGTwCTPair LP");

        await masterChefV2.add(
            CGTLINKAllocPoint,
            CGTLINKPair.address,
            false,
        );
        console.log("added CGTLINKPair LP");

        await masterChefV2.add(
            CGTUNIAllocPoint,
            CGTUNIPair.address,
            false,
        );
        console.log("added CGTUNIPair LP");

        await masterChefV2.add(
            CGT1INCHAllocPoint,
            CGT1INCHPair.address,
            false,
        );
        console.log("added CGT1INCHPair LP");

        await masterChefV2.add(
            CGTXCHFAllocPoint,
            CGTXCHFPair.address,
            false,
        );
        console.log("added CGTXCHFPair LP");

        await masterChefV2.add(
            CGTCSCAllocPoint,
            CGTCSCPair.address,
            false,
        );
        console.log("added CGTCSCPair LP");

        await masterChefV2.set(
            dummyTokenPid,
            dummyAllocPoint,
            true,
        );
        console.log("set dummyToken LP");
        */
    } else {
        // get tokens from addresses
        let tCURtDAIPair = await IERC20.at(tCURtDAIPairAddress);
        let kETHtDAIPair = await IERC20.at(kETHtDAIPairAddress);
        dummyToken = await IERC20.at(dummyTokenAddress);

        // get MasterChefV2 from address
        let masterChefV2 = await MasterChefV2.at(masterChefV2Address);

        // add tCURtDAIPair to farming
        await masterChefV2.add(
            tCURtDAIAllocPoint,
            tCURtDAIPair.address,
            false,
        );
        console.log("added tCURtDAIPair LP");

        // add kETHtDAIPair to farming
        await masterChefV2.add(
            kETHtDAIAllocPoint,
            kETHtDAIPair.address,
            false,
        );
        console.log("added kETHtDAIPair LP");

        // set DummyToken allocPoint
        await masterChefV2.set(
            dummyTokenPid,
            dummyAllocPoint,
            true,
        );
        console.log("set dummyToken LP");

        // approve DummyToken
        await dummyToken.approve(
            masterChefV2.address,
            await dummyToken.balanceOf(user)
        );
        console.log("Dummy token approved");

        // deposit DummyToken liquidity
        await masterChefV2.deposit(
            dummyTokenPid,
            await dummyToken.balanceOf(user)
        );
        console.log("deposited dummyToken LP");
    }

    // write addresses, PIDs and ABI to files
    let contractsAddresses;
    let pid;

    if (network === "mainnet") {
    /*
        contractsAddresses = {
            dummyTokenAddress: dummyTokenAddress,
            CGTwCT1PairAddress: CGTwCT1PairAddress,
            CGTLINKPairAddress: CGTLINKPairAddress,
            CGTUNIPairAddress: CGTUNIPairAddress,
            CGT1INCHPairAddress: CGT1INCHPairAddress,
            CGTXCHFPairAddress: CGTXCHFPairAddress,
            CGTCSCPairAddress: CGTCSCPairAddress,
        };

        const pid = {
            dummyTokenPid: dummyTokenPid,
            CGTwCT1PairPid: CGTwCT1PairPid,
            CGTLINKPairPid: CGTLINKPairPid,
            CGTUNIPairPid: CGTUNIPairPid,
            CGT1INCHPairPid: CGT1INCHPairPid,
            CGTXCHFPairPid: CGTXCHFPairPid,
            CGTCSCPairPid: CGTCSCPairPid,
        };
    */
    } else {
        contractsAddresses = {
            dummyTokenAddress: dummyTokenAddress,
            tCURtDAIPairAddress: tCURtDAIPairAddress,
            kETHtDAIPairAddress: kETHtDAIPairAddress
        };

        pid = {
            dummyTokenPid: dummyTokenPid,
            tCURtDAIPairPid: tCURtDAIPairPid,
            kETHtDAIPairPid: kETHtDAIPairPid
        };
    }

    const contractsAbi = {
        LP: dummyToken.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
        fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, `${network}_uniswap_LP_farming_v2_addresses.json`), JSON.stringify(contractsAddresses, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_farming_v2_PID_addresses.json`), JSON.stringify(pid, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_erc20_abi.json`), JSON.stringify(contractsAbi, null, 2));
};
