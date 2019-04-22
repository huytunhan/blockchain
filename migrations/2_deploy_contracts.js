var DM_Factory = artifacts.require("./DM_Factory.sol");
var DM_Store = artifacts.require("./DM_Store.sol");
var DM_Farm = artifacts.require("./DM_Farm.sol");

module.exports = function(deployer) {
    deployer.deploy(DM_Factory);
    deployer.deploy(DM_Farm);
    deployer.deploy(DM_Store);
};
