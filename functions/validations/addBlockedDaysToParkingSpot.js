const { isEmpty, isArray } = require('../utils/helpers');

/**
 * Validate the addBlockedDaysToParkingSpot function request.
 * @param {object} payload The request payload.
 * @return {object} The validity flag with error message or null.
 */
function validateAddBlockedDaysToParkingSpot(payload) {
  const { parkingSpotId, blockedOn } = payload;

  if (isEmpty(parkingSpotId) || isEmpty(blockedOn)) {
    return { isValid: false, message: 'Request payload has missing values!' };
  }

  if (!isArray(blockedOn)) {
    return { isValid: false, message: 'blockedOn should be an array!' };
  }

  return { isValid: true, message: null };
}

module.exports = validateAddBlockedDaysToParkingSpot;
