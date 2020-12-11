const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { accounts, contract, defaultSender } = require('@openzeppelin/test-environment');

const {
    BN,
    expectRevert,
    ether,
    constants,
    time,
} = require('@openzeppelin/test-helpers');

const { ZERO_ADDRESS } = constants;

require('chai').should();

const { utf8ToHex } = web3.utils;
// const bytes32 = utf8ToHex;

const DexWhitelist = contract.fromArtifact('DexWhitelist');
const Reservoir = contract.fromArtifact('Reservoir');
const ERC20Mock = contract.fromArtifact('ERC20Mock');
const MasterChef = contract.fromArtifact('MasterChef');

describe('Contract farming/MasterChef.sol', function () {
    const [
        owner,
        admin,
        manager,
        user,
        user2
    ] = accounts;

    const TOKEN_NAME = 'ERC20Mock';
    const TOKEN_SYMBOL = 'EMC';
    const INITIAL_SUPPLY = ether('1000');

    beforeEach(async function () {
        this.users = {
            alice: {
                key: utf8ToHex('alice'),
                keyNormalize: utf8ToHex('alice').padEnd(66, '0'),
                address: user,
            },
            bob: {
                key: utf8ToHex('bob'),
                keyNormalize: utf8ToHex('bob').padEnd(66, '0'),
                address: user2,
            }
        };

        this.tokenRewards = await ERC20Mock.new(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            owner,
            INITIAL_SUPPLY
        );

        this.tokenLp = await ERC20Mock.new(
            TOKEN_NAME,
            TOKEN_SYMBOL,
            user,
            INITIAL_SUPPLY
        );

        this.dexWhitelist = await deployProxy(DexWhitelist, [], {
            unsafeAllowCustomTypes: true,
        });
        await this.dexWhitelist.transferOwnership(owner, { from: defaultSender });
        await this.dexWhitelist['setWlActive'](true, true, true, true, {
            from: owner
        });
        await this.dexWhitelist.addAdmin(admin, { from: owner });
        await this.dexWhitelist.addManager(manager, { from: admin });

        this.masterChef = await MasterChef.new(
            this.tokenRewards.address,
            ZERO_ADDRESS,
            ether('1'),
            (await time.latestBlock()),
            (await time.latestBlock()),
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

    it('should deposit/withdraw lp and rewards', async function () {
        (await this.masterChef.poolLength()).should.be.bignumber.equal(new BN(1));

        await this.tokenLp.approve(this.masterChef.address, ether('1000'), { from: user })

        await expectRevert(
             this.masterChef.deposit(
                new BN(0),
                ether('1000'),
                { from: user }),
            'MasterChef: WL permission denied');

        await this.dexWhitelist.addNewInvestors(
            [this.users.alice.key],
            [this.users.alice.address],
            { from: admin });

        await this.masterChef.deposit(
            new BN(0),
            ether('1000'),
            { from: user });

        (await this.tokenLp.balanceOf(user))
            .should.be.bignumber.equal(ether('0'));

        await time.increase(1);
        await time.increase(1);
        await time.increase(1);

        await this.masterChef.withdraw(
            new BN(0),
            ether('1000'),
            { from: user });

        (await this.tokenLp.balanceOf(user))
            .should.be.bignumber.equal(ether('1000'));

        (await this.tokenRewards.balanceOf(user))
            .should.be.bignumber.equal(ether('4'));

        (await this.tokenRewards.balanceOf(this.reservoir.address))
            .should.be.bignumber.equal(INITIAL_SUPPLY.sub(ether('4')));
    });
});
