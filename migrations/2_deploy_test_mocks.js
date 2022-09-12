const {
    BN,
    ether,
} = require("@openzeppelin/test-helpers");

const ERC20Mock = artifacts.require("ERC20FixedSupplyMock.sol");
const TokenFaucet = artifacts.require("TokenFaucet");

const tokenName = ""; // TODO: set
const tokenSymbol = ""; // TODO: set
const tokenSupply = ether(new BN(1e8));  // 100M, token with 18 decimals TODO: set

const withFaucetDeploy = false; // TODO: set
const faucetOwner = ""; // TODO: set
const tokenFaucetAmt = ether("1000"); // 1000 TODO: set
const tokenTransferAmt = ether(new BN(4.5e7)); // 45M TODO: set

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

	  // deploy token
    await deployer.deploy(ERC20Mock, tokenName, tokenSymbol, curDeployer, tokenSupply);
    let token = await ERC20Mock.deployed();
    console.log(`ERC20FixedSupplyMock_${ tokenSymbol }: `, token.address);

    // deploy TokenFaucet
    if(withFaucetDeploy) {
        await deployer.deploy(TokenFaucet);
        let tokenFaucet = await TokenFaucet.deployed();
        console.log("TokenFaucet: ", tokenFaucet.address);

        // set faucet gulp amount for token
        tokenFaucet.setAmt(token.address, tokenFaucetAmt);

        // transfer faucet ownership to new owner
        await tokenFaucet.transferOwnership(faucetOwner);

        // transfer token to TokenFaucet
        await token.transfer(
          tokenFaucet.address,
          tokenTransferAmt
        );
    }
};
