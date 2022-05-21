const functions = require('firebase-functions');
const admin = require('firebase-admin');

const { validateSpotReservation } = require('./validations');

admin.initializeApp();


// @name: testFunction
// @description: A function to test the connection
// @auth: Not required
// @request: { data: {} }
// @response: string
exports.testFunction = functions.region('europe-west3').https.onCall((data, context) => {
  functions.logger.info('Test function logs!');
  return 'Hello from Firebase test function!';
});

// @name: testAuthFunction
// @description: A function to test the authentication
// @auth: Required
// @request: { data: {} }
// @response: [ { user1 }, { user2 } ]
exports.testAuthFunction = functions.region('europe-west3').https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You are not authorized!');
  }
  const snapshot = await admin.firestore().collection('users').get();
  return snapshot.docs.map((doc) => doc.data());
});

// @name: spotReservation
// @description: To book a spot for parking
// @auth: Required
// @request: { data: { from: date, to: date, parkingSpotId: string } }
// @response: [ { resrevation1 } ]
exports.spotReservation = functions.region('europe-west3').https.onRequest(async (data, context) => {
  // if (!context.auth) {
  //   throw new functions.https.HttpsError('unauthenticated', 'You are not authorized!');
  // }
  // @TODO; replace data.body with data
  const { isValid, message } = validateSpotReservation(data.body);
  if (!isValid) throw new functions.https.HttpsError('invalid-argument', message);

  // @TODO; replace data.body with data
  const { parkingSpotId } = data.body;
  const spotRef = admin.firestore().collection('parkingspots').doc(parkingSpotId);
  const doc = await spotRef.get();
  if (!doc.exists) {
    throw new functions.https.HttpsError('invalid-argument', 'The given parking spot does not exist!');
  }
  context.send(doc.data());
});
