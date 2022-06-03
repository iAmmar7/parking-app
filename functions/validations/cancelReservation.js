const { isEmpty } = require('../utils/helpers');

/**
 * Validate the cancelReservation function request.
 * @param {object} payload The request payload.
 * @return {object} The validity flag with error message or null.
 */
function validateCancelReservation(payload) {
  const { reservationId } = payload;

  if (isEmpty(reservationId)) {
    return { isValid: false, message: 'Payload has missing values!' };
  }

  return { isValid: true, message: null };
}

module.exports = validateCancelReservation;
