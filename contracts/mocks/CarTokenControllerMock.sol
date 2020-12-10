pragma solidity >=0.6.0;

contract CarTokenControllerMock {
    mapping(address => bool) public users;

    function addUserToWhitelist(address user) external {
        users[user] = true;
    }

    function removeUserFromWhitelist(address user) external {
        users[user] = false;
    }

    function isInvestorAddressActive(address account) external view returns (bool) {
        return users[account];
    }
}
