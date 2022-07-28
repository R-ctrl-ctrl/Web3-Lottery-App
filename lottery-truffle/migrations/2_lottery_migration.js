const Lottery = artifacts.require("Lottery");

module.exports = function (deployer) {
  deployer.deploy(Lottery,8728);
};
