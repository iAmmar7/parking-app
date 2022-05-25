/**
 * A function to test the connection.
 * @auth Not required
 * @param {object} data The request payload.
 * @param {object} context The firebase context.
 * @param {object} FirebaseRef functions and db reference.
 * @return {string} message.
 */
module.exports = (data, context, { functions, db }) => {
  functions.logger.info('Test function logs!');
  return 'Hello from Firebase test function!';
};
