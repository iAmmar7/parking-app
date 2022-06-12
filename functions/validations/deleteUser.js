const { isEmpty } = require('../utils/helpers');

/**
 * Validate the deleteUser function request.
 * @param {object} payload The request payload.
 * @return {object} The validity flag with error message or null.
 */
function validateDeleteUser(payload) {
  const { userId } = payload;

  if (isEmpty(userId)) {
    return { isValid: false, message: 'Request payload has missing values!' };
  }

  return { isValid: true, message: null };
}

module.exports = validateDeleteUser;
