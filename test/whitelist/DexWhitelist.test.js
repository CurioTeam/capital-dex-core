const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { accounts, contract, defaultSender } = require('@openzeppelin/test-environment');

const {
    constants,
    expectEvent,
    expectRevert,
} = require('@openzeppelin/test-helpers');

const { ZERO_ADDRESS } = constants;

require('chai').should();

const DexWhitelist = contract.fromArtifact('DexWhitelist');

describe('Contract whitelist/DexWhitelist.sol', function () {
    const [
        owner,
        admin,
        anyone,
        carTokenController,
        token,
        token2
    ] = accounts;

    const deployCarTokenController = async () => {
        // TODO: add deploy logic

        return {
            address: carTokenController,
        }
    };

    beforeEach(async function () {
        this.dexWhitelist = await deployProxy(DexWhitelist, [], {
            unsafeAllowCustomTypes: true,
        });

        await this.dexWhitelist.transferOwnership(owner, { from: defaultSender });

        await this.dexWhitelist.addAdmin(admin, { from: owner });
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
                    { from: anyone}),
                'Administrated: sender is not admin'
            );
        });

    });

    describe('users wl management', function () {
        // TODO: add tests
    });

    describe('users whitelisted statuses per operation', function () {
        // TODO: add tests
    });
});
