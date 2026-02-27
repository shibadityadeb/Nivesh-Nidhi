const { body, validationResult } = require('express-validator');
const { validateAadhaar, sanitizeAadhaar } = require('../utils/validateAadhaar');
const { getCanonicalState, getCanonicalCity } = require('../constants/indiaLocations');

const kycValidationRules = [
  body('aadhaarNumber')
    .customSanitizer((value) => sanitizeAadhaar(value))
    .custom((value) => validateAadhaar(value) === 'verified')
    .withMessage('Aadhaar number is not valid'),
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters'),
  body('age')
    .isInt({ min: 18 })
    .withMessage('Age must be 18 or above'),
  body('state')
    .trim()
    .notEmpty().withMessage('State is required')
    .custom((value) => Boolean(getCanonicalState(value)))
    .withMessage('Invalid state'),
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .custom((value, { req }) => {
      const canonicalState = getCanonicalState(req.body.state);
      if (!canonicalState) return false;
      return Boolean(getCanonicalCity(canonicalState, value));
    })
    .withMessage('Invalid city for selected state')
];

const validateKyc = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  return next();
};

module.exports = { kycValidationRules, validateKyc };
