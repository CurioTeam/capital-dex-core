const { contract } = require('@openzeppelin/test-environment');

require('chai').should();

const UniswapV2ERC20 = contract.fromArtifact('UniswapV2ERC20');

describe('Contract uniswap-v2/UniswapV2ERC20.sol', function () {
    const LP_TOKEN_NAME = 'Capital DEX LP';
    const LP_TOKEN_SYMBOL = 'CLP';

    beforeEach(async function () {
        this.uniswapV2ERC20 = await UniswapV2ERC20.new();
    });

    it('should initialize with correct token name and symbol', async function () {
        (await this.uniswapV2ERC20.name()).should.be.equal(LP_TOKEN_NAME);
        (await this.uniswapV2ERC20.symbol()).should.be.equal(LP_TOKEN_SYMBOL);
    });
});
