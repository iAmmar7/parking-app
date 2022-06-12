const { isEmpty, isValidEmail } = require('../utils/helpers');

/**
 * Validate the createUserThroughInvitation function request.
 * @param {object} payload The request payload.
 * @return {object} The validity flag with error message or null.
 */
function validateCreateUserThroughInvitation(payload) {
  const { email, key, password } = payload;

  if (isEmpty(email) || isEmpty(key) || isEmpty(password)) {
    return { isValid: false, message: 'Request payload has missing values!' };
  }

  if (!isValidEmail(email)) {
    return { isValid: false, message: 'Email is not valid!' };
  }

  return { isValid: true, message: null };
}

module.exports = validateCreateUserThroughInvitation;
