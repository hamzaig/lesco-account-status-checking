const consumerNumberFinder = (str) => {
  const regex = /(04)([0-9]{12})/g;
  const found = str.match(regex);
  return found;
}

module.exports = consumerNumberFinder;
