/**
 * A background trigger to set fields on user creation.
 * @param {object} db The database reference.
 * @param {object} user The user reference.
 * @return {object} Firebase stored entry.
 */
module.exports = (db, user) => {
  return db()
    .collection('users')
    .doc(user.uid)
    .set({
      email: user.email,
      id: user.uid,
      firstName: user.displayName ? user.displayName.split('/')[0] : '',
      lastName: user.displayName ? user.displayName.split('/')[1] : '',
      admin: false,
      active: true,
    });
};
