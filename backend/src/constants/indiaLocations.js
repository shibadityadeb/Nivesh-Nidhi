const { State, City } = require('country-state-city');

// Get all states for India (IN)
const allIndianStates = State.getStatesOfCountry('IN');

// Create a map of state names to state codes
const STATE_MAP = {};
const STATES = [];

allIndianStates.forEach((state) => {
  // Store original name and map it to its state code (e.g. 'Maharashtra' -> 'MH')
  STATE_MAP[state.name] = state.isoCode;
  STATES.push(state.name);
});

// For backward compatibility and quick lookups
const normalize = (value) => String(value || '').trim().toLowerCase();

const getCanonicalState = (value) => {
  const target = normalize(value);
  return STATES.find((state) => normalize(state) === target) || null;
};

const getCitiesByState = (stateName) => {
  const canonicalState = getCanonicalState(stateName);
  if (!canonicalState) return [];

  const stateCode = STATE_MAP[canonicalState];
  if (!stateCode) return [];

  // Fetch cities for this state code using the package
  const cities = City.getCitiesOfState('IN', stateCode);
  return cities.map((city) => city.name);
};

const getCanonicalCity = (stateName, cityName) => {
  const cities = getCitiesByState(stateName);
  const target = normalize(cityName);
  return cities.find((city) => normalize(city) === target) || null;
};

module.exports = {
  STATES,
  getCanonicalState,
  getCitiesByState,
  getCanonicalCity,
};
