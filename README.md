# Capital Dex smart contracts

Capital DEX - a decentralized legally protected exchange primarily for security Car Tokens.

# Features overview

- Liquidity pools and AMM mechanism, the ability to set the withdrawal of a part of the exchange fee to the team's wallet;
- Liquidity mining mechanism: ERC-20 CGT (Curio Governance Token) tokens will be distributed, which will be issued separately and put on a special reserve contract;
- Whitelist of DEX users (to ensure that users pass the KYC / AML procedure): check for swap, adding / removing liquidity, liquidity mining;
- Whitelist for tokens with which you can create trading pairs;
- Ability to disable user verification by whitelist (in case of legal changes regarding the KYC procedure of users);
- The admin and manager roles to manage the whitelist of users;
- Upgradable functionality for whitelist of users.

# Contracts overview

This repository contains contracts:
- **Core Capital DEX contracts** - support liquidity pools, token pairs, AMM algorithm, control of user transactions and supported tokens using whitelists;
- **Farming contracts** - work with the distribution of rewards (ERC-20 CGT - a token not relevant to this repository) for staking LP tokens of Capital DEX;
- **DexWhitelist.sol** - the contract serves whitelists of users and tokens supported in Capital DEX, can work with whitelist of Security Token holders, supports upgradable functionality.

# For Developers

### Install dependencies

```sh
npm install
```


### Compile contracts

```sh
npm run compile
```

### Run tests

```sh
npm run test:truffle
```
