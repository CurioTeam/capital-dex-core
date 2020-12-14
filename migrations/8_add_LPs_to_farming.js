const fs = require("fs");
const path = require("path");

const {
    ether
} = require("@openzeppelin/test-helpers");

const IERC20 = artifacts.require("IERC20.sol");
const MasterChef = artifacts.require("MasterChef.sol");

// contract addresses
const tCGTtDAIPairAddress = "0x56e25a8b226789daa0297c602807b28e2d14a100";
const tCSCtDAIPairAddress = "0x1f992899a69b273821c53ea886f605c911b93995";
const tCURtDAIPairAddress = "0x83e1f7a2d21a54f846696d2b770ae293bdc2348e";
const kETHtDAIPairAddress = "0x2544df97c605184273367cfe513cd8f7c535c0d8";
const masterChefAddress = "0xAC83652E5BB9dbdBdb0e8DBb70d2230214fC203e";
const dummyTokenAddress = "0x055bb9f1ff0d624C5Df1117B08F517629B3c5540";

const dummyTokenPid = 0;
const tCGTtDAIPairPid = 1;
const tCSCtDAIPairPid = 2;
const tCURtDAIPairPid = 3;
const kETHtDAIPairPid = 4;

// allocPoints
const tCGTtDAIAllocPoint = ether("1");
const tCSCtDAIAllocPoint = ether("1");
const tCURtDAIAllocPoint = ether("1");
const kETHtDAIAllocPoint = ether("1");
const dummyAllocPoint = ether("8");     // 2/3 to DummyToken

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    // get tokens from addresses
    let tCGTtDAIPair  = await IERC20.at(tCGTtDAIPairAddress);
    let tCSCtDAIPair  = await IERC20.at(tCSCtDAIPairAddress);
    let tCURtDAIPair = await IERC20.at(tCURtDAIPairAddress);
    let kETHtDAIPair = await IERC20.at(kETHtDAIPairAddress);
    let dummyToken = await IERC20.at(dummyTokenAddress);

    // get MasterChef from address
    let masterChef = await MasterChef.at(masterChefAddress);

    // add tCGTtDAIPair to farming
    await masterChef.add(
        tCGTtDAIAllocPoint,
        tCGTtDAIPair.address,
        false,
    );
    console.log("added tCGTtDAIPair LP");

    // add tCSCtDAIPair to farming
    await masterChef.add(
        tCSCtDAIAllocPoint,
        tCSCtDAIPair.address,
        false,
    );
    console.log("added tCSCtDAIPair LP");

    // add tCURtDAIPair to farming
    await masterChef.add(
        tCURtDAIAllocPoint,
        tCURtDAIPair.address,
        false,
    );
    console.log("added tCURtDAIPair LP");

    // add kETHtDAIPair to farming
    await masterChef.add(
        kETHtDAIAllocPoint,
        kETHtDAIPair.address,
        false,
    );
    console.log("added kETHtDAIPair LP");

    // set DummyToken allocPoint
    await masterChef.set(
        dummyTokenPid,
        dummyAllocPoint,
        true,
    );
    console.log("set dummyToken LP");

    // approve tokens
    await tCGTtDAIPair.approve(
        masterChef.address,
        await tCGTtDAIPair.balanceOf(user)
    );
    await tCSCtDAIPair.approve(
        masterChef.address,
        await tCSCtDAIPair.balanceOf(user)
    );
    await tCURtDAIPair.approve(
        masterChef.address,
        await tCURtDAIPair.balanceOf(user)
    );
    await kETHtDAIPair.approve(
        masterChef.address,
        await kETHtDAIPair.balanceOf(user)
    );
    await dummyToken.approve(
        masterChef.address,
        await dummyToken.balanceOf(user)
    );
    console.log("all tokens approved");

    // deposit tCGTtDAIPair liquidity
    await masterChef.deposit(
        tCGTtDAIPairPid,
        await tCGTtDAIPair.balanceOf(user)
    );
    console.log("deposited tCGTtDAIPair LP");

    // deposit tCSCtDAIPair liquidity
    await masterChef.deposit(
        tCSCtDAIPairPid,
        await tCSCtDAIPair.balanceOf(user)
    );
    console.log("deposited tCSCtDAIPair LP");

    // deposit tCURtDAIPair liquidity
    await masterChef.deposit(
        tCURtDAIPairPid,
        await tCURtDAIPair.balanceOf(user)
    );
    console.log("deposited tCURtDAIPair LP");

    // deposit kETHtDAIPair liquidity
    await masterChef.deposit(
        kETHtDAIPairPid,
        await kETHtDAIPair.balanceOf(user)
    );
    console.log("deposited kETHtDAIPair LP");

    // deposit DummyToken liquidity
    await masterChef.deposit(
        dummyTokenPid,
        await dummyToken.balanceOf(user)
    );
    console.log("deposited dummyToken LP");

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
        kETHtDAIPairPid, kETHtDAIPairPid
    };

    const contractsAbi = {
        LP: dummyToken.abi
    };

    const deployDirectory = `${__dirname}/../deployed`;
    if (!fs.existsSync(deployDirectory)) {
        fs.mkdirSync(deployDirectory);
    }

    fs.writeFileSync(path.join(deployDirectory, `${network}_uniswap_LP_addresses.json`), JSON.stringify(contractsAddresses, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_farming_PID_addresses.json`), JSON.stringify(pid, null, 2));
    fs.writeFileSync(path.join(deployDirectory, `${network}_uniswap_LP_abi.json`), JSON.stringify(contractsAbi, null, 2));
};
