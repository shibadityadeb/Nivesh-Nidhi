const STATE_CITY_MAP = {
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati', 'Kurnool'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Purnia'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Goa': ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi', 'Belagavi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kannur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Prayagraj', 'Varanasi', 'Agra'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
};

const STATES = Object.keys(STATE_CITY_MAP);

const normalize = (value) => String(value || '').trim().toLowerCase();

const getCanonicalState = (value) => {
  const target = normalize(value);
  return STATES.find((state) => normalize(state) === target) || null;
};

const getCitiesByState = (state) => {
  const canonicalState = getCanonicalState(state);
  if (!canonicalState) return [];
  return STATE_CITY_MAP[canonicalState];
};

const getCanonicalCity = (state, city) => {
  const cities = getCitiesByState(state);
  const target = normalize(city);
  return cities.find((item) => normalize(item) === target) || null;
};

module.exports = {
  STATE_CITY_MAP,
  STATES,
  getCanonicalState,
  getCitiesByState,
  getCanonicalCity,
};
