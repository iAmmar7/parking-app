const isValid = require('date-fns/isValid');

const isValidDate = (date) => {
  return isValid(new Date(date));
};

module.exports = { isValidDate };
