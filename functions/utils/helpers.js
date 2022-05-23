const isValid = require('date-fns/isValid');

const isNull = (arg) => {
  return arg === null;
};

const isUndefined = (arg) => {
  return arg === undefined;
};

const isArray = (arg) => {
  return Array.isArray(arg);
};

const isObject = (arg) => {
  return !isNull(arg) && !isUndefined(arg) && arg.constructor.name === 'Object';
};

const isEmpty = (arg) => {
  if (!arg || isNull(arg) || isUndefined(arg)) return true;

  if (isArray(arg) && arg.length < 1) return true;

  if (isObject(arg) && Object.keys(arg).length === 0 && Object.getPrototypeOf(arg) === Object.prototype) return true;

  return false;
};

const isValidDate = (date) => {
  return isValid(new Date(date));
};

module.exports = { isValidDate, isNull, isUndefined, isArray, isObject, isEmpty };
