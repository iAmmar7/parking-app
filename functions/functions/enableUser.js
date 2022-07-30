const { UNAUTHENTICATED, INVALID_ARGUMENT, NO_PERMISSION } = require('../utils/constants');
const errorMessage = require('../utils/errors');
const { validateEnableUser } = require('../validations');

/**
 * Delete the user and future reservation.
 * @auth Required
 * @param {object} data The request payload.
 * @param {object} context The firebase context.
 * @param {object} FirebaseRef functions and db reference.
 * @return {object} reservation object.
 */
module.exports = async (data, context, { functions, db, admin }) => {
  functions.logger.log('Request payload', data);

  if (!context.auth) {
    throw new functions.https.HttpsError(UNAUTHENTICATED, errorMessage.NOT_AUTHORIZED);
  }

  const { isValid, message } = validateEnableUser(data);
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
  const userData = userSnapshot.data();
  if (!userSnapshot.exists) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.USER_NOT_FOUND);
  }

  await usersRef.doc(userData.id).update({ active: true });

  await admin.auth().updateUser(userData.id, { disabled: false });

  return Object.assign(userData, { active: true });
};
