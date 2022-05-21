const isValidDate = (date) => {
  const parsedDate = Date.parse(date);
  return (isNaN(date) && !isNaN(parsedDate));
};

module.exports = { isValidDate };
