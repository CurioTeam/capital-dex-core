const { deployProxy } = require('@openzeppelin/truffle-upgrades');

const { accounts, contract, defaultSender } = require('@openzeppelin/test-environment');

const {
    expectEvent,
    expectRevert,
} = require('@openzeppelin/test-helpers');

require('chai').should();

const Pausable = contract.fromArtifact('PausableMock');

describe('Contract whitelist/traits/Pausable.sol', function () {
    const [ owner, anyone ] = accounts;

    beforeEach(async function () {
        this.pausable = await deployProxy(Pausable);

        await this.pausable.transferOwnership(owner, { from: defaultSender });
    });

    it('should initialize with unpaused state', async function() {
        (await this.pausable.paused()).should.be.equal(false);
    });

    it('should fail on pause by anyone', async function() {
        await expectRevert(
            this.pausable.pause({ from: anyone }),
            'Ownable: caller is not the owner'
        );
    });

    it('should pause by owner', async function() {
        await this.pausable.pause({ from: owner });
    });

    context('when paused', function() {
        beforeEach(async function() {
            ({ logs: this.logs } = await this.pausable.pause({ from: owner }));
        });

        it('should be paused', async function() {
            (await this.pausable.paused()).should.be.equal(true);
        });

        it('should log pause event', async function() {
            expectEvent.inLogs(this.logs, 'Paused');
        });

        it('should fail on pause', async function() {
            await expectRevert(
                this.pausable.pause({ from: owner }),
                'Pausable: paused'
            );
        });

        it('reverts on call pausable restricted function (when not paused)', async function() {
            await expectRevert(
                this.pausable.whenNotPausedFunction({ from: anyone }),
                'Pausable: paused'
            );
        });

        it('should call pausable restricted function (when paused)', async function() {
            await this.pausable.whenPausedFunction({ from: anyone });
        });

        it('should fail on unpause by anyone', async function() {
            await expectRevert(
                this.pausable.unpause({ from: anyone }),
                'Ownable: caller is not the owner'
            );
        });

        it('should unpause by owner', async function() {
            await this.pausable.unpause({ from: owner });
        });

        context('when unpaused', function() {
            beforeEach(async function() {
                ({ logs: this.logs } = await this.pausable.unpause({ from: owner }));
            });

            it('should be unpaused', async function() {
                (await this.pausable.paused()).should.be.equal(false);
            });

            it('should log unpause event', async function() {
                expectEvent.inLogs(this.logs, 'Unpaused');
            });

            it('should fail on unpause', async function() {
                await expectRevert(
                    this.pausable.unpause({ from: owner }),
                    'Pausable: not paused'
                );
            });

            it('should fail on call pausable restricted function (when paused)', async function() {
                await expectRevert(
                    this.pausable.whenPausedFunction({ from: anyone },),
                    'Pausable: not paused'
                );
            });

            it('should call pausable restricted function (when not paused)', async function() {
                await this.pausable.whenNotPausedFunction({ from: anyone });
            });
        });
    });
});
