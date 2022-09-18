const functions = require('firebase-functions');
const admin = require('firebase-admin');

const { REGION } = require('./utils/constants');
const {
  testFunction,
  testAuthFunction,
  spotReservation,
  cancelReservation,
  createInvitation,
  createUserThroughInvitation,
  addBlockedDaysToParkingSpot,
  toggleAdminState,
  deleteUser,
  enableUser,
} = require('./functions');
const { createUserEntry } = require('./triggers');

admin.initializeApp();
const db = admin.firestore;

/**
 * @Functions: 10
 */
exports.testFunction = functions.region(REGION).https.onCall((data, context) => {
  return testFunction(data, context, { functions, db });
});

exports.testAuthFunction = functions.region(REGION).https.onCall((data, context) => {
  return testAuthFunction(data, context, { functions, db });
});

exports.spotReservation = functions
  .runWith({
    timeoutSeconds: 120,
  })
  .region(REGION)
  .https.onCall((data, context) => {
    return spotReservation(data, context, { functions, db });
  });

exports.cancelReservation = functions.region(REGION).https.onCall((data, context) => {
  return cancelReservation(data, context, { functions, db });
});

exports.createInvitation = functions
  .runWith({
    timeoutSeconds: 120,
  })
  .region(REGION)
  .https.onCall((data, context) => {
    return createInvitation(data, context, { functions, db });
  });

exports.createUserThroughInvitation = functions.region(REGION).https.onCall((data, context) => {
  return createUserThroughInvitation(data, context, { functions, db, admin });
});

exports.addBlockedDaysToParkingSpot = functions.region(REGION).https.onCall((data, context) => {
  return addBlockedDaysToParkingSpot(data, context, { functions, db });
});

exports.toggleAdminState = functions.region(REGION).https.onCall((data, context) => {
  return toggleAdminState(data, context, { functions, db, admin });
});

exports.deleteUser = functions.region(REGION).https.onCall((data, context) => {
  return deleteUser(data, context, { functions, db, admin });
});

exports.enableUser = functions.region(REGION).https.onCall((data, context) => {
  return enableUser(data, context, { functions, db, admin });
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
