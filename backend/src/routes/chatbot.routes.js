const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const { optionalProtect } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/chatbot/chat
 * @desc    Send a message to the chatbot
 * @access  Public (Optional auth for better context)
 */
router.post('/chat', optionalProtect, chatbotController.chat);

/**
 * @route   GET /api/chatbot/context
 * @desc    Get user context for chatbot initialization
 * @access  Public (Optional auth for user-specific context)
 */
router.get('/context', optionalProtect, chatbotController.getContext);

module.exports = router;
