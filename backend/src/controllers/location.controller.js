const { getCitiesByState, getCanonicalState } = require('../constants/indiaLocations');

const listCities = (req, res) => {
  const { state, q } = req.query;

  if (!state) {
    return res.status(400).json({
      success: false,
      message: 'State is required',
    });
  }

  const canonicalState = getCanonicalState(state);
  if (!canonicalState) {
    return res.status(400).json({
      success: false,
      message: 'Invalid state',
    });
  }

  let cities = getCitiesByState(canonicalState) || [];

  if (q) {
    const query = String(q).trim().toLowerCase();
    cities = cities.filter((city) =>
      String(city).toLowerCase().includes(query)
    );
  }

  return res.status(200).json({
    success: true,
    data: {
      state: canonicalState,
      cities,
    },
  });
};

module.exports = {
  listCities,
};

