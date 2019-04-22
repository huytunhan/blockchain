var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = "C2F460CC423A42895B2E767C76EA3E9CB8ADCAF179A355F314C188CE307B9381";

module.exports = {
    networks:
        {
            development: {
                host: "127.0.0.1",
                port: 7545,
                network_id: "5777" // Match any network id
            },
            ropsten: {
                provider:
                new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/d3abb20888f24aa2948e9507107d8e43"),
                network_id: '3',
            },
            main: {
                provider:
                new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/d3abb20888f24aa2948e9507107d8e43"),
                network_id: '1',
            }
        }
};

