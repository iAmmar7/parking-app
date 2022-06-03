const { UNAUTHENTICATED, NO_PERMISSION, INVALID_ARGUMENT } = require('../utils/constants');
const errorMessage = require('../utils/errors');
const { validateCancelReservation } = require('../validations');

/**
 * Cancel a parking spot reservation.
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

  const { isValid, message } = validateCancelReservation(data);
  if (!isValid) throw new functions.https.HttpsError(INVALID_ARGUMENT, message);

  const { reservationId } = data;
  const reservedRef = db().collection('reservations');

  const reservedDoc = await reservedRef.doc(reservationId).get();
  if (!reservedDoc.exists) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.RESERVATION_NOT_FOUND);
  }
  const reservation = reservedDoc.data();
  if (reservation.canceled) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.ALREADY_CANCELED);
  }
  if (reservation.userId !== context.auth.uid) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.RESERVATION_CANCEL_NOT_ALLOWED);
  }

  await reservedRef.doc(reservationId).update({ canceled: true });

  return Object.assign(reservation, { canceled: true });
};
