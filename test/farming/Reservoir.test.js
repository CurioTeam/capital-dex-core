const { accounts, contract } = require('@openzeppelin/test-environment');

const {
    expectRevert,
    ether,
} = require('@openzeppelin/test-helpers');

require('chai').should();

const Reservoir = contract.fromArtifact('Reservoir');
const ERC20Mock = contract.fromArtifact('ERC20Mock');
const ReservoirTarget = contract.fromArtifact('ReservoirTarget');

describe('Contract farming/Reservoir.sol', function () {
    const [
        owner,
        anyone,
    ] = accounts;

    const TOKEN_NAME = 'ERC20Mock';
    const TOKEN_SYMBOL = 'EMC';
    const INITIAL_SUPPLY = ether('1000');

    beforeEach(async function () {
        this.erc20Mock = await ERC20Mock.new(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            owner,
            INITIAL_SUPPLY
        );

        this.reservoirTarget = await ReservoirTarget.new();

        this.reservoir = await Reservoir.new(
            this.erc20Mock.address,
            this.reservoirTarget.address
        );

        await this.erc20Mock.transfer(
            this.reservoir.address,
            INITIAL_SUPPLY,
            { from: owner });

        await this.reservoirTarget.setReservoir(this.reservoir.address);
    });

    it('should initialize with token and target', async function () {
        (await this.reservoir.token()).should.be.equal(this.erc20Mock.address);
        (await this.reservoir.target()).should.be.equal(this.reservoirTarget.address);
    });

    describe('drip function', function () {
        beforeEach(async function () {
            this.requestedAmount = ether('23');
            this.requestedAmountOver = ether('1001');
        });

        it('should call drip by target contract', async function () {
            await this.reservoirTarget.runDrip(this.requestedAmount);
        });

        it('should fail on call drip by anyone', async function () {
            await expectRevert(
                this.reservoir.drip(this.requestedAmount, { from: anyone }),
                'Reservoir: permission denied'
            );
        });

        it('should transfer tokens from reservoir to target', async function () {
            (await this.erc20Mock.balanceOf(this.reservoir.address)).should.be.bignumber.equal(INITIAL_SUPPLY);
            (await this.erc20Mock.balanceOf(this.reservoirTarget.address)).should.be.bignumber.equal(ether('0'));

            await this.reservoirTarget.runDrip(this.requestedAmount);

            (await this.erc20Mock.balanceOf(this.reservoir.address)).should.be.bignumber.equal(INITIAL_SUPPLY.sub(this.requestedAmount));
            (await this.erc20Mock.balanceOf(this.reservoirTarget.address)).should.be.bignumber.equal(this.requestedAmount);
        });

        it('should transfer tokens from reservoir to target (over balance)', async function () {
            (await this.erc20Mock.balanceOf(this.reservoir.address)).should.be.bignumber.equal(INITIAL_SUPPLY);
            (await this.erc20Mock.balanceOf(this.reservoirTarget.address)).should.be.bignumber.equal(ether('0'));

            await this.reservoirTarget.runDrip(this.requestedAmountOver);

            (await this.erc20Mock.balanceOf(this.reservoir.address)).should.be.bignumber.equal(ether('0'));
            (await this.erc20Mock.balanceOf(this.reservoirTarget.address)).should.be.bignumber.equal(INITIAL_SUPPLY);
        });
    });
});
