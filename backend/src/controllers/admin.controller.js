const { prisma } = require('../config/db');

/**
 * Fetch pending applications queue
 */
const getPendingApplications = async (req, res, next) => {
    try {
        const applications = await prisma.organizerApplication.findMany({
            where: {
                status: { in: ['PENDING', 'UNDER_RISK_ASSESSMENT'] }
            },
            orderBy: {
                application_risk_score: 'desc'
            },
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Fetch migrating applications queue
 */
const getMigratingApplications = async (req, res, next) => {
    try {
        const applications = await prisma.organizerApplication.findMany({
            where: {
                type: 'MIGRATING',
                status: { in: ['PENDING', 'UNDER_RISK_ASSESSMENT'] }
            },
            orderBy: [
                { years_of_operation: 'desc' },
                { total_active_members: 'desc' }
            ],
            include: {
                user: {
                    select: { name: true, email: true, phone: true }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: applications
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Approve Application
 */
const approveApplication = async (req, res, next) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const { isLimited } = req.body; // true if 'Approve Limited'

    try {
        const application = await prisma.organizerApplication.findUnique({
            where: { id }
        });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.status === 'APPROVED' || application.status === 'APPROVED_LIMITED') {
            return res.status(400).json({ success: false, message: 'Application already approved' });
        }

        // Determine trust tier
        let trustTier = 'RESTRICTED';
        if (!isLimited) {
            if (application.type === 'MIGRATING' && application.application_risk_score < 40) {
                trustTier = 'TIER_1';
            } else {
                trustTier = 'TIER_2';
            }
        }

        // DB Transaction to safely create profile and org
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update application status
            const updatedApp = await tx.organizerApplication.update({
                where: { id },
                data: {
                    status: isLimited ? 'APPROVED_LIMITED' : 'APPROVED'
                }
            });

            // 2. Update user role
            await tx.user.update({
                where: { id: application.user_id },
                data: { role: 'ORGANIZER' }
            });

            // 3. Create Organizer Profile
            const profile = await tx.organizerProfile.create({
                data: {
                    user_id: application.user_id,
                    license_info: {
                        license_number: application.chit_license_number,
                        valid_till: application.license_valid_till,
                        issuing_auth: application.license_issuing_auth
                    },
                    gst_info: {
                        number: application.gst_number
                    },
                    experience_years: application.years_of_operation,
                    approval_status: updatedApp.status,
                    security_deposit_status: application.security_deposit_paid ? 'PAID' : 'PENDING'
                }
            });

            // 4. Create Organization
            const org = await tx.organization.create({
                data: {
                    organizer_profile: {
                        connect: { id: profile.id }
                    },
                    name: application.company_name || 'Unnamed Org',
                    license_number: application.chit_license_number,
                    gst_number: application.gst_number,
                    city: application.city || 'Unknown',
                    state: application.state || 'Unknown',
                    pincode: application.pincode || '000000',
                    is_verified: true,
                    risk_rating: application.application_risk_score,
                    trust_tier: trustTier,
                    reputation_score: typeof application.application_risk_score === 'number'
                        ? (100 - application.application_risk_score)
                        : 50,
                    migration_priority_flag: application.type === 'MIGRATING'
                }
            });

            // 5. Create Chit Group from application data
            const purposeInfo = application.purpose_info || {};
            const chitGroup = await tx.chitGroup.create({
                data: {
                    organization_id: org.id,
                    name: `${application.company_name || 'Unnamed'} Chit Fund`,
                    state: application.state || 'Unknown',
                    city: application.city || 'Unknown',
                    chit_value: application.proposed_chit_size || 0,
                    duration_months: application.proposed_duration_months || Number(purposeInfo.expectedMembersCount) || 12,
                    member_capacity: Number(purposeInfo.expectedMembersCount) || 10,
                    current_members: 0,
                    status: 'OPEN'
                }
            });

            // 6. Log Admin Action
            await tx.adminActionLog.create({
                data: {
                    admin_id: adminId,
                    action_type: isLimited ? 'APPROVE_LIMITED' : 'APPROVE',
                    organization_id: org.id,
                    details: `Approved application ${id} with trust tier ${trustTier}`
                }
            });

            return { profile, org, chitGroup };
        });

        res.status(200).json({
            success: true,
            message: `Organizer application approved${isLimited ? ' (Limited)' : ''} successfully`,
            data: result
        });

    } catch (error) {
        next(error);
    }
};

/**
 * Reject Application
 */
const rejectApplication = async (req, res, next) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const { reason } = req.body;

    try {
        const updatedApp = await prisma.organizerApplication.update({
            where: { id },
            data: { status: 'REJECTED' }
        });

        await prisma.adminActionLog.create({
            data: {
                admin_id: adminId,
                action_type: 'REJECT',
                details: `Rejected application ${id}. Reason: ${reason || 'None provided'}`
            }
        });

        res.status(200).json({
            success: true,
            message: 'Application rejected',
            data: updatedApp
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Suspend Organization
 */
const suspendOrganization = async (req, res, next) => {
    const { id } = req.params; // Organization ID
    const adminId = req.user.id;
    const { reason } = req.body;

    try {
        const org = await prisma.organization.update({
            where: { id },
            data: { is_verified: false, trust_tier: 'RESTRICTED' },
            include: { organizer_profile: true }
        });

        await prisma.organizerProfile.update({
            where: { id: org.organizer_profile_id },
            data: { approval_status: 'SUSPENDED' }
        });

        // Revoke user role if it's the only org? Skipping for now.

        await prisma.adminActionLog.create({
            data: {
                admin_id: adminId,
                action_type: 'SUSPEND',
                organization_id: id,
                details: `Suspended organization ${id}. Reason: ${reason || 'License expired or policy violation'}`
            }
        });

        res.status(200).json({
            success: true,
            message: 'Organization suspended successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPendingApplications,
    getMigratingApplications,
    approveApplication,
    rejectApplication,
    suspendOrganization
};
