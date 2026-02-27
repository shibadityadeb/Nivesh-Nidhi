/**
 * Risk Scoring Engine for Organizers
 * Calculates a risk score from 0 to 100 based on application data.
 * Lower score = Lower risk.
 */

const getGeoRiskWeight = (city, state) => {
    // Dummy implementation for Geo Risk Index
    const highRiskStates = ['DEFAULT_HIGH_RISK_STATE'];
    const highRiskCities = ['DEFAULT_HIGH_RISK_CITY'];

    if (highRiskStates.includes(state)) return 20;
    if (highRiskCities.includes(city)) return 15;
    return 5;
};

const calculateOrganizerRiskScore = (application) => {
    let riskScore = 0;

    // 1. License Validity Weight (0-20)
    if (!application.chit_license_number) {
        riskScore += 20; // No license = high risk (New Organizers need strict review)
    } else if (application.license_valid_till) {
        const daysUntilExpiry = (new Date(application.license_valid_till) - new Date()) / (1000 * 60 * 60 * 24);
        if (daysUntilExpiry < 30) riskScore += 15;
        else if (daysUntilExpiry < 180) riskScore += 10;
        else riskScore += 0;
    }

    // 2. Years of Experience Weight (0-20)
    const exp = application.years_of_operation || 0;
    if (exp === 0) riskScore += 20;
    else if (exp < 3) riskScore += 15;
    else if (exp < 5) riskScore += 10;
    else if (exp < 10) riskScore += 5;
    else riskScore += 0;

    // 3. Capital Weight (0-20)
    // E.g., if proposed chit size is very large but it's a new or unproven org
    if (application.proposed_chit_size) {
        const size = parseFloat(application.proposed_chit_size.toString());
        if (size > 5000000 && exp < 3) riskScore += 20; // High risk: big size, low exp
        else if (size > 1000000 && exp < 1) riskScore += 15;
        else riskScore += 5;
    } else {
        riskScore += 10;
    }

    // 4. Past Default Weight / Migrating Specific (0-20)
    if (application.type === 'MIGRATING') {
        // If migrating but low turnover or members, slight risk
        const turnover = parseFloat((application.past_3_yr_turnover || 0).toString());
        if (turnover < 1000000) riskScore += 10;
    }

    // 5. Geo Risk Weight (0-20)
    riskScore += getGeoRiskWeight(application.city, application.state);

    return Math.min(Math.max(riskScore, 0), 100); // Clamp between 0-100
};

module.exports = {
    calculateOrganizerRiskScore
};
