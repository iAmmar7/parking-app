const { isEmpty, isValidEmail } = require('../utils/helpers');

/**
 * Validate the spotReservation function request.
 * @param {object} payload The request payload.
 * @return {object} The validity flag with error message or null.
 */
function validateCreateInvitation(payload) {
  const { email, name, key, locationId, templateName } = payload;

  if (isEmpty(email) || isEmpty(name) || isEmpty(key) || isEmpty(locationId) || isEmpty(templateName)) {
    return { isValid: false, message: 'Request payload has missing values!' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, message: 'Email is not valid!' };
  }

  return { isValid: true, message: null };
}

module.exports = validateCreateInvitation;
