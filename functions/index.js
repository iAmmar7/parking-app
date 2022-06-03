const functions = require('firebase-functions');
const admin = require('firebase-admin');

const { REGION } = require('./utils/constants');
const { testFunction, testAuthFunction, spotReservation, cancelReservation } = require('./functions');
const { createUserEntry } = require('./triggers');

admin.initializeApp();
const db = admin.firestore;

/**
 * @Functions: 4
 */
exports.testFunction = functions.region(REGION).https.onCall((data, context) => {
  return testFunction(data, context, { functions, db });
});

exports.testAuthFunction = functions.region(REGION).https.onCall(async (data, context) => {
  return testAuthFunction(data, context, { functions, db });
});

exports.spotReservation = functions.region(REGION).https.onCall(async (data, context) => {
  return spotReservation(data, context, { functions, db });
});

exports.cancelReservation = functions.region(REGION).https.onCall(async (data, context) => {
  return cancelReservation(data, context, { functions, db });
});

/**
 * @Triggers: 1
 */
exports.createUserEntry = functions
  .region(REGION)
  .auth.user()
  .onCreate((user) => {
    return createUserEntry(db, user);
  });
