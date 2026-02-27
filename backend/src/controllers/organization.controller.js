const { prisma } = require('../config/db');

/**
 * Discover Organizations
 * Intelligent Sorting Logic based on City / State matches
 */
const discoverOrganizations = async (req, res, next) => {
    try {
        const { city, state } = req.query;

        if (!city || !state) {
            return res.status(400).json({
                success: false,
                message: 'City and State are required for intelligent discovery'
            });
        }

        // Common sorting fields:
        // 1. migration_priority_flag DESC (true first)
        // 2. trust_tier ASC (TIER_1, TIER_2, RESTRICTED based on enum definition order)
        // 3. reputation_score DESC (higher is better)
        // 4. default_rate ASC (lower is better)
        const orderBy = [
            { migration_priority_flag: 'desc' },
            { trust_tier: 'asc' },
            { reputation_score: 'desc' },
            { default_rate: 'asc' }
        ];

        // Priority 1: Same City
        const cityMatches = await prisma.organization.findMany({
            where: {
                is_verified: true,
                city: { equals: city, mode: 'insensitive' }
            },
            orderBy
        });

        const cityIds = cityMatches.map(org => org.id);

        // Priority 2: Same State (but not same city)
        const stateMatches = await prisma.organization.findMany({
            where: {
                is_verified: true,
                state: { equals: state, mode: 'insensitive' },
                id: { notIn: cityIds }
            },
            orderBy
        });

        const stateIds = [...cityIds, ...stateMatches.map(org => org.id)];

        // Priority 3: Rest of India (not same city, not same state)
        const nationalMatches = await prisma.organization.findMany({
            where: {
                is_verified: true,
                id: { notIn: stateIds }
            },
            orderBy
        });

        // Combine results
        const combinedResults = [...cityMatches, ...stateMatches, ...nationalMatches];

        res.status(200).json({
            success: true,
            message: 'Organizations discovered successfully',
            data: combinedResults
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    discoverOrganizations
};
