const User = require('../models/User');

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isKycVerified: user.isKycVerified,
          age: user.age,
          address: user.address,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getUserChits = async (req, res) => {
  try {
    const transactions = await require('../config/db').prisma.escrowTransaction.findMany({
      where: {
        user_id: req.user.id,
        type: 'CONTRIBUTION',
        status: 'CONFIRMED'
      },
      include: {
        escrow_account: {
          include: {
            chit_group: {
              include: {
                organization: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user chits',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { getMe, getUserChits };
