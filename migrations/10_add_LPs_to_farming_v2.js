const fs = require("fs");
const path = require("path");

const {
    ether
} = require("@openzeppelin/test-helpers");

const IERC20 = artifacts.require("IERC20.sol");
const MasterChefV2 = artifacts.require("MasterChefV2.sol");

// const owner = "0x5C064Bf2c4c3669068167E0DEF02D5318810BCE0"; // Mainnet admin (temp)

// Kovan
const tCGTtDAIPairAddress = "0x56e25a8b226789daa0297c602807b28e2d14a100";
const tCSCtDAIPairAddress = "0x1f992899a69b273821c53ea886f605c911b93995";
const tCURtDAIPairAddress = "0x83e1f7a2d21a54f846696d2b770ae293bdc2348e";
const kETHtDAIPairAddress = "0x2544df97c605184273367cfe513cd8f7c535c0d8";
const masterChefV2Address = "0xAC83652E5BB9dbdBdb0e8DBb70d2230214fC203e";
const dummyTokenAddress = "0x055bb9f1ff0d624C5Df1117B08F517629B3c5540";

const dummyTokenPid = 0;
const tCGTtDAIPairPid = 1;
const tCSCtDAIPairPid = 2;
const tCURtDAIPairPid = 3;
const kETHtDAIPairPid = 4;

const tCGTtDAIAllocPoint = ether("1");
const tCSCtDAIAllocPoint = ether("1");
const tCURtDAIAllocPoint = ether("1");
const kETHtDAIAllocPoint = ether("1");
const dummyAllocPoint = ether("8");     // 2/3 to DummyToken

// Mainnet
/*
const ETHCGTPairAddress = "0x9a7c27F2BfD86001c0E9B5b9096564F64F37439E";
const ETHCURPairAddress = "0x85323e31bCa3a8da8c5307671DDe878C4bBCDD36";
const CGTDAIPairAddress = "0xB9FcE07dB9737810CbC573E43ba700aA4655b6Bc";

const masterChefV2Address = "0xe8Cc9f640C55f3c5905FD2BBb63C53fb8A3A527d";
const dummyTokenAddress = "0x7F98372A9852fd04B17a5617F18a9C7cC0F2c4DE";

const dummyTokenPid = 0;
const ETHCGTPairPid = 1;
const ETHCURPairPid = 2;
const CGTDAIPairPid = 3;

const ETHCGTAllocPoint = ether("1");
const ETHCURAllocPoint = ether("1");
const CGTDAIAllocPoint = ether("1");
const dummyAllocPoint = ether("6");     // 2/3 to DummyToken
*/

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    // Mainnet
    /*
    let ETHCGTPair  = await IERC20.at(ETHCGTPairAddress);
    let ETHCURPair  = await IERC20.at(ETHCURPairAddress);
    let CGTDAIPair = await IERC20.at(CGTDAIPairAddress);
    let dummyToken = await IERC20.at(dummyTokenAddress);

    let masterChefV2 = await MasterChefV2.at(masterChefV2Address);

    await masterChefV2.add(
        ETHCGTAllocPoint,
        ETHCGTPair.address,
        false,
    );
    console.log("added ETHCGTPair LP");

    await masterChefV2.add(
        ETHCURAllocPoint,
        ETHCURPair.address,
        false,
    );
    console.log("added ETHCURPair LP");

    await masterChefV2.add(
        CGTDAIAllocPoint,
        CGTDAIPair.address,
        false,
    );
    console.log("added CGTDAIPair LP");

    await masterChefV2.set(
        dummyTokenPid,
        dummyAllocPoint,
        true,
    );
    console.log("set dummyToken LP");
    */

    // get tokens from addresses
    let tCGTtDAIPair  = await IERC20.at(tCGTtDAIPairAddress);
    let tCSCtDAIPair  = await IERC20.at(tCSCtDAIPairAddress);
    let tCURtDAIPair = await IERC20.at(tCURtDAIPairAddress);
    let kETHtDAIPair = await IERC20.at(kETHtDAIPairAddress);
    let dummyToken = await IERC20.at(dummyTokenAddress);

    // get MasterChefV2 from address
    let masterChefV2 = await MasterChefV2.at(masterChefV2Address);

    // add tCGTtDAIPair to farming
    await masterChefV2.add(
        tCGTtDAIAllocPoint,
        tCGTtDAIPair.address,
        false,
    );
    console.log("added tCGTtDAIPair LP");

    // add tCSCtDAIPair to farming
    await masterChefV2.add(
        tCSCtDAIAllocPoint,
        tCSCtDAIPair.address,
        false,
    );
    console.log("added tCSCtDAIPair LP");

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

    // approve tokens
    await tCGTtDAIPair.approve(
        masterChefV2.address,
        await tCGTtDAIPair.balanceOf(user)
    );
    await tCSCtDAIPair.approve(
        masterChefV2.address,
        await tCSCtDAIPair.balanceOf(user)
    );
    await tCURtDAIPair.approve(
        masterChefV2.address,
        await tCURtDAIPair.balanceOf(user)
    );
    await kETHtDAIPair.approve(
        masterChefV2.address,
        await kETHtDAIPair.balanceOf(user)
    );
    await dummyToken.approve(
        masterChefV2.address,
        await dummyToken.balanceOf(user)
    );
    console.log("all tokens approved");

    // deposit tCGTtDAIPair liquidity
    await masterChefV2.deposit(
        tCGTtDAIPairPid,
        await tCGTtDAIPair.balanceOf(user)
    );
    console.log("deposited tCGTtDAIPair LP");

    // deposit tCSCtDAIPair liquidity
    await masterChefV2.deposit(
        tCSCtDAIPairPid,
        await tCSCtDAIPair.balanceOf(user)
    );
    console.log("deposited tCSCtDAIPair LP");

    // deposit tCURtDAIPair liquidity
    await masterChefV2.deposit(
        tCURtDAIPairPid,
        await tCURtDAIPair.balanceOf(user)
    );
    console.log("deposited tCURtDAIPair LP");

    // deposit kETHtDAIPair liquidity
    await masterChefV2.deposit(
        kETHtDAIPairPid,
        await kETHtDAIPair.balanceOf(user)
    );
    console.log("deposited kETHtDAIPair LP");

    // deposit DummyToken liquidity
    await masterChefV2.deposit(
        dummyTokenPid,
        await dummyToken.balanceOf(user)
    );
    console.log("deposited dummyToken LP");

    // Mainnet
    /*
    const contractsAddresses = {
        dummyTokenAddress: dummyTokenAddress,
        ETHCGTPairAddress: ETHCGTPairAddress,
        ETHCURPairAddress: ETHCURPairAddress,
        CGTDAIPairAddress: CGTDAIPairAddress,
    };

    const pid = {
        dummyTokenPid: dummyTokenPid,
        ETHCGTPairPid: ETHCGTPairPid,
        ETHCURPairPid: ETHCURPairPid,
        CGTDAIPairPid: CGTDAIPairPid,
    };
    */

    // write addresses, PIDs and ABI to files
    const contractsAddresses = {
        dummyTokenAddress: dummyTokenAddress,
        tCGTtDAIPairAddress: tCGTtDAIPairAddress,
        tCSCtDAIPairAddress: tCSCtDAIPairAddress,
        tCURtDAIPairAddress: tCURtDAIPairAddress,
        kETHtDAIPairAddress: kETHtDAIPairAddress
    };

    const pid = {
        dummyTokenPid: dummyTokenPid,
        tCGTtDAIPairPid: tCGTtDAIPairPid,
        tCSCtDAIPairPid: tCSCtDAIPairPid,
        tCURtDAIPairPid: tCURtDAIPairPid,
        kETHtDAIPairPid: kETHtDAIPairPid
    };

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
