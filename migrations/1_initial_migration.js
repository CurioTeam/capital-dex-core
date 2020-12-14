const Migrations = artifacts.require("Migrations");

module.exports = function(deployer, network) {
  if (network === "test") return; // skip migrations if use test network

  deployer.deploy(Migrations);
};
