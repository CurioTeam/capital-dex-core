const HDWalletProvider = require('@truffle/hdwallet-provider');
const web3 = require('web3');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

function getProvider(rpc) {
  return function() {
    const provider = new web3.providers.WebsocketProvider(rpc);
    return new HDWalletProvider(process.env.DEPLOYMENT_KEY, provider);
  };
}

const config = {
  networks: {
    local: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    test: {
      // https://github.com/trufflesuite/ganache-core#usage
      provider() {
        const { provider } = require('@openzeppelin/test-environment');
        return provider;
      },
      skipDryRun: true,
      network_id: '*'
    },
    mainnet: {
      gasPrice: 75 * 1000 * 1000 * 1000, // 75 gwei
      gasLimit: 4 * 1000 * 1000, // 4,000,000
      provider: getProvider(`wss://mainnet.infura.io/ws/v3/${ process.env.INFURA_PROJECT_ID }`),
      websockets: true,
      skipDryRun: false,
      network_id: '1'
    },
    kovan: {
      gasPrice: 1000 * 1000 * 1000, // 1 gwei
      gasLimit: 10 * 1000 * 1000,
      provider: getProvider(`wss://kovan.infura.io/ws/v3/${ process.env.INFURA_PROJECT_ID }`),
      websockets: true,
      skipDryRun: true,
      network_id: '42'
    },
    rinkeby: {
      gasPrice: 2 * 1e9, // 2 gwei
      gasLimit: 16 * 1e6, // 16,000,000
      provider: getProvider(`wss://rinkeby.infura.io/ws/v3/${ process.env.INFURA_PROJECT_ID }`),
      websockets: true,
      skipDryRun: true,
      network_id: '4'
    },
    skale_testnet: {
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, process.env.SKALE_RPC_URL),
      gasPrice: 0,
      network_id: '*'
    },
    skale_testnet_v2: {
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, process.env.SKALE_RPC_URL),
      gasPrice: 0,
      network_id: '*',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    skale_mainnet: {
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, process.env.SKALE_RPC_URL),
      gasPrice: 0,
      network_id: '*'
    }
  },
  mocha: {
    timeout: 10000
  },
  compilers: {
    solc: {
      version: '0.6.12',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "istanbul"
      }
    },
    /*
    solc: { // For Multicall old version
      version: '0.5.7',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
    */
  },
  plugins: [
    'truffle-plugin-verify'
  ],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY
  }
};

module.exports = config;
