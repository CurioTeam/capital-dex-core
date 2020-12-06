# Uniswap V2 Area

Code from [Uniswap V2](https://github.com/Uniswap/uniswap-v2-core/tree/27f6354bae6685612c182c3bc7577e61bc8717e3/contracts) with the following modifications.

1. Change contract version to 0.6.12 and do the necessary patching.
2. Rename `feeToSetter` to `owner`.
3. Add `setFee`, `setWhitelist`, `setRouterPermission` logic in `UniswapV2Factory` which can be set by `owner`.
4. Only whitelisted `UniswapV2Router02` can call `UniswapV2Factory` and `UniswapV2Pair`.
5. Add whitelist logic in `UniswapV2Router02`.