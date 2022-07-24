const isSameDay = require('date-fns/isSameDay');
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

  const fromDate = new Date(from);
  const untilDate = new Date(until);

  // Check if parking spot id exists
  const spotDoc = await parkingRef.doc(parkingSpotId).get();
  if (!spotDoc.exists) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.PARKING_NOT_FOUND);
  }

  // Check if parking spot id is active
  const parkingSpot = spotDoc.data();
  if (!parkingSpot.active) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.DISABLED_PARKING_SPOT);
  }

  // Check if parking spot is permanently reserved for others
  if (!isEmpty(parkingSpot.alwaysReservedForIds) && !parkingSpot.alwaysReservedForIds.includes(context.auth.uid)) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.PERMANENT_RESERVATION);
  }

  // Check if the day is blocked for this spot
  if (!isEmpty(parkingSpot.blockedOn)) {
    const blockedDays = parkingSpot.blockedOn;
    for (let i = 0; i < blockedDays.length; i++) {
      const blockedDay = new Date(blockedDays[i]);
      if (isSameDay(fromDate, blockedDay) || isSameDay(untilDate, blockedDay)) {
        throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.BLOCKED_SPOT);
      }
    }
  }

  // Set the query to fetch only those data that lies in between from to until dates
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

  // Check if the duration overlaps with already stored not canceled spot
  if (!isEmpty(reservedSpots)) {
    for (let i = 0; i < reservedSpots.length; i++) {
      const docFrom = reservedSpots[i].from.toDate();
      const docUntil = reservedSpots[i].until.toDate();

      const isOverLapping = areIntervalsOverlapping(
        { start: docFrom, end: docUntil },
        { start: fromDate, end: untilDate },
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
    isHandicappedParking: false,
    createdAt: db.Timestamp.fromDate(new Date()),
    from: db.Timestamp.fromDate(fromDate),
    until: db.Timestamp.fromDate(untilDate),
    label: parkingSpot.parkingSpotNumber && parkingSpot.parkingSpotNumber.toString(),
    locationId: parkingSpot.locationId,
    parkingSpotId: parkingSpot.id,
    userId: context.auth.uid,
  };

  const res = await reservedRef.add(payload);

  return Object.assign(payload, { uid: res.id });
};
