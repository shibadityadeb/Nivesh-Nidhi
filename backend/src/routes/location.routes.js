const express = require('express');
const { listCities } = require('../controllers/location.controller');

const router = express.Router();

// Public route to list cities for a given state
router.get('/cities', listCities);

module.exports = router;

