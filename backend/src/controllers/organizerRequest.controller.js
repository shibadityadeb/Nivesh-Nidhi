const { prisma } = require('../config/db');

const isMissingTableError = (error, tableName) => {
  if (!error || error.code !== 'P2021') return false;
  const metaTable = String(error.meta?.table || '').toLowerCase();
  return metaTable.includes(tableName.toLowerCase());
};

const getOrganizerRequests = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const { groupId } = req.query;
    let formatted = [];

    try {
      const requests = await prisma.joinRequest.findMany({
        where: {
          status: 'pending',
          ...(groupId ? { group_id: groupId } : {}),
          group: {
            organization: {
              organizer_profile: {
                user_id: organizerId
              }
            }
          }
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, isKycVerified: true }
          },
          group: {
            select: {
              id: true,
              name: true,
              chit_value: true,
              duration_months: true,
              rules: {
                select: { monthly_amount: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      formatted = requests.map((request) => ({
        id: request.id,
        status: request.status,
        appliedAt: request.created_at,
        contributionAmount:
          Number(request.group?.rules?.monthly_amount || 0) > 0
            ? Number(request.group.rules.monthly_amount)
            : Number(request.group?.chit_value || 0) / Math.max(Number(request.group?.duration_months || 1), 1),
        user: request.user || null,
        group: request.group || null
      }));
    } catch (error) {
      if (!isMissingTableError(error, 'join_requests')) throw error;

      const requests = await prisma.chitGroupApplication.findMany({
        where: {
          status: 'PENDING',
          ...(groupId ? { chit_group_id: groupId } : {}),
          chit_group: {
            organization: {
              organizer_profile: {
                user_id: organizerId
              }
            }
          }
        },
        include: {
          chit_group: {
            select: {
              id: true,
              name: true,
              chit_value: true,
              duration_months: true,
              rules: { select: { monthly_amount: true } }
            }
          }
        },
        orderBy: { applied_at: 'desc' }
      });

      const userIds = [...new Set(requests.map((request) => request.user_id))];
      const users = userIds.length
        ? await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, phone: true, isKycVerified: true }
          })
        : [];
      const usersById = new Map(users.map((user) => [user.id, user]));

      formatted = requests.map((request) => ({
        id: request.id,
        status: 'pending',
        appliedAt: request.applied_at,
        contributionAmount:
          Number(request.chit_group?.rules?.monthly_amount || 0) > 0
            ? Number(request.chit_group.rules.monthly_amount)
            : Number(request.chit_group?.chit_value || 0) / Math.max(Number(request.chit_group?.duration_months || 1), 1),
        user: usersById.get(request.user_id) || null,
        group: request.chit_group || null
      }));
    }

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    return next(error);
  }
};

const updateOrganizerRequest = async (req, res, next) => {
  try {
    const organizerId = req.user.id;
    const { requestId } = req.params;
    const { status } = req.body;
    const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';

    if (!['approved', 'rejected'].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be approved or rejected'
      });
    }

    let request = null;
    let useLegacyApplicationTable = false;

    try {
      request = await prisma.joinRequest.findUnique({
        where: { id: requestId },
        include: {
          group: {
            include: {
              organization: {
                include: {
                  organizer_profile: true
                }
              }
            }
          }
        }
      });
    } catch (error) {
      if (!isMissingTableError(error, 'join_requests')) throw error;
      useLegacyApplicationTable = true;
      request = await prisma.chitGroupApplication.findUnique({
        where: { id: requestId },
        include: {
          chit_group: {
            include: {
              organization: {
                include: {
                  organizer_profile: true
                }
              }
            }
          }
        }
      });
    }

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const requestOrganizerId = useLegacyApplicationTable
      ? request.chit_group?.organization?.organizer_profile?.user_id
      : request.group?.organization?.organizer_profile?.user_id;

    if (requestOrganizerId !== organizerId) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to update this request'
      });
    }

    const requestStatus = String(request.status || '').toLowerCase();
    if (requestStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request already processed'
      });
    }

    if (normalizedStatus === 'rejected') {
      if (useLegacyApplicationTable) {
        await prisma.chitGroupApplication.update({
          where: { id: requestId },
          data: { status: 'REJECTED', reviewed_at: new Date() }
        });
      } else {
        await prisma.joinRequest.update({
          where: { id: requestId },
          data: { status: 'rejected' }
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Request rejected successfully'
      });
    }

    const [group, user] = await Promise.all([
      prisma.chitGroup.findUnique({ where: { id: useLegacyApplicationTable ? request.chit_group_id : request.group_id } }),
      prisma.user.findUnique({ where: { id: request.user_id } })
    ]);

    if (!group || !user) {
      return res.status(404).json({
        success: false,
        message: 'Group or user not found'
      });
    }

    if (group.current_members >= group.member_capacity) {
      return res.status(400).json({
        success: false,
        message: 'Group is full'
      });
    }

    await prisma.$transaction(async (tx) => {
      const existingMember = await tx.chitGroupMember.findFirst({
        where: { chit_group_id: useLegacyApplicationTable ? request.chit_group_id : request.group_id, user_id: request.user_id, status: 'ACTIVE' }
      });
      if (!existingMember) {
        await tx.chitGroupMember.create({
          data: {
            chit_group_id: useLegacyApplicationTable ? request.chit_group_id : request.group_id,
            user_id: request.user_id,
            name: user.name,
            email: user.email,
            phone: user.phone || null,
            status: 'ACTIVE'
          }
        });

        await tx.chitGroup.update({
          where: { id: useLegacyApplicationTable ? request.chit_group_id : request.group_id },
          data: { current_members: { increment: 1 } }
        });
      }

      if (useLegacyApplicationTable) {
        await tx.chitGroupApplication.update({
          where: { id: requestId },
          data: { status: 'APPROVED', reviewed_at: new Date() }
        });
      } else {
        await tx.joinRequest.update({
          where: { id: requestId },
          data: { status: 'approved' }
        });
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Request approved successfully'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getOrganizerRequests,
  updateOrganizerRequest
};
