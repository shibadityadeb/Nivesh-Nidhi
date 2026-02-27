const { prisma } = require('../config/db');
const { calculateOrganizerRiskScore } = require('../utils/riskScoring');
const { analyzeRisk } = require('../services/riskAnalyzer.service');

/**
 * Apply for Organizer Account
 * Accessible by any USER role.
 */
const applyForOrganizer = async (req, res, next) => {
    try {
        const userId = req.user.id; // From protect middleware

        // Check if user already has a pending or approved application
        const existingApp = await prisma.organizerApplication.findFirst({
            where: {
                user_id: userId,
                status: { in: ['PENDING', 'UNDER_RISK_ASSESSMENT', 'APPROVED', 'APPROVED_LIMITED'] }
            }
        });

        if (existingApp) {
            return res.status(400).json({
                success: false,
                message: 'You already have an active organizer application'
            });
        }

        const {
            type, // NEW, EXISTING, MIGRATING
            company_name,
            legal_structure,
            gst_number,
            business_reg_number,
            chit_license_number,
            license_issuing_auth,
            license_valid_till,
            years_of_operation,
            office_address,
            city,
            state,
            pincode,
            bank_account_name,
            bank_name,
            ifsc_code,
            escrow_agreed,
            security_deposit_paid,
            proposed_chit_size,
            proposed_duration_months,
            target_area,
            capital_proof_url,
            existing_group_count,
            total_active_members,
            past_3_yr_turnover,
            ledger_upload_url,
            personalInfo,
            professionalInfo,
            incomeInfo,
            purposeInfo
        } = req.body;

        // Calculate Application Risk Score
        const applicationRiskScore = calculateOrganizerRiskScore({
            ...req.body,
            years_of_operation: parseInt(years_of_operation) || 0
        });


        // Create application first, then run async risk analysis
        const application = await prisma.organizerApplication.create({
            data: {
                user_id: userId,
                type,
                status: 'UNDER_RISK_ASSESSMENT',
                company_name,
                legal_structure,
                gst_number,
                business_reg_number,
                chit_license_number,
                license_issuing_auth,
                license_valid_till: license_valid_till ? new Date(license_valid_till) : null,
                years_of_operation: parseInt(years_of_operation) || 0,
                office_address,
                city,
                state,
                pincode,
                bank_account_name,
                bank_name,
                ifsc_code,
                escrow_agreed: escrow_agreed === true,
                security_deposit_paid: security_deposit_paid === true,
                proposed_chit_size: proposed_chit_size ? parseFloat(proposed_chit_size) : null,
                proposed_duration_months: parseInt(proposed_duration_months) || null,
                target_area,
                capital_proof_url,
                existing_group_count: parseInt(existing_group_count) || null,
                total_active_members: parseInt(total_active_members) || null,
                past_3_yr_turnover: past_3_yr_turnover ? parseFloat(past_3_yr_turnover) : null,
                ledger_upload_url,
                personal_info: personalInfo || null,
                professional_info: professionalInfo || null,
                income_info: incomeInfo || null,
                purpose_info: purposeInfo || null,
                application_risk_score: applicationRiskScore,
                risk_profile: null // Will be set after analysis
            }
        });

        // Async risk analysis (Claude or fallback)
        (async () => {
            try {
                // Compose organizer data for risk analysis
                const organizerData = {
                    age: req.user.age || null,
                    occupation: professionalInfo?.occupation || null,
                    workExperience: professionalInfo?.work_experience || null,
                    incomeRange: incomeInfo?.income_range || null,
                    incomeSource: incomeInfo?.income_source || null,
                    businessName: company_name || null,
                    purposeOfFund: purposeInfo?.purpose || null,
                    expectedMembers: total_active_members || null,
                    monthlyContribution: proposed_chit_size || null,
                    pastRecords: professionalInfo?.past_records || null,
                    kycStatus: req.user.isKycVerified || false
                };
                const riskResult = await analyzeRisk(application.id, organizerData);
                await prisma.organizerApplication.update({
                    where: { id: application.id },
                    data: {
                        risk_profile: {
                            level: riskResult.level,
                            score: riskResult.score,
                            concerns: riskResult.concerns,
                            positives: riskResult.positives,
                            recommendation: riskResult.recommendation,
                            generatedAt: new Date(riskResult.generatedAt),
                            fallback: riskResult.fallback || false
                        }
                    }
                });
            } catch (err) {
                // Log but do not block
                console.error('[RiskAnalyzer] Async risk analysis failed:', err);
            }
        })();

        res.status(201).json({
            success: true,
            message: 'Organizer application submitted successfully',
            data: {
                application_id: application.id,
                application_risk_score: applicationRiskScore,
                status: application.status
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    applyForOrganizer
};
