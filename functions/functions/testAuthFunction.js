const { UNAUTHENTICATED } = require('../utils/constants');
const errorMessage = require('../utils/errors');

/**
 * A function to test the authentication.
 * @auth Required
 * @param {object} data The request payload.
 * @param {object} context The firebase context.
 * @param {object} FirebaseRef functions and db reference.
 * @return {array} users document array.
 */
module.exports = async (data, context, { functions, db }) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(UNAUTHENTICATED, errorMessage.NOT_AUTHORIZED);
  }
  const snapshot = await db().collection('users').get();
  return snapshot.docs.map((doc) => doc.data());
};
