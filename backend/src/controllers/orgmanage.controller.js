const { prisma } = require('../config/db');

/**
 * Get organizer's organizations with status
 */
const getMyOrganizations = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Get the organizer profile
        const profile = await prisma.organizerProfile.findUnique({
            where: { user_id: userId },
            include: {
                organizations: {
                    include: {
                        chit_groups: {
                            include: {
                                rules: true,
                                members: { where: { status: 'ACTIVE' } }
                            }
                        }
                    }
                }
            }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'No organizer profile found. Please apply first.'
            });
        }

        // Also get applications for status display
        const applications = await prisma.organizerApplication.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: {
                profile,
                organizations: profile.organizations,
                applications
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get members of a chit group
 */
const getGroupMembers = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        const members = await prisma.chitGroupMember.findMany({
            where: { chit_group_id: groupId },
            orderBy: { joined_at: 'desc' }
        });

        res.status(200).json({ success: true, data: members });
    } catch (error) {
        next(error);
    }
};

/**
 * Add a member to a chit group
 */
const addMember = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const { name, email, phone, member_user_id } = req.body;

        // Verify ownership
        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        if (group.current_members >= group.member_capacity) {
            return res.status(400).json({ success: false, message: 'Group is already at full capacity' });
        }

        // Check if member already exists
        const existingMember = await prisma.chitGroupMember.findFirst({
            where: {
                chit_group_id: groupId,
                email: email,
                status: 'ACTIVE'
            }
        });

        if (existingMember) {
            return res.status(400).json({ success: false, message: 'Member with this email already exists in the group' });
        }

        const member = await prisma.$transaction(async (tx) => {
            const newMember = await tx.chitGroupMember.create({
                data: {
                    chit_group_id: groupId,
                    user_id: member_user_id || userId,
                    name,
                    email,
                    phone: phone || null,
                    status: 'ACTIVE'
                }
            });

            await tx.chitGroup.update({
                where: { id: groupId },
                data: { current_members: { increment: 1 } }
            });

            return newMember;
        });

        res.status(201).json({ success: true, message: 'Member added successfully', data: member });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove a member from a chit group
 */
const removeMember = async (req, res, next) => {
    try {
        const { groupId, memberId } = req.params;
        const userId = req.user.id;

        // Verify ownership
        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        await prisma.$transaction(async (tx) => {
            await tx.chitGroupMember.update({
                where: { id: memberId },
                data: { status: 'REMOVED' }
            });

            await tx.chitGroup.update({
                where: { id: groupId },
                data: { current_members: { decrement: 1 } }
            });
        });

        res.status(200).json({ success: true, message: 'Member removed successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Get or update chit group rules
 */
const getGroupRules = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            },
            include: { chitGroupRule: true }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        res.status(200).json({ success: true, data: group.chitGroupRule });
    } catch (error) {
        next(error);
    }
};

const saveGroupRules = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const {
            monthly_amount,
            duration_months,
            late_penalty_pct,
            commission_pct,
            min_bid_pct,
            max_bid_pct,
            bidding_day,
            payment_due_day,
            grace_period_days,
            custom_rules
        } = req.body;

        // Verify ownership
        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            },
            include: { chitGroupRule: true }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        const ruleData = {
            monthly_amount: monthly_amount ? parseFloat(monthly_amount) : null,
            duration_months: duration_months ? parseInt(duration_months) : null,
            late_penalty_pct: late_penalty_pct ? parseFloat(late_penalty_pct) : 2.0,
            commission_pct: commission_pct ? parseFloat(commission_pct) : 5.0,
            min_bid_pct: min_bid_pct ? parseFloat(min_bid_pct) : 5.0,
            max_bid_pct: max_bid_pct ? parseFloat(max_bid_pct) : 40.0,
            bidding_day: bidding_day ? parseInt(bidding_day) : 1,
            payment_due_day: payment_due_day ? parseInt(payment_due_day) : 5,
            grace_period_days: grace_period_days ? parseInt(grace_period_days) : 5,
            custom_rules: custom_rules || null
        };

        let rules;
        if (group.chitGroupRule) {
            rules = await prisma.chitGroupRule.update({
                where: { id: group.chitGroupRule.id },
                data: ruleData
            });
        } else {
            rules = await prisma.chitGroupRule.create({
                data: {
                    chit_group_id: groupId,
                    ...ruleData
                }
            });
        }

        res.status(200).json({ success: true, message: 'Rules saved successfully', data: rules });
    } catch (error) {
        next(error);
    }
};

/**
 * Create an announcement
 */
const createAnnouncement = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const { title, message, type } = req.body;

        // Verify ownership
        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        const announcement = await prisma.announcement.create({
            data: {
                chit_group_id: groupId,
                title,
                message,
                type: type || 'GENERAL'
            }
        });

        res.status(201).json({ success: true, message: 'Announcement created', data: announcement });
    } catch (error) {
        next(error);
    }
};

/**
 * Get announcements for a chit group
 */
const getAnnouncements = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        const announcements = await prisma.announcement.findMany({
            where: { chit_group_id: groupId },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({ success: true, data: announcements });
    } catch (error) {
        next(error);
    }
};

/**
 * Send notification to members (due reminders, bidding alerts, etc.)
 */
const sendNotification = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        const { title, message, type, target_user_id } = req.body;

        // Verify ownership
        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            },
            include: {
                members: { where: { status: 'ACTIVE' } }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        let notifications;

        if (target_user_id) {
            // Send to specific member
            notifications = await prisma.memberNotification.create({
                data: {
                    chit_group_id: groupId,
                    user_id: target_user_id,
                    title,
                    message,
                    type: type || 'CUSTOM'
                }
            });
        } else {
            // Broadcast to all active members
            const notifData = group.members.map((member) => ({
                chit_group_id: groupId,
                user_id: member.user_id,
                title,
                message,
                type: type || 'DUE_REMINDER'
            }));

            if (notifData.length === 0) {
                // Still create a broadcast notification
                notifications = await prisma.memberNotification.create({
                    data: {
                        chit_group_id: groupId,
                        user_id: null,
                        title,
                        message,
                        type: type || 'DUE_REMINDER'
                    }
                });
            } else {
                notifications = await prisma.memberNotification.createMany({
                    data: notifData
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Notification(s) sent successfully',
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get notifications sent for a group
 */
const getNotifications = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;

        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        const notifications = await prisma.memberNotification.findMany({
            where: { chit_group_id: groupId },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete an announcement
 */
const deleteAnnouncement = async (req, res, next) => {
    try {
        const { groupId, announcementId } = req.params;
        const userId = req.user.id;

        const group = await prisma.chitGroup.findFirst({
            where: {
                id: groupId,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        await prisma.announcement.delete({
            where: { id: announcementId }
        });

        res.status(200).json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMyOrganizations,
    getGroupMembers,
    addMember,
    removeMember,
    getGroupRules,
    saveGroupRules,
    createAnnouncement,
    getAnnouncements,
    deleteAnnouncement,
    sendNotification,
    getNotifications
};
