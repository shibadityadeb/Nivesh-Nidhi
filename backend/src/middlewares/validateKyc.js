const { body, validationResult } = require('express-validator');
const { validateAadhaar, sanitizeAadhaar } = require('../utils/validateAadhaar');

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
  body('address')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Address must be at least 10 characters')
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
