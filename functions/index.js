const functions = require('firebase-functions');
const admin = require('firebase-admin');
const areIntervalsOverlapping = require('date-fns/areIntervalsOverlapping');

const { validateSpotReservation } = require('./validations');
const { REGION, UNAUTHENTICATED, INVALID_ARGUMENT, NO_PERMISSION } = require('./utils/constants');
const errorMessage = require('./utils/errors');
const { isEmpty } = require('./utils/helpers');

admin.initializeApp();
const db = admin.firestore;

// @name: testFunction
// @description: A function to test the connection
// @auth: Not required
// @request: { data: {} }
// @response: string
exports.testFunction = functions.region(REGION).https.onCall((data, context) => {
  functions.logger.info('Test function logs!');
  return 'Hello from Firebase test function!';
});

// @name: testAuthFunction
// @description: A function to test the authentication
// @auth: Required
// @request: { data: {} }
// @response: [ { user1 }, { user2 } ]
exports.testAuthFunction = functions.region(REGION).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(UNAUTHENTICATED, errorMessage.NOT_AUTHORIZED);
  }
  const snapshot = await db().collection('users').get();
  return snapshot.docs.map((doc) => doc.data());
});

// @name: createUserEntry
// @description: A background trigger to set fields on user creation
exports.createUserEntry = functions
  .region(REGION)
  .auth.user()
  .onCreate((user) => {
    return db().collection('users').doc(user.uid).set({
      email: user.email,
      id: user.uid,
      firstName: '',
      lastName: '',
    });
  });

// @name: spotReservation
// @description: Book a spot for parking
// @auth: Required
// @request: { data: { from: date, until: date, parkingSpotId: string } }
// @response: { response: [], totalReservation: int, failToReserve: int, message: string }
exports.spotReservation = functions.region(REGION).https.onCall(async (data, context) => {
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
      if (!reservedSpots[i].cancelled && isOverLapping) {
        return {
          errorMessage: errorMessage.TIME_OVERLAPPING,
          reservedSpots,
        };
      }
    }
  }

  const payload = {
    cancelled: false,
    createdAt: db.Timestamp.fromDate(new Date()),
    from: db.Timestamp.fromDate(new Date(from)),
    until: db.Timestamp.fromDate(new Date(until)),
    label: parkingSpot.parkingSpotNumber,
    locationId: parkingSpot.locationId,
    parkingSpotId: parkingSpot.id,
    userId: context.auth.uid,
  };

  const res = await reservedRef.add(payload);

  return Object.assign(payload, { uid: res.id });
});
