# Capital DEX deployment guide

## Prepare

When deploying, use the following environment:

- Node: v16.14.0  (Contract verification (truffle-plugin-verify) works well with Node: v10.15.3)
- Npm: 8.12.1  
- Truffle: 5.1.56

First you need to set the values in ```.env``` and configure network in ```truffle-config.js```. Then execute at the root:

```shell
npm install
```

## Compile contracts

```sh
npm run compile:all
```

## Run tests

```sh
npm run test:truffle
```

## Deployments steps

### Step 1. DEX whitelist deployment

Before executing migrations, it is necessary to review the migration code and set the required values.

```shell
npx truffle migrate --f 3 --to 3 --network {network}
```

### Step 2. Core contracts deployment

Before executing migrations, it is necessary to review the migration code and set the required values.

```shell
npx truffle migrate --f 5 --to 5 --network {network}
```

### Step 3. Multicall deployment

You must specify a compiler version in ```truffle-config.js``` that is compatible with the version of the Multicall contract (solc v0.5.7). Then compile and deploy:

```shell
npx truffle compile --contracts_directory multicall && npx truffle migrate --f 11 --to 11 --compile-none --network {network}
```

### Step 4. Farming deployment (MasterChefV2)

Before executing migrations, it is necessary to review the migration code and set the required values.

```shell
npx truffle migrate --f 9 --to 9 --network {network}
```

## Etherscan/Aurorascan verification of contract

Configure ```ETHERSCAN_API_KEY``` or ```AURORASCAN_API_KEY``` variable in ```.env``` file.

```bash
npx truffle run verify {contract_name}@{contract_address} --network {network}
```

