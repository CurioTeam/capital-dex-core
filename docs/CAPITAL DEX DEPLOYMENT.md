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

### Step 1. Multicall deployment

You must specify a compiler version in ```truffle-config.js``` that is compatible with the version of the Multicall contract (solc v0.5.7). Then compile and deploy:

```shell
rm -rf build && npx truffle compile --contracts_directory multicall && npx truffle migrate --f 11 --to 11 --compile-none --network {network}
```

#### Step 2. WBNB or WETH deployment (optional)

You must specify a compiler version in ```truffle-config.js``` that is compatible with the version of the WBNB or WETH contract (solc v0.4.18 or solc v0.4.19). Then compile and deploy:

```shell
rm -rf build && npx truffle compile --contracts_directory weth && npx truffle migrate --f 18 --to 18 --compile-none --network {network}
```

or

```shell
rm -rf build && npx truffle compile --contracts_directory wbnb && npx truffle migrate --f 19 --to 19 --compile-none --network {network}
```


### Step 3. DEX whitelist deployment

You must specify a compiler version in ```truffle-config.js``` that is compatible with the version of the core contracts (solc v0.6.12). Then compile:

```shell
rm -rf build && npx truffle compile
```

Before executing migrations, it is necessary to review the migration code and set the required values. Then deploy:

```shell
npx truffle migrate --f 3 --to 3 --network {network}
```

### Step 4. Core contracts deployment

Choose needed deployments scripts

#### Deployment Factory and Router02

Before executing migrations, it is necessary to review the migration code and set the required values.

```shell
npx truffle migrate --f 5 --to 5 --network {network}
```

#### Deployment only Factory

Before executing migrations, it is necessary to review the migration code and set the required values.

```shell
npx truffle migrate --f 12 --to 12 --network {network}
```

#### Deployment only Router04 (without ETH functionality)

Before executing migrations, it is necessary to review the migration code and set the required values.

```shell
npx truffle migrate --f 20 --to 20 --network {network}
```

### Step 5. Farming deployment (MasterChefV2)

Before executing migrations, it is necessary to review the migration code and set the required values.

```shell
npx truffle migrate --f 9 --to 9 --network {network}
```

## Etherscan/Aurorascan verification of contract

Configure ```ETHERSCAN_API_KEY``` or ```AURORASCAN_API_KEY``` or ```BSCSCAN_API_KEY``` variable in ```.env``` file.

```bash
npx truffle run verify {contract_name}@{contract_address} --network {network}
```

