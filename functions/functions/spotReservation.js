const areIntervalsOverlapping = require('date-fns/areIntervalsOverlapping');

const { UNAUTHENTICATED, INVALID_ARGUMENT, NO_PERMISSION } = require('../utils/constants');
const errorMessage = require('../utils/errors');
const { isEmpty } = require('../utils/helpers');
const { validateSpotReservation } = require('../validations');

/**
 * Book a spot for parking.
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

  const { isValid, message } = validateSpotReservation(data);
  if (!isValid) throw new functions.https.HttpsError(INVALID_ARGUMENT, message);

  const { from, until, parkingSpotId } = data;
  const parkingRef = db().collection('parkingspots');
  const reservedRef = db().collection('reservations');

  const spotDoc = await parkingRef.doc(parkingSpotId).get();
  if (!spotDoc.exists) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.PARKING_NOT_FOUND);
  }
  const parkingSpot = spotDoc.data();
  if (parkingSpot.disabledParking || !parkingSpot.active) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.DISABLED_PARKING_SPOT);
  }
  if (!isEmpty(parkingSpot.allwaysReservedForIds) && !parkingSpot.allwaysReservedForIds.includes(context.auth.uid)) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.PERMANENT_RESERVATION);
  }

  const startOfDay = new Date(from);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(until);
  endOfDay.setHours(23, 59, 59, 999);

  const reservedSnapshot = await reservedRef
    .where('parkingSpotId', '==', parkingSpotId)
    .where('from', '>=', db.Timestamp.fromDate(startOfDay))
    .where('from', '<=', db.Timestamp.fromDate(endOfDay))
    .get();

  const reservedSpots = [];
  reservedSnapshot.forEach((doc) => {
    const docData = doc.data();
    reservedSpots.push(docData);
  });

  if (!isEmpty(reservedSpots)) {
    for (let i = 0; i < reservedSpots.length; i++) {
      const docFrom = reservedSpots[i].from;
      const docUntil = reservedSpots[i].until;
      const requestFrom = new Date(from);
      const requestUntil = new Date(until);

      const isOverLapping = areIntervalsOverlapping(
        { start: docFrom, end: docUntil },
        { start: requestFrom, end: requestUntil },
      );
      if (!reservedSpots[i].canceled && isOverLapping) {
        return {
          errorMessage: errorMessage.TIME_OVERLAPPING,
          reservedSpots,
        };
      }
    }
  }

  const payload = {
    canceled: false,
    createdAt: db.Timestamp.fromDate(new Date()),
    from: db.Timestamp.fromDate(new Date(from)),
    until: db.Timestamp.fromDate(new Date(until)),
    label: parkingSpot.parkingSpotNumber.toString(),
    locationId: parkingSpot.locationId,
    parkingSpotId: parkingSpot.id,
    userId: context.auth.uid,
  };

  const res = await reservedRef.add(payload);

  return Object.assign(payload, { uid: res.id });
};
