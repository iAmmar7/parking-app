const testFunction = require('./testFunction');
const testAuthFunction = require('./testAuthFunction');
const spotReservation = require('./spotReservation');
const cancelReservation = require('./cancelReservation');
const createInvitation = require('./createInvitation');
const createUserThroughInvitation = require('./createUserThroughInvitation');
const addBlockedDaysToParkingSpot = require('./addBlockedDaysToParkingSpot');
const toggleAdminState = require('./toggleAdminState');
const deleteUser = require('./deleteUser');
const enableUser = require('./enableUser');

module.exports = {
  testFunction,
  testAuthFunction,
  spotReservation,
  cancelReservation,
  createInvitation,
  createUserThroughInvitation,
  addBlockedDaysToParkingSpot,
  toggleAdminState,
  deleteUser,
  enableUser,
};
