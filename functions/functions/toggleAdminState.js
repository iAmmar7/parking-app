const { UNAUTHENTICATED, INVALID_ARGUMENT, NO_PERMISSION } = require('../utils/constants');
const errorMessage = require('../utils/errors');
const { validateToggleAdminState } = require('../validations');

/**
 * Toggle the admin state of user.
 * @auth Required
 * @param {object} data The request payload.
 * @param {object} context The firebase context.
 * @param {object} FirebaseRef functions and db reference.
 * @return {object} reservation object.
 */
module.exports = async (data, context, { functions, db }) => {
  functions.logger.log('Request payload', data);

  if (!context.auth) {
    throw new functions.https.HttpsError(UNAUTHENTICATED, errorMessage.NOT_AUTHORIZED);
  }

  const { isValid, message } = validateToggleAdminState(data);
  if (!isValid) throw new functions.https.HttpsError(INVALID_ARGUMENT, message);

  const { userId } = data;
  const usersRef = db().collection('users');

  // Decline if the requester is not an admin
  const requesterSnapshot = await usersRef.doc(context.auth.uid).get();
  const requester = requesterSnapshot.data();
  if (!requester.admin) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.ONLY_ADMINS);
  }

  // Decline if the user does not exist
  const userSnapshot = await usersRef.doc(userId).get();
  if (!userSnapshot.exists) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.USER_NOT_FOUND);
  }
  const userDoc = userSnapshot.data();

  const newAdminState = { admin: !userDoc.admin };
  await usersRef.doc(userId).update(newAdminState);

  return Object.assign(userDoc, newAdminState);
};
