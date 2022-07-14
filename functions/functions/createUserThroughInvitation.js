const { INVALID_ARGUMENT, ALREADY_EXIST, INVITATION_STATUS, NO_PERMISSION } = require('../utils/constants');
const errorMessage = require('../utils/errors');
const { validateCreateUserThroughInvitation } = require('../validations');

/**
 * Create an auth user through invitation key and update the invitation.
 * @auth required
 * @param {object} data The request payload.
 * @param {object} context The firebase context.
 * @param {object} FirebaseRef functions, db, and admin reference.
 * @return {object} inivitation object.
 */
module.exports = async (data, context, { functions, db, admin }) => {
  functions.logger.log('Request payload', data);

  const { isValid, message } = validateCreateUserThroughInvitation(data);
  if (!isValid) throw new functions.https.HttpsError(INVALID_ARGUMENT, message);

  const { email, key, password } = data;
  const usersRef = db().collection('users');
  const invitationsRef = db().collection('invitations');

  // Decline if the invitation is not found
  const invitationSnapshot = await invitationsRef.where('email', '==', email).get();
  if (invitationSnapshot.size < 1) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.INVITATION_NOT_FOUND);
  }

  const invitations = [];
  invitationSnapshot.forEach((doc) => {
    const docData = doc.data();
    invitations.push(Object.assign(docData, { id: doc.id }));
  });
  const invitationDoc = invitations[0];

  // Decline if the key does not match
  if (invitationDoc.key !== key) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.INVITATION_KEYS_MISMATCH);
  }

  // Decline if an active account with the same email already exist otherwise update it
  const userSnapshpt = await usersRef.where('email', '==', email).get();
  if (userSnapshpt.size > 0) {
    const users = [];
    userSnapshpt.forEach((doc) => {
      const docData = doc.data();
      users.push(docData);
    });
    const user = users[0];
    if (users.active) {
      throw new functions.https.HttpsError(ALREADY_EXIST, errorMessage.EMAIL_ALREADY_EXIST_IN_USERS);
    }

    await usersRef.doc(user.id).update({ active: true });
    await admin.auth().updateUser(user.id, { password, disabled: false });

    return { user: Object.assign(user, { active: true }) };
  }

  admin
    .auth()
    .createUser({ email, password })
    .then(async (res) => {
      await admin.auth().setCustomUserClaims(res.uid, { role: 'user' });
      await invitationsRef.doc(invitationDoc.id).update({ invitationStatus: INVITATION_STATUS[1] });
      return res;
    })
    .catch((err) => {
      return err;
    });
};
