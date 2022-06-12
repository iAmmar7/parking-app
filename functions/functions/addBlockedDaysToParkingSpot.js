const { UNAUTHENTICATED, INVALID_ARGUMENT, NO_PERMISSION } = require('../utils/constants');
const errorMessage = require('../utils/errors');
const { first, last } = require('../utils/helpers');
const { validateAddBlockedDaysToParkingSpot } = require('../validations');

/**
 * Add a blocked days to a parking spot.
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

  const { isValid, message } = validateAddBlockedDaysToParkingSpot(data);
  if (!isValid) throw new functions.https.HttpsError(INVALID_ARGUMENT, message);

  const { parkingSpotId, blockedOn } = data;
  const usersRef = db().collection('users');
  const spotRef = db().collection('parkingspots');
  const reservedRef = db().collection('reservations');

  // Decline if the requester is not an admin
  const requesterSnapshot = await usersRef.doc(context.auth.uid).get();
  const requester = requesterSnapshot.data();
  if (!requester.admin) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.ONLY_ADMINS);
  }

  // Decline if the parking spot does not exist
  const spotDoc = await spotRef.doc(parkingSpotId).get();
  if (!spotDoc.exists) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.PARKING_NOT_FOUND);
  }

  // Sort the blockedOn array
  const sortedBlockedOn = blockedOn.sort((a, b) => new Date(a) - new Date(b));

  const reservedSnapshot = await reservedRef
    .where('parkingSpotId', '==', parkingSpotId)
    .where('canceled', '==', false)
    .where('from', '>=', db.Timestamp.fromDate(new Date(first(sortedBlockedOn))))
    .where('from', '<=', db.Timestamp.fromDate(new Date(last(sortedBlockedOn))))
    .get();

  if (reservedSnapshot.size > 0) {
    const reservedSpots = [];
    reservedSnapshot.forEach((doc) => {
      const docData = doc.data();
      reservedSpots.push(docData);
    });
    return {
      errorMessage: errorMessage.RESERVATION_EXIST_ON_BLOCKED_DAYS,
      reservedSpots,
    };
  }

  const spotData = spotDoc.data();
  const newBlockedOn = [...(spotData.blockedOn || []), ...blockedOn];
  const sortedNewBlockedOn = newBlockedOn.sort((a, b) => new Date(a) - new Date(b));
  const uniqueBlockedOn = [...new Set(sortedNewBlockedOn)];
  const newBlockedOnData = { blockedOn: uniqueBlockedOn };

  await spotRef.doc(spotData.id).update(newBlockedOnData);

  return Object.assign(spotData, newBlockedOnData);
};
