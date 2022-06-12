const validateSpotReservation = require('./spotReservation');
const validateCancelReservation = require('./cancelReservation');
const validateCreateInvitation = require('./createInvitation');
const validateCreateUserThroughInvitation = require('./createUserThroughInvitation');
const addBlockedDaysToParkingSpot = require('./addBlockedDaysToParkingSpot');

module.exports = {
  validateSpotReservation,
  validateCancelReservation,
  validateCreateInvitation,
  validateCreateUserThroughInvitation,
  addBlockedDaysToParkingSpot,
};
