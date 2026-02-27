const chatbotService = require('../services/chatbot.service');

/**
 * Handle chat message
 */
const chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user?.id;
    const role = req.user?.role || 'GUEST';

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    console.log('Chat request received:', {
      userId,
      role,
      messageLength: message.length,
      historyLength: conversationHistory?.length || 0,
    });

    // Process the message
    const result = await chatbotService.processMessage(
      userId,
      role,
      message,
      conversationHistory || []
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Chat error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Failed to process chat message',
      error: error.message,
    });
  }
};

/**
 * Get user context for initialization
 */
const getContext = async (req, res) => {
  try {
    // If user is not authenticated, return guest context
    if (!req.user) {
      return res.status(200).json({
        success: true,
        data: {
          role: 'GUEST',
          userName: 'Guest',
          kycStatus: 'Not Verified',
          hasChits: false,
          isAuthenticated: false,
        },
      });
    }

    const userId = req.user.id;
    const role = req.user.role;

    const context = await chatbotService.getUserContext(userId, role);

    return res.status(200).json({
      success: true,
      data: {
        role,
        userName: context.user.name,
        kycStatus: context.user.isKycVerified ? 'Verified' : 'Not Verified',
        hasChits: (role === 'USER' || role === 'MEMBER') ? context.chitMemberships?.length > 0 : context.organizations?.length > 0,
        isAuthenticated: true,
      },
    });
  } catch (error) {
    console.error('Get context error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get context',
      error: error.message,
    });
  }
};

module.exports = {
  chat,
  getContext,
};
