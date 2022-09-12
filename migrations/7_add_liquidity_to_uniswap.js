const {
    BN,
    ether
} = require("@openzeppelin/test-helpers");

const IERC20 = artifacts.require("IERC20.sol");
const Router = artifacts.require("UniswapV2Router02.sol"); // for Router02
// const Router = artifacts.require("UniswapV2Router03.sol"); // for Router03

const routerAddress = ""; // TODO: set

const mode = "Token-ETH"; // "Token-ETH" or "Token-Token" TODO: set

// For add Token-ETH liquidity
const tokenAddress = ""; // TODO: set
const liquidityETH = ether("0"); // TODO: set
const liquidityToken = ether("0"); // TODO: set

// For add Token-Token liquidity
const token1Address = ""; // TODO: set
const token2Address = ""; // TODO: set
const liquidityToken1 = ether("0"); // TODO: set
const liquidityToken2 = ether("0"); // TODO: set
// const liquidityToken2 = new BN(1e2); // example for 2 decimals

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const user = accounts[0];

    let router = await Router.at(routerAddress);

    if(mode === "Token-ETH") {
        let token = await IERC20.at(tokenAddress);

        // approve tokens
        await token.approve(
          router.address,
          liquidityToken
        );
        console.log("Token approved for Router");

        // add ETH-Token liquidity
        await router.addLiquidityETH(
          token.address,
          liquidityToken,
          0,
          0,
          user,
          new BN(Date.now() / 1000 + 15 * 60),
          { value: liquidityETH }
        );
        console.log("added ETH-Token liquidity");
    } else if(mode === "Token-Token") {
        let token1 = await IERC20.at(token1Address);
        let token2 = await IERC20.at(token2Address);

        // approve token 1
        await token1.approve(
          router.address,
          liquidityToken1
        );
        console.log("Token 1 approved for Router");

        // approve token 2
        await token2.approve(
          router.address,
          liquidityToken2
        );
        console.log("Token 2 approved for Router");

        // add Token-Token liquidity
        await router.addLiquidity(
          token1.address,
          token2.address,
          liquidityToken1,
          liquidityToken2,
          0,
          0,
          user,
          new BN(Date.now() / 1000 + 15 * 60)
        );
        console.log("added Token-Token liquidity");
    } else {
        console.log("Error: please set correct mode variable");
    }
};
