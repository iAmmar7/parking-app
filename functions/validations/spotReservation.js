const { isValidDate } = require('../utils/helpers');

/**
 * Validate the spotReservation function request.
 * @param {object} data The request payload.
 * @return {object} The error message or null.
 */
function validateSpotReservation(data) {
  const { to, from, parkingSpotId } = data;

  if (!to || !from || !parkingSpotId) {
    return { isValid: false, message: 'Payload has missing values!' };
  }

  if (!isValidDate(to)) {
    return { isValid: false, message: 'Invalid start date!' };
  }

  if (!isValidDate(from)) {
    return { isValid: false, message: 'Invalid end date!' };
  }

  return { isValid: true, message: null };
}

module.exports = validateSpotReservation;
