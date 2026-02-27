const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getOrganizerRequests,
  updateOrganizerRequest
} = require('../controllers/organizerRequest.controller');

const router = express.Router();

router.use(protect);
router.use(authorize('ORGANIZER'));

router.get('/', getOrganizerRequests);
router.patch('/:requestId', updateOrganizerRequest);

module.exports = router;
