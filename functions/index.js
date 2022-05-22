const functions = require('firebase-functions');
const admin = require('firebase-admin');
const isAfter = require('date-fns/isAfter');
const addDays = require('date-fns/addDays');

const { validateSpotReservation } = require('./validations');
const { REGION, UNAUTHENTICATED, INVALID_ARGUMENT, NO_PERMISSION } = require('./utils/constants');
const errorMessage = require('./utils/errors');

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

// @name: spotReservation
// @description: Book multiple spots for parking
// @auth: Required
// @request: { data: { from: date, to: date, parkingSpotId: string } }
// @response: { response: [], totalReservation: int, failToReserve: int, message: string }
exports.spotReservation = functions.region(REGION).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(UNAUTHENTICATED, 'You are not authorized!');
  }

  const { isValid, message } = validateSpotReservation(data);
  if (!isValid) throw new functions.https.HttpsError(INVALID_ARGUMENT, message);

  const { to, from, parkingSpotId } = data;
  const parkingRef = db().collection('parkingspots');
  const reservedRef = db().collection('reservations');

  const spotDoc = await parkingRef.doc(parkingSpotId).get();
  if (!spotDoc.exists) {
    throw new functions.https.HttpsError(INVALID_ARGUMENT, errorMessage.PARKING_NOT_FOUND);
  }
  const parkingSpot = spotDoc.data();
  if (parkingSpot.disabledParking || parkingSpot.allwaysReservedForId || !parkingSpot.active) {
    throw new functions.https.HttpsError(NO_PERMISSION, errorMessage.NO_PARKING_PERMISSION);
  }

  const startDate = db.Timestamp.fromDate(new Date(from));
  const endDate = db.Timestamp.fromDate(new Date(to));
  const reservedSnapshot = await reservedRef
    .where('spotNumber', '==', parkingSpot.parkingSpotNumber)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .get();

  const reservedSpots = [];
  reservedSnapshot.forEach((doc) => {
    const docData = doc.data();
    reservedSpots.push(docData);
  });

  const batch = db().batch();
  let iterationDate = startDate.toDate();
  while (!isAfter(iterationDate, endDate.toDate())) {
    const newReservation = db().collection('reservations').doc();

    const dateExist = reservedSpots.findIndex((reservedDate) => {
      const timestamp = new db.Timestamp(reservedDate.date._seconds, reservedDate.date._nanoseconds);
      const reservedDateFormat = new Date(timestamp.toDate().toDateString());
      const iterationDateFormat = new Date(iterationDate.toDateString());
      return reservedDateFormat.valueOf() === iterationDateFormat.valueOf();
    });

    if (dateExist < 0) {
      const payload = {
        locationId: parkingSpot.locationId,
        spotNumber: parkingSpot.parkingSpotNumber,
        userId: context.auth.uid,
        date: db.Timestamp.fromDate(new Date(iterationDate)),
        createdAt: db.Timestamp.fromDate(new Date()),
      };
      batch.set(newReservation, payload);
    }

    iterationDate = addDays(iterationDate, 1);
  }
  const response = await batch.commit();

  context.send({
    response,
    totalReservations: response.length,
    failToReserve: reservedSpots.length,
    message: `${response.length} parking spots have been reserved!`,
  });
});
