const express = require('express');
const { body } = require('express-validator');
const { signup, login, getProfile } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number')
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['USER', 'ORGANIZER', 'ADMIN']).withMessage('Invalid role'),
  body('location')
    .exists().withMessage('Location is mandatory for login')
    .isObject().withMessage('Location must be an object'),
  body('location.latitude')
    .exists().withMessage('Location latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.longitude')
    .exists().withMessage('Location longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('location.accuracy')
    .exists().withMessage('Location accuracy is required')
    .isFloat({ min: 0 }).withMessage('Invalid location accuracy'),
  body('location.timestamp')
    .exists().withMessage('Location timestamp is required')
    .isInt({ min: 1 }).withMessage('Invalid location timestamp')
];

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);

module.exports = router;
