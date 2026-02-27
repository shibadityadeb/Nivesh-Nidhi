const { prisma } = require('../config/db');
const {
    getCanonicalState,
    getCanonicalCity
} = require('../constants/indiaLocations');
const {
    normalizeCalculatorConfig,
    validateCalculatePayload,
    calculateByType
} = require('../utils/groupCalculator');

const isMissingTableError = (error, tableName) => {
    if (!error || error.code !== 'P2021') return false;
    const metaTable = String(error.meta?.table || '').toLowerCase();
    return metaTable.includes(tableName.toLowerCase());
};

const normalizeLocationValue = (value) => String(value || '').trim().toLowerCase();

const resolveUserLocation = (user) => {
    const city = normalizeLocationValue(user?.city);
    const state = normalizeLocationValue(user?.state);

    if (city && state) {
        return { city, state };
    }

    // Backward compatibility for users created before separate city/state columns.
    const rawAddress = String(user?.address || '');
    const [addrCity, addrState] = rawAddress.split(',');
    const fallbackCity = normalizeLocationValue(addrCity);
    const fallbackState = normalizeLocationValue(addrState);

    return {
        city: city || fallbackCity,
        state: state || fallbackState
    };
};

/**
 * Get all open chit groups (public listing)
 */
const getAllChitGroups = async (req, res, next) => {
    try {
        let chitGroups = await prisma.chitGroup.findMany({
            where: {
                status: { in: ['OPEN', 'IN_PROGRESS'] }
            },
            include: {
                organization: {
                    select: {
                        name: true,
                        city: true,
                        state: true,
                        is_verified: true,
                        trust_tier: true,
                        reputation_score: true,
                    }
                }
            },
            orderBy: [
                { created_at: 'desc' }
            ]
        });

        const { city: userCity, state: userState } = resolveUserLocation(req.user);
        const hasUserLocation = Boolean(userCity && userState);

        if (hasUserLocation) {
            chitGroups = chitGroups.sort((a, b) => {
                const getPriority = (chit) => {
                    const chitCity = normalizeLocationValue(chit.city);
                    const chitState = normalizeLocationValue(chit.state);
                    if (chitCity === userCity) return 1;
                    if (chitState === userState) return 2;
                    return 3;
                };

                const priorityDiff = getPriority(a) - getPriority(b);
                if (priorityDiff !== 0) return priorityDiff;

                return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            });
        }

        res.status(200).json({
            success: true,
            data: chitGroups
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get chit groups owned by the current organizer
 */
const getMyChitGroups = async (req, res, next) => {
    try {
        const userId = req.user.id;

        const profile = await prisma.organizerProfile.findUnique({
            where: { user_id: userId }
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'No organizer profile found'
            });
        }

        const organizations = await prisma.organization.findMany({
            where: { organizer_profile_id: profile.id }
        });

        const orgIds = organizations.map(o => o.id);

        const chitGroups = await prisma.chitGroup.findMany({
            where: { organization_id: { in: orgIds } },
            include: {
                organization: {
                    select: {
                        name: true,
                        city: true,
                        state: true,
                        is_verified: true,
                        trust_tier: true
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        const applications = await prisma.organizerApplication.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: {
                chitGroups,
                applications,
                organizations,
                profileStatus: profile.approval_status
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new chit group
 */
const createChitGroup = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const {
            organization_id,
            name,
            state,
            city,
            chit_value,
            duration_months,
            member_capacity,
            minAmount,
            maxAmount,
            defaultRate,
            calculationType,
            allowedTimePeriod
        } = req.body;

        // Verify ownership
        const org = await prisma.organization.findFirst({
            where: {
                id: organization_id,
                organizer_profile: { user_id: userId }
            }
        });

        if (!org) {
            return res.status(403).json({ success: false, message: 'Not authorized for this organization' });
        }

        const canonicalState = getCanonicalState(state);
        if (!canonicalState) {
            return res.status(400).json({ success: false, message: 'Invalid state selection' });
        }
        const canonicalCity = getCanonicalCity(canonicalState, city);
        if (!canonicalCity) {
            return res.status(400).json({ success: false, message: 'Invalid city for selected state' });
        }

        const parsedChitValue = parseFloat(chit_value);
        const parsedDuration = parseInt(duration_months, 10);
        const parsedMemberCapacity = parseInt(member_capacity, 10);
        const normalizedCalculationType = String(calculationType || 'simple').toLowerCase();
        const parsedMinAmount = Number.isFinite(Number(minAmount)) ? parseFloat(minAmount) : parsedChitValue;
        const parsedMaxAmount = Number.isFinite(Number(maxAmount)) ? parseFloat(maxAmount) : parsedChitValue * 1000;
        const parsedDefaultRate = Number.isFinite(Number(defaultRate)) ? parseFloat(defaultRate) : 0;
        const parsedMinTime = Number.isFinite(Number(allowedTimePeriod?.min))
            ? parseInt(allowedTimePeriod.min, 10)
            : 1;
        const parsedMaxTime = Number.isFinite(Number(allowedTimePeriod?.max))
            ? parseInt(allowedTimePeriod.max, 10)
            : parsedDuration;

        if (!['simple', 'compound', 'custom'].includes(normalizedCalculationType)) {
            return res.status(400).json({ success: false, message: 'calculationType must be one of simple, compound, custom' });
        }

        if (parsedMinAmount <= 0 || parsedMaxAmount <= 0 || parsedMinAmount > parsedMaxAmount) {
            return res.status(400).json({ success: false, message: 'Invalid amount limits' });
        }

        if (parsedMinTime <= 0 || parsedMaxTime <= 0 || parsedMinTime > parsedMaxTime) {
            return res.status(400).json({ success: false, message: 'Invalid allowed time period limits' });
        }

        const chitGroup = await prisma.chitGroup.create({
            data: {
                organization_id,
                name,
                state: canonicalState,
                city: canonicalCity,
                chit_value: parsedChitValue,
                duration_months: parsedDuration,
                member_capacity: parsedMemberCapacity,
                current_members: 0,
                status: 'OPEN',
                min_amount: parsedMinAmount,
                max_amount: parsedMaxAmount,
                default_rate: parsedDefaultRate,
                calculation_type: normalizedCalculationType,
                allowed_time_period_min: parsedMinTime,
                allowed_time_period_max: parsedMaxTime,
            }
        });

        await prisma.organization.update({
            where: { id: organization_id },
            data: { total_groups_managed: { increment: 1 } }
        });

        res.status(201).json({ success: true, message: 'Chit group created', data: chitGroup });
    } catch (error) {
        next(error);
    }
};

/**
 * Update a chit group
 */
const updateChitGroup = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const {
            name,
            state,
            city,
            chit_value,
            duration_months,
            member_capacity,
            status,
            minAmount,
            maxAmount,
            defaultRate,
            calculationType,
            allowedTimePeriod,
            calculatorCustomRules
        } = req.body;

        const group = await prisma.chitGroup.findFirst({
            where: {
                id,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        let canonicalState = group.state;
        let canonicalCity = group.city;
        if (typeof state !== 'undefined' || typeof city !== 'undefined') {
            const resolvedState = typeof state !== 'undefined' ? state : group.state;
            const resolvedCity = typeof city !== 'undefined' ? city : group.city;

            canonicalState = getCanonicalState(resolvedState);
            if (!canonicalState) {
                return res.status(400).json({ success: false, message: 'Invalid state selection' });
            }
            canonicalCity = getCanonicalCity(canonicalState, resolvedCity);
            if (!canonicalCity) {
                return res.status(400).json({ success: false, message: 'Invalid city for selected state' });
            }
        }

        const nextMinAmount = typeof minAmount !== 'undefined' ? parseFloat(minAmount) : Number(group.min_amount);
        const nextMaxAmount = typeof maxAmount !== 'undefined' ? parseFloat(maxAmount) : Number(group.max_amount);
        const nextMinTime = typeof allowedTimePeriod?.min !== 'undefined'
            ? parseInt(allowedTimePeriod.min, 10)
            : group.allowed_time_period_min;
        const nextMaxTime = typeof allowedTimePeriod?.max !== 'undefined'
            ? parseInt(allowedTimePeriod.max, 10)
            : group.allowed_time_period_max;
        const nextType = typeof calculationType !== 'undefined'
            ? String(calculationType).toLowerCase()
            : String(group.calculation_type || 'simple').toLowerCase();

        if (!['simple', 'compound', 'custom'].includes(nextType)) {
            return res.status(400).json({ success: false, message: 'calculationType must be one of simple, compound, custom' });
        }

        if (!Number.isFinite(nextMinAmount) || !Number.isFinite(nextMaxAmount) || nextMinAmount <= 0 || nextMaxAmount <= 0 || nextMinAmount > nextMaxAmount) {
            return res.status(400).json({ success: false, message: 'Invalid amount limits' });
        }

        if (!Number.isFinite(nextMinTime) || !Number.isFinite(nextMaxTime) || nextMinTime <= 0 || nextMaxTime <= 0 || nextMinTime > nextMaxTime) {
            return res.status(400).json({ success: false, message: 'Invalid allowed time period limits' });
        }

        const updated = await prisma.chitGroup.update({
            where: { id },
            data: {
                name: name || group.name,
                state: canonicalState,
                city: canonicalCity,
                chit_value: chit_value ? parseFloat(chit_value) : group.chit_value,
                duration_months: duration_months ? parseInt(duration_months) : group.duration_months,
                member_capacity: member_capacity ? parseInt(member_capacity) : group.member_capacity,
                status: status || group.status,
                min_amount: nextMinAmount,
                max_amount: nextMaxAmount,
                default_rate: typeof defaultRate !== 'undefined' ? parseFloat(defaultRate) : group.default_rate,
                calculation_type: nextType,
                allowed_time_period_min: nextMinTime,
                allowed_time_period_max: nextMaxTime,
                calculator_custom_rules: typeof calculatorCustomRules !== 'undefined'
                    ? calculatorCustomRules
                    : group.calculator_custom_rules,
            }
        });

        res.status(200).json({ success: true, message: 'Chit group updated', data: updated });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a chit group
 */
const deleteChitGroup = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const group = await prisma.chitGroup.findFirst({
            where: {
                id,
                organization: {
                    organizer_profile: { user_id: userId }
                }
            }
        });

        if (!group) {
            return res.status(403).json({ success: false, message: 'Not authorized or group not found' });
        }

        if (group.status === 'IN_PROGRESS') {
            return res.status(400).json({ success: false, message: 'Cannot delete an active group' });
        }

        await prisma.$transaction(async (tx) => {
            if (tx.auctionBid?.deleteMany && tx.auctionRequest?.deleteMany) {
                try {
                    await tx.auctionBid.deleteMany({
                        where: {
                            auction: {
                                group_id: id
                            }
                        }
                    });
                    await tx.auctionRequest.deleteMany({
                        where: { group_id: id }
                    });
                } catch (error) {
                    if (!isMissingTableError(error, 'auction_requests')) {
                        throw error;
                    }
                }
            }

            await tx.chitGroup.delete({ where: { id } });
        });

        res.status(200).json({ success: true, message: 'Chit group deleted' });
    } catch (error) {
        next(error);
    }
};

// Get chit group details by ID
const getChitGroupDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const group = await prisma.chitGroup.findUnique({
            where: { id },
            include: {
                organization: {
                    include: {
                        organizer_profile: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }

        let rules = null;
        let members = [];
        let announcements = [];
        let notifications = [];

        if (prisma.chitGroupRule?.findUnique) {
            rules = await prisma.chitGroupRule.findUnique({
                where: { chit_group_id: id }
            });
        }

        if (prisma.chitGroupMember?.findMany) {
            members = await prisma.chitGroupMember.findMany({
                where: { chit_group_id: id },
                orderBy: { joined_at: 'asc' }
            });
        }

        if (prisma.announcement?.findMany) {
            announcements = await prisma.announcement.findMany({
                where: { chit_group_id: id },
                orderBy: { created_at: 'desc' }
            });
        }

        if (prisma.memberNotification?.findMany) {
            notifications = await prisma.memberNotification.findMany({
                where: { chit_group_id: id },
                orderBy: { created_at: 'desc' }
            });
        }

        // Organizer details
        const organizerProfile = group.organization.organizer_profile;
        const organizerUser = organizerProfile?.user;
        const organizerDetails = {
            name: organizerUser?.name,
            email: organizerUser?.email,
            phone: organizerUser?.phone,
            occupation: organizerProfile?.professional_info?.occupation || null,
            experience_years: organizerProfile?.experience_years,
            approval_status: organizerProfile?.approval_status,
            is_verified: group.organization.is_verified,
            kyc_status: organizerUser?.isKycVerified,
            risk_profile: organizerProfile?.risk_profile || null,
            license_info: organizerProfile?.license_info || null,
            gst_info: organizerProfile?.gst_info || null,
            security_deposit_status: organizerProfile?.security_deposit_status,
            escrow_enabled: organizerProfile?.escrow_enabled
        };
        // Group info
        const supportsAiRiskReportColumn = Object.prototype.hasOwnProperty.call(group, 'ai_risk_report');
        let aiReport = supportsAiRiskReportColumn ? group.ai_risk_report : null;
        const isHeuristicReport = aiReport?.source === 'heuristic'
            || aiReport?.summary === 'Unable to reach AI service, using heuristic.';
        const groupInfo = {
            id: group.id,
            name: group.name,
            state: group.state,
            city: group.city,
            chit_value: group.chit_value,
            duration_months: group.duration_months,
            member_capacity: group.member_capacity,
            current_members: group.current_members,
            status: group.status,
            created_at: group.created_at,
            updated_at: group.updated_at,
            rules,
            announcements,
            notifications,
            aiRiskReport: aiReport
        };
        // if no report yet, generate now (synchronously) so the client can see it immediately
        if (!aiReport || isHeuristicReport) {
            try {
                console.log('[AI Risk] generating report for group', group.id);
                const { analyzeGroup } = require('../services/groupRiskClaude.service');
                const groupData = {
                    groupName: group.name,
                    description: group.name,
                    monthlyContribution: group.chit_value,
                    members: group.member_capacity,
                    duration: group.duration_months,
                    commission: rules?.commission_pct || 0,
                    discountRange: `${rules?.min_bid_pct || 0}-${rules?.max_bid_pct || 0}`,
                    organizerExperience: '',
                    kyc: organizerProfile?.user?.isKycVerified || false,
                    pastPerformance: ''
                };
                const report = await analyzeGroup(groupData);
                aiReport = report;
                if (report?.source === 'ai' && supportsAiRiskReportColumn) {
                    prisma.chitGroup.update({ where: { id: group.id }, data: { ai_risk_report: report } }).catch(err => {
                        console.error('[AI Risk] db save failed', err);
                    });
                }
                groupInfo.aiRiskReport = aiReport;
                console.log('[AI Risk] report generated', report.riskLevel);
            } catch (e) {
                console.error('[AI Risk] sync generation failed', e);
            }
        }
        // Organization info
        const orgInfo = {
            id: group.organization.id,
            name: group.organization.name,
            city: group.organization.city,
            state: group.organization.state,
            pincode: group.organization.pincode,
            is_verified: group.organization.is_verified,
            trust_tier: group.organization.trust_tier,
            reputation_score: group.organization.reputation_score,
            license_number: group.organization.license_number,
            gst_number: group.organization.gst_number,
            total_groups_managed: group.organization.total_groups_managed
        };
        // Member stats
        const memberStats = {
            total: group.current_members,
            capacity: group.member_capacity,
            available: group.member_capacity - group.current_members,
            members
        };
        // Calculation inputs for frontend
        const calcInputs = {
            groupName: group.name,
            ...normalizeCalculatorConfig(group, rules),
        };
        // Apply status (if user is logged in)
        let applyStatus = null;
        let joinRequestStatus = null;
        let isMember = false;
        let isOrganizer = false;
        let hasPaidCurrentMonth = false;
        if (req.user) {
            const userId = req.user.id;
            if (organizerUser?.id === userId) {
                isOrganizer = true;
            }
            const member = await prisma.chitGroupMember.findFirst({
                where: { chit_group_id: id, user_id: userId, status: 'ACTIVE' }
            });

            if (member) {
                isMember = true;
                applyStatus = 'APPROVED';
                joinRequestStatus = 'approved';

                // Evaluate if there is a CONFIRMED contribution this month
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const currentMonthPayment = await prisma.escrowTransaction.findFirst({
                    where: {
                        user_id: userId,
                        escrow_account: { chit_group_id: id },
                        type: 'CONTRIBUTION',
                        status: 'CONFIRMED',
                        created_at: { gte: startOfMonth }
                    }
                });

                if (currentMonthPayment) {
                    hasPaidCurrentMonth = true;
                }
            } else if (prisma.joinRequest?.findFirst) {
                try {
                    const latestRequest = await prisma.joinRequest.findFirst({
                        where: { group_id: id, user_id: userId },
                        orderBy: { created_at: 'desc' }
                    });
                    if (latestRequest) {
                        joinRequestStatus = latestRequest.status;
                        applyStatus = latestRequest.status?.toUpperCase();
                    }
                } catch (error) {
                    if (!isMissingTableError(error, 'join_requests')) throw error;
                    const legacyRequest = await prisma.chitGroupApplication.findFirst({
                        where: { chit_group_id: id, user_id: userId },
                        orderBy: { applied_at: 'desc' }
                    });
                    if (legacyRequest) {
                        applyStatus = legacyRequest.status;
                        joinRequestStatus = String(legacyRequest.status || '').toLowerCase();
                    }
                }
            }
        }
        res.status(200).json({
            success: true,
            data: {
                group: groupInfo,
                organization: orgInfo,
                organizerDetails,
                memberStats,
                calcInputs,
                applyStatus,
                joinRequestStatus,
                isMember,
                isOrganizer,
                hasPaidCurrentMonth
            }
        });
    } catch (error) {
        next(error);
    }
};

const getGroupCalculatorConfig = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const group = await prisma.chitGroup.findUnique({
            where: { id: groupId },
            include: {
                rules: true
            }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Invalid groupId' });
        }

        const config = normalizeCalculatorConfig(group, group.rules);
        res.status(200).json({
            success: true,
            data: config
        });
    } catch (error) {
        next(error);
    }
};

const calculateGroupReturn = async (req, res, next) => {
    try {
        const { groupId } = req.params;
        const group = await prisma.chitGroup.findUnique({
            where: { id: groupId },
            include: {
                rules: true
            }
        });

        if (!group) {
            return res.status(404).json({ success: false, message: 'Invalid groupId' });
        }

        const config = normalizeCalculatorConfig(group, group.rules);
        const validation = validateCalculatePayload(req.body, config);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors,
            });
        }

        const result = calculateByType(validation.sanitized, config);
        if (result.error) {
            return res.status(422).json({
                success: false,
                message: result.error
            });
        }

        res.status(200).json({
            success: true,
            data: {
                groupId: config.groupId,
                calculationType: config.calculationType,
                inputs: validation.sanitized,
                result
            }
        });
    } catch (error) {
        next(error);
    }
};

// Apply to join chit group
const applyToJoinChitGroup = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.body?.userId || req.user?.id;

        if (!userId) return res.status(400).json({ success: false, message: 'User ID required' });
        if (req.user.id !== userId) {
            return res.status(403).json({ success: false, message: 'You can only apply for yourself' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        if (!user.isKycVerified) return res.status(403).json({ success: false, message: 'KYC required' });
        if (user.role === 'ADMIN') return res.status(403).json({ success: false, message: 'Admins cannot join chit groups' });
        if (user.role === 'ORGANIZER') return res.status(403).json({ success: false, message: 'Organizers cannot join chit groups' });
        const group = await prisma.chitGroup.findUnique({
            where: { id },
            include: {
                organization: {
                    include: {
                        organizer_profile: true
                    }
                }
            }
        });
        if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
        const organizerId = group.organization?.organizer_profile?.user_id;
        if (!organizerId) return res.status(400).json({ success: false, message: 'Organizer not found for this group' });
        if (organizerId === userId) return res.status(400).json({ success: false, message: 'Organizer cannot join own group' });
        if (group.current_members >= group.member_capacity) return res.status(400).json({ success: false, message: 'Group full' });
        const member = await prisma.chitGroupMember.findFirst({ where: { chit_group_id: id, user_id: userId } });
        if (member) return res.status(400).json({ success: false, message: 'Already joined' });
        if (!prisma.joinRequest?.findFirst || !prisma.joinRequest?.create) {
            return res.status(500).json({
                success: false,
                message: 'Join application service is not initialized. Please restart backend.'
            });
        }

        let useLegacyApplicationTable = false;
        try {
            const pendingRequest = await prisma.joinRequest.findFirst({
                where: { group_id: id, user_id: userId, status: 'pending' }
            });

            if (pendingRequest) {
                return res.status(400).json({ success: false, message: 'Application pending' });
            }

            const latestRequest = await prisma.joinRequest.findFirst({
                where: { group_id: id, user_id: userId },
                orderBy: { created_at: 'desc' }
            });

            if (latestRequest?.status === 'approved') {
                return res.status(400).json({ success: false, message: 'Already approved' });
            }
        } catch (error) {
            if (!isMissingTableError(error, 'join_requests')) throw error;
            useLegacyApplicationTable = true;
            const existingApplication = await prisma.chitGroupApplication.findFirst({
                where: { chit_group_id: id, user_id: userId }
            });
            if (existingApplication) {
                if (existingApplication.status === 'PENDING') {
                    return res.status(400).json({ success: false, message: 'Application pending' });
                }
                if (existingApplication.status === 'APPROVED') {
                    return res.status(400).json({ success: false, message: 'Already approved' });
                }
            }
        }

        // calculate snapshot server-side for verification
        let calculationResult = null;
        const { discountPercent } = req.body;
        if (typeof discountPercent === 'number') {
            const rule = await prisma.chitGroupRule.findUnique({ where: { chit_group_id: id } });
            const totalMembers = group.member_capacity;
            const monthlyPool = totalMembers * Number(group.chit_value);
            const commission = monthlyPool * ((rule?.commission_pct || 0) / 100);
            const discountAmount = monthlyPool * (discountPercent / 100);
            const estimatedWinning = monthlyPool - commission - discountAmount;
            const totalPayable = Number(group.chit_value) * group.duration_months;
            calculationResult = {
                monthlyPool,
                commission,
                discountAmount,
                estimatedWinning,
                totalPayable,
                discountPercent
            };
        }

        if (useLegacyApplicationTable) {
            await prisma.chitGroupApplication.create({
                data: {
                    chit_group_id: id,
                    user_id: userId,
                    organizer_id: organizerId,
                    status: "PENDING"
                }
            });
        } else {
            await prisma.joinRequest.create({
                data: {
                    group_id: id,
                    user_id: userId,
                    status: "pending"
                }
            });
        }

        res.status(200).json({
            success: true,
            message: 'Request sent successfully',
            data: { status: 'pending' },
            calculationResult
        });
    } catch (error) {
        next(error);
    }
};

const getMyActiveGroups = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const memberships = await prisma.chitGroupMember.findMany({
            where: { user_id: userId, status: 'ACTIVE' },
            include: {
                chit_group: {
                    include: {
                        organization: {
                            select: {
                                name: true,
                                city: true,
                                state: true,
                                is_verified: true
                            }
                        }
                    }
                }
            },
            orderBy: { joined_at: 'desc' }
        });

        const groups = memberships.map((member) => ({
            id: member.chit_group.id,
            name: member.chit_group.name,
            state: member.chit_group.state,
            city: member.chit_group.city,
            status: member.chit_group.status,
            chit_value: member.chit_group.chit_value,
            duration_months: member.chit_group.duration_months,
            member_capacity: member.chit_group.member_capacity,
            current_members: member.chit_group.current_members,
            joined_at: member.joined_at,
            organization: member.chit_group.organization
        }));

        res.status(200).json({
            success: true,
            data: groups
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllChitGroups,
    getMyChitGroups,
    createChitGroup,
    updateChitGroup,
    deleteChitGroup,
    getChitGroupDetails,
    getGroupCalculatorConfig,
    calculateGroupReturn,
    applyToJoinChitGroup,
    getMyActiveGroups
};
