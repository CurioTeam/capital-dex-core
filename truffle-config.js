const HDWalletProvider = require('@truffle/hdwallet-provider');
const web3 = require('web3');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
  path: path.resolve(__dirname, '.env')
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
      gasPrice: 3 * 1e9, // 3 gwei
      gas: 10 * 1000 * 1000,
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
    goerli: {
      gasPrice: 1e9, // 1 gwei
      gas: 15 * 1e6, // 15,000,000
      provider: getProvider(`wss://goerli.infura.io/ws/v3/${ process.env.INFURA_PROJECT_ID }`),
      websockets: true,
      skipDryRun: true,
      network_id: '5',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
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
    },
    boba_rinkeby: {
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://rinkeby.boba.network'),
      gasPrice: 1e9, // 1 gwei
      gas: 11 * 1e6, // 11,000,000
      network_id: '28',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    boba_mainnet: {
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://mainnet.boba.network'),
      gasPrice: 1e9, // 1 gwei
      gas: 11 * 1e6, // 11,000,000
      network_id: '288',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    aurora_testnet: {
      gasPrice: 1e9, // 1 gwei
      gas: 10 * 1e6, // 10,000,000
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://testnet.aurora.dev'),
      network_id: '1313161555',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    aurora_mainnet: {
      gasPrice: 0,
      gas: 6 * 1e6, // 6,000,000
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://mainnet.aurora.dev'),
      network_id: '1313161554',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    harmony_devnet: {
      gasPrice: 30e9, // 30 gwei
      gas: 10 * 1e6, // 10,000,000
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://api.s0.ps.hmny.io'),
      network_id: '1666900000',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    harmony_testnet: {
      gasPrice: 100e9, // 100 gwei
      gas: 10 * 1e6, // 10,000,000
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://api.s0.b.hmny.io'),
      network_id: '1666700000',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    bsc_testnet: {
      gasPrice: 5e9, // 5 gwei
      gas: 15 * 1e6, // 15,000,000
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://data-seed-prebsc-1-s1.bnbchain.org:8545'),
      skipDryRun: true,
      network_id: '97',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    bsc_mainnet: {
      gasPrice: 3e9, // 3 gwei
      gas: 15 * 1e6, // 15,000,000
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://bsc-dataseed.binance.org'),
      skipDryRun: false,
      network_id: '56',
      networkCheckTimeout: 500000,
      timeoutBlocks: 500000
    },
    neonevm_devnet: {
      gasPrice: 80e9, // 80 galan
      gas: 60000 * 1e6, // 60,000,000,000
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://devnet.neonevm.org'),
      network_id: '245022926',
      networkCheckTimeout: 100000000,
      timeoutBlocks: 100000000,
      confirmations: 1
    },
    neonevm_mainnet: {
      gasPrice: 170e9, // 170 galan
      gas: 200 * 1e6, // 200,000,000
      provider: () => new HDWalletProvider(process.env.DEPLOYMENT_KEY, 'https://neon-proxy-mainnet.solana.p2p.org'),
      skipDryRun: false,
      network_id: '245022934',
      networkCheckTimeout: 100000000,
      timeoutBlocks: 100000000,
      confirmations: 1
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
        // metadata: {
        //  bytecodeHash: "none" // For reduce bytecode size
        // }
      }
    }
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
    /*
    solc: { // For WETH9 old version
      version: '0.4.19',
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        }
      }
    }
    */
    /*
    solc: { // For WBNB old version
      version: '0.4.18',
      settings: {
        optimizer: {
          enabled: false,
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
    etherscan: process.env.ETHERSCAN_API_KEY,
    aurorascan: process.env.AURORASCAN_API_KEY,
    bscscan: process.env.BSCSCAN_API_KEY
  }
};

module.exports = config;
