const Multicall = artifacts.require("Multicall.sol");

module.exports = async function(deployer, network) {
    if (network === "test") return; // skip migrations if use test network

    // get the current deployer address
    const accounts = await web3.eth.getAccounts();
    const curDeployer = accounts[0];

    console.log("Deployer:", curDeployer);
    console.log("Balance:", (await web3.eth.getBalance(curDeployer)).toString());

    // Multicall deployment
    await deployer.deploy(Multicall);
    let multicall = await Multicall.deployed();

    console.log("multicall address: ", multicall.address);
};
