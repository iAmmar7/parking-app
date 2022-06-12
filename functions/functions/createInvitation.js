const addDays = require('date-fns/addDays');

const {
  UNAUTHENTICATED,
  INVALID_ARGUMENT,
  ALREADY_EXIST,
  INVITATION_STATUS,
  NO_PERMISSION,
} = require('../utils/constants');
const errorMessage = require('../utils/errors');
const { validateCreateInvitation } = require('../validations');

/**
 * Create a user invitation and email document
 * @auth required
 * @param {object} data The request payload.
 * @param {object} context The firebase context.
 * @param {object} FirebaseRef functions and db reference.
 * @return {object} inivitation object.
 */
module.exports = async (data, context, { functions, db }) => {
  functions.logger.log('Request payload', data);

  if (!context.auth) {
    throw new functions.https.HttpsError(UNAUTHENTICATED, errorMessage.NOT_AUTHORIZED);
  }

  const { isValid, message } = validateCreateInvitation(data);
  if (!isValid) throw new functions.https.HttpsError(INVALID_ARGUMENT, message);

  const { email, name, key, locationId, templateName } = data;
  const usersRef = db().collection('users');
  const emailsRef = db().collection('emails');
  const locationsRef = db().collection('locations');
  const invitationsRef = db().collection('invitations');

  // Decline if the inviter is not an admin
  const inviterSnapshot = await usersRef.doc(context.auth.uid).get();
  const inviter = inviterSnapshot.data();
  if (!inviter.admin) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.ONLY_ADMINS_CAN_INVITE);
  }

  // Decline if the invitee already has an account
  const inviteeSnapshot = await usersRef.where('email', '==', email).get();
  if (inviteeSnapshot.size > 0) {
    throw new functions.https.HttpsError(ALREADY_EXIST, errorMessage.EMAIL_ALREADY_EXIST_IN_USERS);
  }

  // Decline if the location does not exist in db
  const locationSnapshot = await locationsRef.doc(locationId).get();
  if (!locationSnapshot.exists) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.LOCATION_NOT_FOUND);
  }

  // Update the expiry in invitation and state in email; if the invite has already been sent
  const invitationSnapshot = await invitationsRef.where('email', '==', email).get();
  if (invitationSnapshot.size > 0) {
    const invitations = [];
    invitationSnapshot.forEach((doc) => {
      const docData = doc.data();
      invitations.push(Object.assign(docData, { id: doc.id }));
    });
    const invitationDoc = invitations[0];
    const newExpiry = db.Timestamp.fromDate(addDays(new Date(), 7));
    await invitationsRef.doc(invitationDoc.id).update({ expireBy: newExpiry });
    await emailsRef.doc(invitationDoc.emailId).update({ 'delivery.state': 'RETRY' });

    return { invitation: Object.assign(invitationDoc, { expireBy: newExpiry }) };
  }

  const emailPayload = {
    to: [email],
    template: {
      data: {
        yourEmailAddress: email,
        yourKey: key,
      },
      name: templateName,
    },
  };

  const emailResponse = await emailsRef.add(emailPayload);

  const invitationPayload = {
    createdAt: db.Timestamp.fromDate(new Date()),
    invitedBy: context.auth.uid,
    emailId: emailResponse.id,
    email,
    name,
    key,
    locationId,
    invitationStatus: INVITATION_STATUS[0],
    expireBy: db.Timestamp.fromDate(addDays(new Date(), 7)),
  };

  const invitationResponse = await invitationsRef.add(invitationPayload);

  return {
    invitation: Object.assign(invitationPayload, { uid: invitationResponse.id }),
  };
};
