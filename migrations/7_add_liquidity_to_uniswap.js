const {
    BN,
    ether
} = require("@openzeppelin/test-helpers");

const IERC20 = artifacts.require("IERC20.sol");
const UniswapRouter = artifacts.require("UniswapV2Router02.sol");

// contract addresses
const tCGTAddress = "0x2f4d4cFAb714e4573189B300293944673Fe0efF7";
const tCSCAddress = "0x558FC7FA5471Ff77c56b9cB37207d099EAcE8379";
const tCURAddress = "0x42Bbfc77Ee4Ed0efC608634859a672D0cf49e1b4";
const tDAIAddress = "0x330294de10bAd15f373BA7429Ab9685eDe43c13f";
const uniswapRouterAddress = "0x1D49fBafB74bC4dbcECD737741c1CEA96E7f8142";

// tCGT liquidity (amount)
const tCGTLiquidity = ether(new BN(2e6));
const tCGTLiquidityTotDAI = ether(new BN(4e6));

// tCSC liquidity (amount)
const tCSCLiquidity = ether(new BN(2e6));
const tCSCLiquidityTotDAI = ether(new BN(2e6));

// tCUR liquidity (amount)
const tCURLiquidity = ether(new BN(0.2e6));
const tCURLiquidityTotDAI = ether(new BN(0.15e6));

// kETH liquidity (amount)
const kETHLiquidity = ether("0.5");
const kETHLiquidityTotDAI = ether("292.5");

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    // get tokens from addresses
    let tCGT = await IERC20.at(tCGTAddress);
    let tCSC = await IERC20.at(tCSCAddress);
    let tCUR = await IERC20.at(tCURAddress);
    let tDAI = await IERC20.at(tDAIAddress);

    // get UniswapRouter from address
    let uniswapRouter = await UniswapRouter.at(uniswapRouterAddress);

    // approve tokens
    await tCGT.approve(
        uniswapRouter.address,
        tCGTLiquidity
    );
    await tCSC.approve(
        uniswapRouter.address,
        tCSCLiquidity
    );
    await tCUR.approve(
        uniswapRouter.address,
        tCURLiquidity
    );
    await tDAI.approve(
        uniswapRouter.address,
        tCGTLiquidityTotDAI
        .add(tCSCLiquidityTotDAI)
        .add(tCURLiquidityTotDAI)
        .add(kETHLiquidityTotDAI)
    );

    // add tCGT-tDAI liquidity
    await uniswapRouter.addLiquidity(
        tCGT.address,
        tDAI.address,
        tCGTLiquidity,
        tCGTLiquidityTotDAI,
        0,
        0,
        user,
        new BN(Date.now() / 1000 + 15 * 60)
    );
    console.log("added tCGT-tDAI liquidity");

    // add tCSC-tDAI liquidity
    await uniswapRouter.addLiquidity(
        tCSC.address,
        tDAI.address,
        tCSCLiquidity,
        tCSCLiquidityTotDAI,
        0,
        0,
        user,
        new BN(Date.now() / 1000 + 15 * 60)
    );
    console.log("added tCSC-tDAI liquidity");

    // add tCUR-tDAI liquidity
    await uniswapRouter.addLiquidity(
        tCUR.address,
        tDAI.address,
        tCURLiquidity,
        tCURLiquidityTotDAI,
        0,
        0,
        user,
        new BN(Date.now() / 1000 + 15 * 60)
    );
    console.log("added tCUR-tDAI liquidity");

    // add tDAI-kETH liquidity
    await uniswapRouter.addLiquidityETH(
        tDAI.address,
        kETHLiquidityTotDAI,
        0,
        0,
        user,
        new BN(Date.now() / 1000 + 15 * 60),
        { value: kETHLiquidity }
    );
    console.log("added tDAI-kETH liquidity");
};
