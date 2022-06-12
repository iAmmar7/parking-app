const validateSpotReservation = require('./spotReservation');
const validateCancelReservation = require('./cancelReservation');
const validateCreateInvitation = require('./createInvitation');
const validateCreateUserThroughInvitation = require('./createUserThroughInvitation');
const validateAddBlockedDaysToParkingSpot = require('./addBlockedDaysToParkingSpot');
const validateToggleAdminState = require('./toggleAdminState');

module.exports = {
  validateSpotReservation,
  validateCancelReservation,
  validateCreateInvitation,
  validateCreateUserThroughInvitation,
  validateAddBlockedDaysToParkingSpot,
  validateToggleAdminState,
};
