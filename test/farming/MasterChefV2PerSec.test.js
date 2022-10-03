const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { accounts, contract, web3 } = require('@openzeppelin/test-environment');

const {
    BN,
    expectRevert,
    ether,
    constants,
    time, expectEvent,
} = require('@openzeppelin/test-helpers');

const { ZERO_ADDRESS } = constants;

require('chai').should();

const DexWhitelist = contract.fromArtifact('DexWhitelist');
const Reservoir = contract.fromArtifact('Reservoir');
const ERC20Mock = contract.fromArtifact('ERC20Mock');
const MasterChefV2PerSec = contract.fromArtifact('MasterChefV2PerSec');

describe('Contract farming/MasterChefV2PerSec.sol', function () {
    const [
        owner,
        alice,
        anyone
    ] = accounts;

    const TOKEN_NAME = 'ERC20Mock';
    const TOKEN_SYMBOL = 'EMC';
    const INITIAL_SUPPLY = ether('1000000000');

    const INITIAL_REWARD_PER_SEC = new BN('0');
    const START_TIMESTAMP = new BN('0');
    const BONUS_END_TIMESTAMP = new BN('0');

    beforeEach(async function () {
        this.tokenRewards = await ERC20Mock.new(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            owner,
            INITIAL_SUPPLY
        );

        this.tokenLp = await ERC20Mock.new(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            alice,
            INITIAL_SUPPLY
        );

        await DexWhitelist.detectNetwork();
        this.dexWhitelist = await deployProxy(DexWhitelist, [], {
            unsafeAllowCustomTypes: true,
        });

        this.masterChef = await MasterChefV2PerSec.new(
            this.tokenRewards.address,
            ZERO_ADDRESS,
            INITIAL_REWARD_PER_SEC,
            START_TIMESTAMP,
            BONUS_END_TIMESTAMP,
            this.dexWhitelist.address,
            { from: owner });

        this.reservoir = await Reservoir.new(
            this.tokenRewards.address,
            this.masterChef.address
        );

        await this.tokenRewards.transfer(
            this.reservoir.address,
            INITIAL_SUPPLY,
            { from: owner });

        await this.masterChef.setSushiReservoir(
            this.reservoir.address,
            { from: owner });

        await this.masterChef.add(
            ether('1'),
            this.tokenLp.address,
            false,
            { from: owner });
    });

    describe('initialization', function () {
        it('should initialize with set up sushiPerSec parameter', async function () {
            (await this.masterChef.sushiPerSec()).should.be.bignumber.equal(INITIAL_REWARD_PER_SEC);
        });

        it('should initialize with set up startTimestamp parameter', async function () {
            (await this.masterChef.startTimestamp()).should.be.bignumber.equal(START_TIMESTAMP);
        });

        it('should initialize with set up bonusEndTimestamp parameter', async function () {
            (await this.masterChef.bonusEndTimestamp()).should.be.bignumber.equal(BONUS_END_TIMESTAMP);
        });
    });

    describe('update sushiPerSec logic', function () {
        beforeEach(async function() {
            this.sushiPerSec = new BN('3858024691358024');
        });

        it('should call setSushiPerSec by owner', async function () {
            await this.masterChef.setSushiPerSec(this.sushiPerSec, true, { from: owner });
        });

        it('should fail on call setSushiPerSec by anyone', async function () {
            await expectRevert(
              this.masterChef.setSushiPerSec(this.sushiPerSec, true, { from: anyone }),
              'Ownable: caller is not the owner'
            );
        });

        context('with updated sushiPerSec', function () {
            beforeEach(async function() {
                ({ logs: this.logs } =
                    await this.masterChef.setSushiPerSec(this.sushiPerSec, true, {
                        from: owner
                    })
                );
            });

            it('should set new value of SushiPerSec after call setSushiPerSec', async function () {
                (await this.masterChef.sushiPerSec()).should.be.bignumber.equal(this.sushiPerSec);
            });

            it('should log SetSushiPerSec', async function() {
                expectEvent.inLogs(this.logs, 'SetSushiPerSec', {
                    sushiPerSec: this.sushiPerSec,
                });
            });
        });
    });

    describe('rewards distribution', function () {
        beforeEach(async function() {
            this.sushiPerSec = new BN('1000000000000000000');

            await this.masterChef.setSushiPerSec(this.sushiPerSec, true, {
                from: owner
            })
        });

        describe("pending rewards calculation", function () {
            it('PendingSushi should equal ExpectedSushi', async function() {
                await this.tokenLp.approve(this.masterChef.address, INITIAL_SUPPLY, { from: alice });
                let log = await this.masterChef.deposit(0, ether('1'), { from: alice });

                await time.increase(time.duration.days('30'));

                let log2 = await this.masterChef.updatePool(0);
                let timestamp2 = (await web3.eth.getBlock(log2.receipt.blockNumber)).timestamp;
                let timestamp = (await web3.eth.getBlock(log.receipt.blockNumber)).timestamp;

                let expectedSushi = this.sushiPerSec.mul(new BN(timestamp2 - timestamp));
                let pendingSushi = await this.masterChef.pendingSushi(0, alice);

                pendingSushi.should.be.bignumber.equal(expectedSushi);
            });
        });

        describe("harvest rewards", function () {
            it('should deposit, withdraw lp and rewards', async function() {
                await this.tokenLp.approve(this.masterChef.address, INITIAL_SUPPLY, { from: alice });
                let log = await this.masterChef.deposit(0, INITIAL_SUPPLY, { from: alice });

                (await this.tokenLp.balanceOf(alice))
                  .should.be.bignumber.equal(ether('0'));

                await time.increase(time.duration.days('1'));

                let log2 = await this.masterChef.withdraw(0, INITIAL_SUPPLY, { from: alice });

                let timestamp2 = (await web3.eth.getBlock(log2.receipt.blockNumber)).timestamp;
                let timestamp = (await web3.eth.getBlock(log.receipt.blockNumber)).timestamp;
                let expectedRewards = this.sushiPerSec.mul(new BN(timestamp2 - timestamp));

                (await this.tokenLp.balanceOf(alice))
                  .should.be.bignumber.equal(INITIAL_SUPPLY);

                (await this.tokenRewards.balanceOf(alice))
                  .should.be.bignumber.equal(expectedRewards);

                (await this.tokenRewards.balanceOf(this.reservoir.address))
                  .should.be.bignumber.equal(INITIAL_SUPPLY.sub(expectedRewards));
            });

            it('should deposit lp and harvest rewards', async function() {
                await this.tokenLp.approve(this.masterChef.address, INITIAL_SUPPLY, { from: alice });
                let log = await this.masterChef.deposit(0, INITIAL_SUPPLY, { from: alice });

                (await this.tokenLp.balanceOf(alice))
                  .should.be.bignumber.equal(ether('0'));

                await time.increase(time.duration.days('1'));

                let log2 = await this.masterChef.deposit(0, new BN(0), { from: alice });

                let timestamp2 = (await web3.eth.getBlock(log2.receipt.blockNumber)).timestamp;
                let timestamp = (await web3.eth.getBlock(log.receipt.blockNumber)).timestamp;
                let expectedRewards = this.sushiPerSec.mul(new BN(timestamp2 - timestamp));

                (await this.tokenLp.balanceOf(alice))
                  .should.be.bignumber.equal(new BN(0));

                (await this.tokenLp.balanceOf(this.masterChef.address))
                  .should.be.bignumber.equal(INITIAL_SUPPLY);

                (await this.tokenRewards.balanceOf(alice))
                  .should.be.bignumber.equal(expectedRewards);

                (await this.tokenRewards.balanceOf(this.reservoir.address))
                  .should.be.bignumber.equal(INITIAL_SUPPLY.sub(expectedRewards));
            });

            it('should harvest rewards after update sushiPerBlock', async function () {
                const newSushiPerSec = new BN('2000000000000000000');

                await this.tokenLp.approve(this.masterChef.address, INITIAL_SUPPLY, { from: alice });
                let log = await this.masterChef.deposit(0, INITIAL_SUPPLY, { from: alice });

                await time.increase(time.duration.days('1'));

                let log2 = await this.masterChef.setSushiPerSec(newSushiPerSec, true, { from: owner });

                let timestamp2 = (await web3.eth.getBlock(log2.receipt.blockNumber)).timestamp;
                let timestamp = (await web3.eth.getBlock(log.receipt.blockNumber)).timestamp;
                let expectedRewards = this.sushiPerSec.mul(new BN(timestamp2 - timestamp));

                await time.increase(time.duration.days('1'));

                let log3 = await this.masterChef.deposit(0, new BN(0), { from: alice });

                let timestamp3 = (await web3.eth.getBlock(log3.receipt.blockNumber)).timestamp;
                let expectedRewards2 = newSushiPerSec.mul(new BN(timestamp3 - timestamp2));

                (await this.tokenLp.balanceOf(alice))
                  .should.be.bignumber.equal(new BN(0));

                (await this.tokenLp.balanceOf(this.masterChef.address))
                  .should.be.bignumber.equal(INITIAL_SUPPLY);

                (await this.tokenRewards.balanceOf(alice))
                  .should.be.bignumber.equal(expectedRewards.add(expectedRewards2));

                (await this.tokenRewards.balanceOf(this.reservoir.address))
                  .should.be.bignumber.equal(INITIAL_SUPPLY.sub(expectedRewards.add(expectedRewards2)));
            });
        });
    });
});
