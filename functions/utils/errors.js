const errors = {
  NOT_AUTHORIZED: 'You are not authorized!',
  PARKING_NOT_FOUND: 'The given parking spot does not exist!',
  DISABLED_PARKING_SPOT: 'The parking spot is either inactive or disabled!',
  PERMANENT_RESERVATION: 'The parking spot is reserved permanently for somebody else!',
  TIME_OVERLAPPING: 'The time is overlapping with other reservation!',
  SOMETHING_WENT_WRONG: 'Oops! Something went wrong!',
  RESERVATION_NOT_FOUND: 'Reservation spot not found!',
  ALREADY_CANCELED: 'This reservation has already been canceled!',
  RESERVATION_CANCEL_NOT_ALLOWED: 'You are not allowed to cancel this reservation!',
  EMAIL_ALREADY_EXIST_IN_USERS: 'The given email already exist in users document!',
  INVITATION_ALREADY_SENT: 'The invitation has already been sent to this email!',
  ONLY_ADMINS_CAN_INVITE: 'Only admins can invite other users!',
  LOCATION_NOT_FOUND: 'The given location id does not exist!',
};

module.exports = errors;
