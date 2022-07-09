const { LOCALE } = require('./constants');

const errorsInEn = {
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
  INVITATION_NOT_FOUND: 'No invitation has been sent to this user!',
  INVITATION_KEYS_MISMATCH: 'Invitation key does not match with the stored key!',
  RESERVATION_EXIST_ON_BLOCKED_DAYS: 'There are reservations on one or more blocked days!',
  BLOCKED_SPOT: 'The parking spot is blocked on this day!',
  ONLY_ADMINS: 'Only admins can perform this operation!',
  USER_NOT_FOUND: 'No user found against the given id!',
};

const errorsInDe = {
  NOT_AUTHORIZED: 'Sie sind nicht autorisiert!',
  PARKING_NOT_FOUND: 'Der angegebene Parkplatz existiert nicht!',
  DISABLED_PARKING_SPOT: 'Der Parkplatz ist entweder inaktiv oder deaktiviert!',
  PERMANENT_RESERVATION: 'Der Parkplatz ist dauerhaft für jemand anderen reserviert!',
  TIME_OVERLAPPING: 'Die Zeit überschneidet sich mit anderen Reservierungen!',
  SOMETHING_WENT_WRONG: 'Hoppla! Etwas ist schief gelaufen!',
  RESERVATION_NOT_FOUND: 'Reservierungsplatz nicht gefunden!',
  ALREADY_CANCELED: 'Diese Reservierung wurde bereits storniert!',
  RESERVATION_CANCEL_NOT_ALLOWED: 'Sie dürfen diese Reservierung nicht stornieren!',
  EMAIL_ALREADY_EXIST_IN_USERS: 'Die angegebene E-Mail existiert bereits im Benutzerdokument!',
  INVITATION_ALREADY_SENT: 'Die Einladung wurde bereits an diese E-Mail gesendet!',
  ONLY_ADMINS_CAN_INVITE: 'Nur Administratoren können andere Benutzer einladen!',
  LOCATION_NOT_FOUND: 'Die angegebene Standort-ID existiert nicht!',
  INVITATION_NOT_FOUND: 'An diesen Benutzer wurde keine Einladung gesendet!',
  INVITATION_KEYS_MISMATCH: 'Einladungsschlüssel stimmt nicht mit dem gespeicherten Schlüssel überein!',
  RESERVATION_EXIST_ON_BLOCKED_DAYS: 'Es gibt Reservierungen an einem oder mehreren gesperrten Tagen!',
  BLOCKED_SPOT: 'Der Parkplatz ist an diesem Tag gesperrt!',
  ONLY_ADMINS: 'Nur Administratoren können diesen Vorgang ausführen!',
  USER_NOT_FOUND: 'Kein Benutzer mit der angegebenen ID gefunden!',
};

const errors = LOCALE === 'de' ? errorsInDe : errorsInEn;

module.exports = errors;
