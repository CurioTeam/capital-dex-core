const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { accounts, contract, defaultSender } = require('@openzeppelin/test-environment');

const {
    BN,
    expectEvent,
    expectRevert,
} = require('@openzeppelin/test-helpers');

require('chai').should();

const Administrated = contract.fromArtifact('AdministratedMock');

describe('Contract whitelist/traits/Administrated.sol', function () {
    const [ owner, admin, admin2, anyone ] = accounts;

    beforeEach(async function () {
        this.administrated = await deployProxy(Administrated);

        await this.administrated.transferOwnership(owner, { from: defaultSender })
    });

    it('should initialize without admins', async function() {
        (await this.administrated.getAdminCount()).should.be.bignumber.equal(new BN(0));
    });

    it('should correct add new admin by owner', async function() {
        await this.administrated.addAdmin(admin, { from: owner });
        (await this.administrated.isAdmin(admin, { from: anyone })).should.be.equal(true);
        (await this.administrated.getAdminCount()).should.be.bignumber.equal(new BN(1));
    });

    it('should fail on add admin by anyone', async function() {
        await expectRevert(
            this.administrated.addAdmin(admin, { from: anyone }),
            'Ownable: caller is not the owner'
        );
    });

    context('with added admin', function() {
        beforeEach(async function() {
            ({ logs: this.logs } =
                await this.administrated.addAdmin(admin, { from: owner }));
        });

        it('should log adding admin event', async function() {
            expectEvent.inLogs(this.logs, 'AddAdmin', {
                admin,
            });
        });

        it('should return correct admin account status', async function() {
            (await this.administrated.isAdmin(admin, { from: anyone })).should.be.equal(true);
        });

        it('should return correct admins count', async function() {
            (await this.administrated.getAdminCount()).should.be.bignumber.equal(new BN(1));
        });

        it('should complete only admin restricted function', async function() {
            await this.administrated.onlyAdminFunction({ from: admin });
        });

        it('should deny access for anyone to restricted function (only admin)', async function() {
            await expectRevert(
                this.administrated.onlyAdminFunction({ from: anyone }),
                'Administrated: sender is not admin'
            );

            await expectRevert(
                this.administrated.onlyAdminFunction({ from: owner }),
                'Administrated: sender is not admin'
            );
        });

        context('with added second admin', function() {
            beforeEach(async function() {
                ({ logs: this.logs } =
                    await this.administrated.addAdmin(admin2, { from: owner }));
            });

            it('should return correct admins count', async function() {
                (await this.administrated.getAdminCount()).should.be.bignumber.equal(new BN(2));
            });

            it('should correct remove second admin by owner', async function() {
                await this.administrated.removeAdmin(admin2, { from: owner });
                (await this.administrated.isAdmin(admin2, { from: anyone })).should.be.equal(false);
                (await this.administrated.getAdminCount()).should.be.bignumber.equal(new BN(1));
            });

            it('should fail on remove second admin by anyone', async function() {
                await expectRevert(
                    this.administrated.removeAdmin(admin2, { from: anyone }),
                    'Ownable: caller is not the owner'
                );
            });

            context('with removed second admin', function() {
                beforeEach(async function() {
                    ({ logs: this.logs } =
                        await this.administrated.removeAdmin(admin2, { from: owner }));
                });

                it('should log removing admin event', async function() {
                    expectEvent.inLogs(this.logs, 'RemoveAdmin', {
                        admin: admin2,
                    });
                });

                it('should return correct second admin account status', async function() {
                    (await this.administrated.isAdmin(admin2, { from: anyone })).should.be.equal(false);
                });

                it('should return correct admins count', async function() {
                    (await this.administrated.getAdminCount()).should.be.bignumber.equal(new BN(1));
                });
            });
        });
    });
});
