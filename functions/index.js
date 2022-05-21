// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

exports.testFunction = functions.https.onCall((data, context) => {
  functions.logger.info('Test function logs!');
  return 'Hello from Firebase test function!';
});

exports.testAuthFunction = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You are not authorized!');
  }
  const snapshot = await admin.firestore().collection('users').get();
  return snapshot.docs.map((doc) => doc.data());
});
