const validateSpotReservation = require('./spotReservation');
const validateCancelReservation = require('./cancelReservation');
const validateCreateInvitation = require('./createInvitation');
const validateCreateUserThroughInvitation = require('./createUserThroughInvitation');

module.exports = {
  validateSpotReservation,
  validateCancelReservation,
  validateCreateInvitation,
  validateCreateUserThroughInvitation,
};
