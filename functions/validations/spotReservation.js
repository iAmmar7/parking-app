const isSameDay = require('date-fns/isSameDay');
const isEqual = require('date-fns/isEqual');

const { isValidDateTime, isEmpty } = require('../utils/helpers');

/**
 * Validate the spotReservation function request.
 * @param {object} payload The request payload.
 * @return {object} The validity flag with error message or null.
 */
function validateSpotReservation(payload) {
  const { from, until, parkingSpotId } = payload;

  if (isEmpty(until) || isEmpty(from) || isEmpty(parkingSpotId)) {
    return { isValid: false, message: 'Payload has missing values!' };
  }

  if (!isValidDateTime(from)) {
    return { isValid: false, message: 'Invalid start date!' };
  }

  if (!isValidDateTime(until)) {
    return { isValid: false, message: 'Invalid end date!' };
  }

  if (!isSameDay(new Date(from), new Date(until))) {
    return { isValid: false, message: 'Day should be same for both dates!' };
  }

  if (isEqual(new Date(from), new Date(until))) {
    return { isValid: false, message: 'From and until date times should not be same!' };
  }

  return { isValid: true, message: null };
}

module.exports = validateSpotReservation;
