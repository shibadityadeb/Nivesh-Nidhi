const User = require('../models/User');
const { prisma } = require('../config/db');

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
    const transactions = await prisma.escrowTransaction.findMany({
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

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadOnly = String(req.query.unreadOnly || '').toLowerCase() === 'true';

    const where = {
      OR: [
        { user_id: userId },
        {
          user_id: null,
          chit_group: {
            members: {
              some: {
                user_id: userId,
                status: 'ACTIVE',
              },
            },
          },
        },
      ],
    };

    if (unreadOnly) {
      where.is_read = false;
    }

    const notifications = await prisma.memberNotification.findMany({
      where,
      include: {
        chit_group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.memberNotification.count({
      where: {
        ...where,
        is_read: false,
      },
    });

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notification = await prisma.memberNotification.findFirst({
      where: {
        id,
        OR: [
          { user_id: userId },
          {
            user_id: null,
            chit_group: {
              members: {
                some: {
                  user_id: userId,
                  status: 'ACTIVE',
                },
              },
            },
          },
        ],
      },
      select: { id: true },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    await prisma.memberNotification.update({
      where: { id },
      data: { is_read: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.memberNotification.updateMany({
      where: {
        is_read: false,
        OR: [
          { user_id: userId },
          {
            user_id: null,
            chit_group: {
              members: {
                some: {
                  user_id: userId,
                  status: 'ACTIVE',
                },
              },
            },
          },
        ],
      },
      data: { is_read: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Notifications marked as read',
      updatedCount: result.count,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getMe,
  getUserChits,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};
