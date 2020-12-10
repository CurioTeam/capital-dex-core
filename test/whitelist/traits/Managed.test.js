const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { accounts, contract, defaultSender } = require('@openzeppelin/test-environment');

const {
    BN,
    expectEvent,
    expectRevert,
} = require('@openzeppelin/test-helpers');

require('chai').should();

const Managed = contract.fromArtifact('ManagedMock');

describe('Contract whitelist/traits/Managed.sol', function () {
    const [ admin, manager, manager2, anyone ] = accounts;

    beforeEach(async function () {
        this.managed = await deployProxy(Managed);

        await this.managed.addAdmin(admin, { from: defaultSender });
    });

    it('should initialize without managers', async function() {
        (await this.managed.getManagerCount()).should.be.bignumber.equal(new BN(0));
    });

    it('should correct add new manager by admin', async function() {
        await this.managed.addManager(manager, { from: admin });
        (await this.managed.isManager(manager, { from: anyone })).should.be.equal(true);
        (await this.managed.getManagerCount()).should.be.bignumber.equal(new BN(1));
    });

    it('should fail on add manager by anyone', async function() {
        await expectRevert(
            this.managed.addManager(manager, { from: anyone }),
            'Administrated: sender is not admin'
        );
    });

    context('with added manager', function() {
        beforeEach(async function() {
            ({ logs: this.logs } =
                await this.managed.addManager(manager, { from: admin }));
        });

        it('should log adding manager event', async function() {
            expectEvent.inLogs(this.logs, 'AddManager', {
                manager,
                admin,
            });
        });

        it('should return correct manager account status', async function() {
            (await this.managed.isManager(manager, { from: anyone })).should.be.equal(true);
        });

        it('should return correct managers count', async function() {
            (await this.managed.getManagerCount()).should.be.bignumber.equal(new BN(1));
        });

        it('should complete only manager restricted function', async function() {
            await this.managed.onlyManagerFunction({ from: manager });
        });

        it('should deny access for anyone to restricted function (only manager)', async function() {
            await expectRevert(
                this.managed.onlyManagerFunction({ from: anyone }),
                'Managered: sender is not manager'
            );

            await expectRevert(
                this.managed.onlyManagerFunction({ from: admin }),
                'Managered: sender is not manager'
            );
        });

        it('should complete only admin or manager restricted function', async function() {
            await this.managed.onlyAdminOrManagerFunction({ from: admin });
            await this.managed.onlyAdminOrManagerFunction({ from: manager });
        });

        it('should deny access for anyone to restricted function (only admin or manager)', async function() {
            await expectRevert(
                this.managed.onlyAdminOrManagerFunction({ from: anyone }),
                'Managered: sender is not admin or manager'
            );
        });

        context('with added second manager', function() {
            beforeEach(async function() {
                ({ logs: this.logs } =
                    await this.managed.addManager(manager2, { from: admin }));
            });

            it('should return correct managers count', async function() {
                (await this.managed.getManagerCount()).should.be.bignumber.equal(new BN(2));
            });

            it('should correct remove second manager by admin', async function() {
                await this.managed.removeManager(manager2, { from: admin });
                (await this.managed.isManager(manager2, { from: anyone })).should.be.equal(false);
                (await this.managed.getManagerCount()).should.be.bignumber.equal(new BN(1));
            });

            it('should fail on remove second manager by anyone', async function() {
                await expectRevert(
                    this.managed.removeManager(manager2, { from: anyone }),
                    'Administrated: sender is not admin'
                );
            });

            context('with removed second manager', function() {
                beforeEach(async function() {
                    ({ logs: this.logs } =
                        await this.managed.removeManager(manager2, { from: admin }));
                });

                it('should log removing manager event', async function() {
                    expectEvent.inLogs(this.logs, 'RemoveManager', {
                        manager: manager2,
                        admin,
                    });
                });

                it('should return correct second manager account status', async function() {
                    (await this.managed.isManager(manager2, { from: anyone })).should.be.equal(false);
                });

                it('should return correct managers count', async function() {
                    (await this.managed.getManagerCount()).should.be.bignumber.equal(new BN(1));
                });
            });
        });
    });
});
