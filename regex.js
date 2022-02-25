const consumerNumberFinder = (str) => {
  const regex = /(0211132)([0-9]{7})/g;
  const found = str.match(regex);
  return found;
}

module.exports = consumerNumberFinder;
