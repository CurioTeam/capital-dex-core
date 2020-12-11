const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { accounts, contract, defaultSender } = require('@openzeppelin/test-environment');

const {
    constants,
    expectEvent,
    expectRevert,
} = require('@openzeppelin/test-helpers');

const { ZERO_ADDRESS } = constants;

require('chai').should();

const { utf8ToHex } = web3.utils;
// const bytes32 = utf8ToHex;

const DexWhitelist = contract.fromArtifact('DexWhitelist');
const CarTokenController = contract.fromArtifact('CarTokenControllerMock');

describe('Contract whitelist/DexWhitelist.sol', function () {
    const [
        owner,
        admin,
        manager,
        anyone,
        token,
        token2,
        user,
        user2
    ] = accounts;

    const deployCarTokenController = async () => {
        return CarTokenController.new();
    };

    beforeEach(async function () {
        this.dexWhitelist = await deployProxy(DexWhitelist, [], {
            unsafeAllowCustomTypes: true,
        });

        await this.dexWhitelist.transferOwnership(owner, { from: defaultSender });

        await this.dexWhitelist.addAdmin(admin, { from: owner });
        await this.dexWhitelist.addManager(manager, { from: admin });
    });

    describe('initialization', function () {
        it('should initialize with disabled whitelists', async function () {
            (await this.dexWhitelist.isLiquidityWlActive()).should.be.equal(false);
            (await this.dexWhitelist.isSwapWlActive()).should.be.equal(false);
            (await this.dexWhitelist.isFarmWlActive()).should.be.equal(false);
            (await this.dexWhitelist.isTokenWlActive()).should.be.equal(false);
        });

        it('should initialize without car token controller address', async function () {
            (await this.dexWhitelist.controller()).should.be.equal(ZERO_ADDRESS);
        });

        it('should setup car token controller by owner', async function() {
            await this.dexWhitelist.setController((await deployCarTokenController()).address, {
                from: owner
            });
        });

        it('should fail on setup car token controller by anyone (only owner)', async function() {
            await expectRevert(
                this.dexWhitelist.setController((await deployCarTokenController()).address, {
                    from: anyone
                }),
                'Ownable: caller is not the owner'
            );
        });

        context('with configured car token controller', function () {
            beforeEach(async function() {
                this.carTokenController = await deployCarTokenController();

                ({ logs: this.logs } =
                    await this.dexWhitelist.setController(this.carTokenController.address, {
                        from: owner
                    })
                );
            });

            it('should setup correct car token controller address', async function () {
                (await this.dexWhitelist.controller()).should.be.equal(this.carTokenController.address);
            });

            it('should log set car token controller event', async function() {
                expectEvent.inLogs(this.logs, 'SetController', {
                    controller: this.carTokenController.address,
                });
            });
        });
    });

    describe('wl enable/disable management', function () {
        for (name of ['liquidity wl', 'swap wl', 'farm wl', 'token wl']) {
            const capitalizeName = name
                .replace(/(^\w|\s\w)/g, m => m.toUpperCase())
                .replace(' ','');

            it(`should enable ${ name } by owner`, async function() {
                await this.dexWhitelist[`set${ capitalizeName }Active`](true, {
                    from: owner
                });
            });

            it(`should fail on enable ${ name } by anyone (only owner)`, async function() {
                await expectRevert(
                    this.dexWhitelist[`set${ capitalizeName }Active`](true, {
                        from: anyone
                    }),
                    'Ownable: caller is not the owner'
                );
            });

            context(`with enabled ${ name }`, function () {
                beforeEach(async function() {
                    ({ logs: this.logs } =
                            await this.dexWhitelist[`set${ capitalizeName }Active`](true, {from: owner})
                    );
                });

                it(`should set enabled ${ name } status`, async function () {
                    (await this.dexWhitelist[`is${ capitalizeName }Active`]()).should.be.equal(true);
                });

                it(`should log enable ${ name }`, async function() {
                    expectEvent.inLogs(this.logs, `Set${ capitalizeName }Active`, {
                        active: true,
                    });
                });

                it(`should disable ${ name } by owner`, async function() {
                    await this.dexWhitelist[`set${ capitalizeName }Active`](false, {
                        from: owner
                    });

                    (await this.dexWhitelist[`is${ capitalizeName }Active`]()).should.be.equal(false);
                });
            });
        }

        it('should enable/disable all whitelists by owner', async function() {
            await this.dexWhitelist['setWlActive'](true, true, true, true, {
                from: owner
            });

            (await this.dexWhitelist['isLiquidityWlActive']()).should.be.equal(true);
            (await this.dexWhitelist['isSwapWlActive']()).should.be.equal(true);
            (await this.dexWhitelist['isFarmWlActive']()).should.be.equal(true);
            (await this.dexWhitelist['isTokenWlActive']()).should.be.equal(true);

            await this.dexWhitelist['setWlActive'](false, false, false, false, {
                from: owner
            });

            (await this.dexWhitelist['isLiquidityWlActive']()).should.be.equal(false);
            (await this.dexWhitelist['isSwapWlActive']()).should.be.equal(false);
            (await this.dexWhitelist['isFarmWlActive']()).should.be.equal(false);
            (await this.dexWhitelist['isTokenWlActive']()).should.be.equal(false);
        });

        it('should fail on enable all whitelists by anyone (only owner)', async function() {
            await expectRevert(
                this.dexWhitelist['setWlActive'](true, true, true, true, {
                    from: anyone
                }),
                'Ownable: caller is not the owner'
            );
        });
    });

    describe('tokens wl management', function () {
        it('should add token to wl by admin', async function() {
            await this.dexWhitelist.setTokenAddressActive(token, true, {
                from: admin
            });
        });

        it('should fail on add token to wl by anyone (only admin)', async function() {
            await expectRevert(
                this.dexWhitelist.setTokenAddressActive(token, true, {
                    from: anyone
                }),
                'Administrated: sender is not admin'
            );
        });

        context('with added token to wl', function () {
            beforeEach(async function() {
                ({ logs: this.logs } =
                        await this.dexWhitelist.setTokenAddressActive(token, true, {
                            from: admin
                        })
                );
            });

            it('should add token to wl', async function () {
                (await this.dexWhitelist.tokens(token)).should.be.equal(true);
            });

            it('should log token wl status', async function() {
                expectEvent.inLogs(this.logs, 'SetTokenAddressActive', {
                    token,
                    active: true,
                });
            });

            it('should remove token from wl by admin', async function() {
                await this.dexWhitelist.setTokenAddressActive(token, false, {
                    from: admin
                });

                (await this.dexWhitelist.tokens(token)).should.be.equal(false);
            });
        });

        it('should add many token to wl by admin', async function() {
            await this.dexWhitelist.setTokenAddressesActive(
                [token, token2], [true, true],
                { from: admin });

            (await this.dexWhitelist.tokens(token)).should.be.equal(true);
            (await this.dexWhitelist.tokens(token2)).should.be.equal(true);
        });

        it('should fail on add many tokens to wl by anyone (only admin)', async function() {
            await expectRevert(
                this.dexWhitelist.setTokenAddressesActive(
                    [token, token2],
                    [true, true],
                    { from: anyone }),
                'Administrated: sender is not admin'
            );
        });

        it('should fail when many tokens arrays lengths does not match', async function() {
            await expectRevert(
                this.dexWhitelist.setTokenAddressesActive(
                    [token, token2],
                    [true],
                    { from: admin }),
                'Lengths of tokens and active does not match'
            );
        });
    });

    describe('users wl management', function () {
        beforeEach(async function() {
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
        });

        it('should return correct status of user (false)', async function () {
            (await this.dexWhitelist.isInvestorAddressActive(this.users.alice.address)).should.be.equal(false);
        });

        it('should add user to whitelist by admin', async function () {
            await this.dexWhitelist.addNewInvestors(
                [this.users.alice.key],
                [this.users.alice.address],
                { from: admin });
        });

        it('should add user to whitelist by manager', async function () {
            await this.dexWhitelist.addNewInvestors(
                [this.users.alice.key],
                [this.users.alice.address],
                { from: manager });
        });

        it('should fail on add user to whitelist by anyone', async function () {
            await expectRevert(
                this.dexWhitelist.addNewInvestors(
                    [this.users.alice.key],
                    [this.users.alice.address],
                    { from: anyone }),
                'Managered: sender is not admin or manager'
            );
        });

        it('should add many users to whitelist', async function () {
            await this.dexWhitelist.addNewInvestors(
                [this.users.alice.key, this.users.bob.key],
                [this.users.alice.address, this.users.bob.address],
                { from: admin });

            (await this.dexWhitelist.keyOfInvestor(this.users.alice.address))
                .should.be.equal(this.users.alice.keyNormalize);
            (await this.dexWhitelist.keyOfInvestor(this.users.bob.address))
                .should.be.equal(this.users.bob.keyNormalize);

            const alice = (await this.dexWhitelist.investors(this.users.alice.key));
            const bob = (await this.dexWhitelist.investors(this.users.bob.key));
            (alice[0]).should.be.equal(this.users.alice.address);
            (bob[0]).should.be.equal(this.users.bob.address);
            (alice[1]).should.be.equal(true);
            (bob[1]).should.be.equal(true);
        });

        it('should fail when many users arrays lengths does not match', async function () {
            await expectRevert(
                this.dexWhitelist.addNewInvestors(
                    [this.users.alice.key, this.users.bob.key],
                    [this.users.alice.address],
                    { from: admin }),
                'Lengths of keys and address does not match'
            );
        });

        it('should fail on set user status if user not exist', async function () {
            await expectRevert(
                this.dexWhitelist.setInvestorActive(
                    this.users.alice.key,
                    true,
                    { from: admin }),
                'Investor does not exists'
            );
        });

        context('with user added to wl', function () {
            beforeEach(async function() {
                ({ logs: this.logs } =
                        await this.dexWhitelist.addNewInvestors(
                            [this.users.alice.key],
                            [this.users.alice.address],
                            { from: admin })
                );
            });

            it('should add user to wl', async function () {
                (await this.dexWhitelist.isInvestorAddressActive(this.users.alice.address))
                    .should.be.equal(true);
            });

            it('should log add user to wl', async function() {
                expectEvent.inLogs(this.logs, 'AddNewInvestor', {
                    key: this.users.alice.keyNormalize,
                    addr: this.users.alice.address,
                });
            });

            it('should fail on add user to whitelist if already exist', async function () {
                await expectRevert(
                    this.dexWhitelist.addNewInvestors(
                        [this.users.alice.key],
                        [this.users.alice.address],
                        { from: admin }),
                    'Investor already exists'
                )
            });

            it('should correct set user status', async function () {
                await expectRevert(
                    this.dexWhitelist.setInvestorActive(
                        this.users.alice.key,
                        false,
                        { from: owner }),
                    'Managered: sender is not admin or manager'
                );

                await expectRevert(
                    this.dexWhitelist.setInvestorActive(
                        this.users.alice.key,
                        false,
                        { from: anyone }),
                    'Managered: sender is not admin or manager'
                );

                ({ logs: this.logsSet } =
                        await this.dexWhitelist.setInvestorActive(
                            this.users.alice.key,
                            false,
                            { from: admin })
                );

                expectEvent.inLogs(this.logsSet, 'SetInvestorActive', {
                    key: this.users.alice.keyNormalize,
                    active: false,
                });

                ({ logs: this.logsSet2 } =
                        await this.dexWhitelist.setInvestorActive(
                            this.users.alice.key,
                            true,
                            { from: admin })
                );

                expectEvent.inLogs(this.logsSet2, 'SetInvestorActive', {
                    key: this.users.alice.keyNormalize,
                    active: true,
                });
            });

            it('should change user address by admin', async function () {
                await expectRevert(
                    this.dexWhitelist.changeInvestorAddress(
                        this.users.alice.key,
                        this.users.bob.address,
                        { from: manager }),
                    'Administrated: sender is not admin'
                );

                await expectRevert(
                    this.dexWhitelist.changeInvestorAddress(
                        this.users.alice.key,
                        this.users.bob.address,
                        { from: anyone }),
                    'Administrated: sender is not admin'
                );

                const log = (await this.dexWhitelist.changeInvestorAddress(
                    this.users.alice.key,
                    this.users.bob.address,
                    { from: admin })
                );

                expectEvent.inLogs(log.logs, 'ChangeInvestorAddress', {
                    sender: admin,
                    key: this.users.alice.keyNormalize,
                    oldAddr: this.users.alice.address,
                    newAddr: this.users.bob.address,
                });
            });

            it('should fail on change user address if same address', async function () {
                await expectRevert(
                    this.dexWhitelist.changeInvestorAddress(
                        this.users.alice.key,
                        this.users.alice.address,
                        { from: manager }),
                    'Administrated: sender is not admin'
                );
            });

            it('should change user address by user', async function () {
                await this.dexWhitelist.changeMyAddress(
                    this.users.alice.key,
                    this.users.bob.address,
                    { from: user });
            });

            it('should fail on change user by user if sender not user', async function () {
                await expectRevert(
                    this.dexWhitelist.changeMyAddress(
                        this.users.alice.key,
                        this.users.bob.address,
                        { from: user2 }),
                    'Investor address and msg.sender does not match'
                );
            });

            it('should fail on change user by user when paused', async function () {
                await this.dexWhitelist.pause({ from: owner });

                await expectRevert(
                    this.dexWhitelist.changeMyAddress(
                        this.users.alice.key,
                        this.users.bob.address,
                        { from: user }),
                    'Pausable: paused'
                );
            });

            it('should remove user from wl by admin (set status as false)', async function() {
                await this.dexWhitelist.setInvestorActive(this.users.alice.key, false, {
                    from: admin
                });

                (await this.dexWhitelist.investors(this.users.alice.key))[0]
                    .should.be.equal(this.users.alice.address);
                (await this.dexWhitelist.investors(this.users.alice.key))[1]
                    .should.be.equal(false);
            });
        });

        context('with user added to car token controller wl', function () {
            beforeEach(async function() {
                this.carTokenController = await deployCarTokenController();

                await this.dexWhitelist.setController(this.carTokenController.address, {
                    from: owner
                });

                await this.carTokenController.addUserToWhitelist(user);
            });

            it('should return correct status of user (true)', async function () {
                (await this.dexWhitelist.isInvestorAddressActive(user)).should.be.equal(true);
            });

            it('should return false status of user after delete from car token controller wl', async function () {
                await this.carTokenController.removeUserFromWhitelist(user);

                (await this.dexWhitelist.isInvestorAddressActive(user)).should.be.equal(false);
            });
        });
    });

    describe('users whitelisted statuses per each of 3 operations (all wl manual enabled after start)', function () {
        beforeEach(async function() {
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

            await this.dexWhitelist['setLiquidityWlActive'](true, { from: owner });
            await this.dexWhitelist['setSwapWlActive'](true, { from: owner });
            await this.dexWhitelist['setFarmWlActive'](true, { from: owner });

            await this.dexWhitelist.addNewInvestors(
                [this.users.alice.key],
                [this.users.alice.address],
                { from: admin });
        });

        it('should be success for whitelisted user', async function() {
            (await this.dexWhitelist.isLiquidityAddressActive(user)).should.be.equal(true);
            (await this.dexWhitelist.isSwapAddressActive(user)).should.be.equal(true);
            (await this.dexWhitelist.isFarmAddressActive(user)).should.be.equal(true);
        });

        it('should be false for not whitelisted user', async function() {
            (await this.dexWhitelist.isLiquidityAddressActive(user2)).should.be.equal(false);
            (await this.dexWhitelist.isSwapAddressActive(user2)).should.be.equal(false);
            (await this.dexWhitelist.isFarmAddressActive(user2)).should.be.equal(false);
        });

        context('when users wl disabled', function () {
            beforeEach(async function() {
                await this.dexWhitelist['setLiquidityWlActive'](false, { from: owner });
                await this.dexWhitelist['setSwapWlActive'](false, { from: owner });
                await this.dexWhitelist['setFarmWlActive'](false, { from: owner });
             });

            it('should be success for whitelisted user', async function() {
                (await this.dexWhitelist.isLiquidityAddressActive(user)).should.be.equal(true);
                (await this.dexWhitelist.isSwapAddressActive(user)).should.be.equal(true);
                (await this.dexWhitelist.isFarmAddressActive(user)).should.be.equal(true);
            });

            it('should be success for whitelisted user', async function() {
                (await this.dexWhitelist.isLiquidityAddressActive(user2)).should.be.equal(true);
                (await this.dexWhitelist.isSwapAddressActive(user2)).should.be.equal(true);
                (await this.dexWhitelist.isFarmAddressActive(user2)).should.be.equal(true);
            });
        });
    });

    describe('tokens whitelisted statuses per operation (wl manual enabled after start)', function () {
        beforeEach(async function() {
            await this.dexWhitelist['setTokenWlActive'](true, { from: owner });

            await this.dexWhitelist.setTokenAddressActive(token, true, {
                from: admin
            });
        });

        it('should be success for whitelisted token', async function() {
            (await this.dexWhitelist.isTokenAddressActive(token)).should.be.equal(true);
        });

        it('should be false for not whitelisted token', async function() {
            (await this.dexWhitelist.isTokenAddressActive(token2)).should.be.equal(false);
        });

        context('when token wl disabled', function () {
            beforeEach(async function() {
                await this.dexWhitelist['setTokenWlActive'](false, { from: owner });
            });

            it('should be success for whitelisted token', async function() {
                (await this.dexWhitelist.isTokenAddressActive(token)).should.be.equal(true);
            });

            it('should be success for not whitelisted token', async function() {
                (await this.dexWhitelist.isTokenAddressActive(token2)).should.be.equal(true);
            });

        });
    });
});
