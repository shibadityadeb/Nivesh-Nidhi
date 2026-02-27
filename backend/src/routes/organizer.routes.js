const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middlewares/auth.middleware');
const { applyForOrganizer } = require('../controllers/organizer.controller');

const router = express.Router();

const applyValidation = [
    body('type')
        .isIn(['NEW', 'EXISTING', 'MIGRATING'])
        .withMessage('Invalid organizer type'),
    body('company_name').notEmpty().withMessage('Company Name is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('personalInfo.dateOfBirth')
        .notEmpty().withMessage('Date of Birth is required')
        .isISO8601().withMessage('Date of Birth must be a valid date'),
    body('personalInfo.age')
        .notEmpty().withMessage('Age is required')
        .isInt({ min: 21 }).withMessage('Age must be at least 21'),
    body('professionalInfo.occupation')
        .isIn(['Business Owner', 'Salaried', 'Self-Employed', 'Freelancer', 'Student', 'Other'])
        .withMessage('Occupation is required'),
    body('professionalInfo.companyOrBusinessName')
        .custom((value, { req }) => {
            const occupation = req.body?.professionalInfo?.occupation;
            if (occupation === 'Business Owner' || occupation === 'Self-Employed') {
                return typeof value === 'string' && value.trim().length > 0;
            }
            return true;
        })
        .withMessage('Company/Business Name is required for selected occupation'),
    body('professionalInfo.yearsOfExperience')
        .custom((value, { req }) => {
            const occupation = req.body?.professionalInfo?.occupation;
            const experience = Number(value);
            if (occupation === 'Student') return true;
            return Number.isFinite(experience) && experience >= 1;
        })
        .withMessage('Years of Experience must be at least 1 for non-students'),
    body('incomeInfo.monthlyIncomeRange')
        .isIn(['< ₹25k', '₹25k – ₹50k', '₹50k – ₹1L', '> ₹1L'])
        .withMessage('Monthly income range is required'),
    body('incomeInfo.primaryIncomeSource')
        .trim()
        .notEmpty().withMessage('Primary income source is required'),
    body('purposeInfo.reasonForOpeningFund')
        .trim()
        .isLength({ min: 50 }).withMessage('Reason must be at least 50 characters'),
    body('purposeInfo.expectedMembersCount')
        .isInt({ min: 1 }).withMessage('Expected members count must be at least 1'),
    body('purposeInfo.targetMonthlyContribution')
        .isFloat({ min: 1 }).withMessage('Target monthly contribution must be greater than 0'),
];

const validateApplyRequest = (req, res, next) => {
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

router.use(protect);

router.post('/apply', applyValidation, validateApplyRequest, applyForOrganizer);

module.exports = router;
