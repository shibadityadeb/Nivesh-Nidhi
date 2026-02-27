const roundTo = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
};

const toNumber = (value) => {
  if (value === null || typeof value === 'undefined' || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeCalculationType = (value) => {
  const normalized = String(value || 'simple').toLowerCase();
  if (normalized === 'simple' || normalized === 'compound' || normalized === 'custom') {
    return normalized;
  }
  return 'simple';
};

const normalizeCalculatorConfig = (group, rules) => {
  const groupChitValue = toNumber(group?.chit_value) || 0;
  const minAmount = toNumber(group?.min_amount) ?? Math.max(1, groupChitValue);
  const maxAmount = toNumber(group?.max_amount) ?? Math.max(minAmount, groupChitValue * 1000 || minAmount);
  const defaultRate = toNumber(group?.default_rate) ?? 0;
  const defaultCommissionRate = toNumber(rules?.commission_pct) ?? 0;

  const minTime = Math.max(1, Math.floor(toNumber(group?.allowed_time_period_min) ?? 1));
  const maxTime = Math.max(minTime, Math.floor(toNumber(group?.allowed_time_period_max) ?? toNumber(group?.duration_months) ?? 12));

  return {
    groupId: group.id,
    minAmount,
    maxAmount,
    defaultRate,
    defaultCommissionRate,
    maxMembers: Math.max(1, Math.floor(toNumber(group?.member_capacity) ?? 1)),
    calculationType: normalizeCalculationType(group?.calculation_type),
    allowedTimePeriod: {
      min: minTime,
      max: maxTime,
    },
    customRules: group?.calculator_custom_rules || null,
  };
};

const validateCalculatePayload = (payload, config) => {
  const errors = {};

  const totalChitAmount = toNumber(payload?.totalChitAmount);
  const durationMonths = toNumber(payload?.durationMonths);
  const numberOfMembers = toNumber(payload?.numberOfMembers);
  const commissionRate = toNumber(payload?.commissionRate);
  const interestRate = toNumber(payload?.interestRate);

  if (totalChitAmount === null) {
    errors.totalChitAmount = 'Total chit amount is required.';
  } else if (totalChitAmount <= 0) {
    errors.totalChitAmount = 'Total chit amount must be greater than 0.';
  } else if (totalChitAmount < config.minAmount || totalChitAmount > config.maxAmount) {
    errors.totalChitAmount = `Total chit amount must be between ${config.minAmount} and ${config.maxAmount}.`;
  }

  if (durationMonths === null) {
    errors.durationMonths = 'Duration (months) is required.';
  } else if (durationMonths <= 0) {
    errors.durationMonths = 'Duration (months) must be greater than 0.';
  } else if (durationMonths < config.allowedTimePeriod.min || durationMonths > config.allowedTimePeriod.max) {
    errors.durationMonths = `Duration (months) must be between ${config.allowedTimePeriod.min} and ${config.allowedTimePeriod.max}.`;
  }

  if (numberOfMembers === null) {
    errors.numberOfMembers = 'Number of members is required.';
  } else if (numberOfMembers <= 0) {
    errors.numberOfMembers = 'Number of members must be greater than 0.';
  } else if (!Number.isInteger(numberOfMembers)) {
    errors.numberOfMembers = 'Number of members must be an integer.';
  } else if (numberOfMembers > config.maxMembers) {
    errors.numberOfMembers = `Number of members cannot exceed ${config.maxMembers}.`;
  }

  if (commissionRate === null) {
    errors.commissionRate = 'Commission rate is required.';
  } else if (commissionRate < 0) {
    errors.commissionRate = 'Commission rate cannot be negative.';
  }

  if (interestRate === null) {
    errors.interestRate = 'Interest rate is required.';
  } else if (interestRate < 0) {
    errors.interestRate = 'Interest rate cannot be negative.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  return {
    isValid: true,
    sanitized: {
      totalChitAmount,
      durationMonths,
      numberOfMembers,
      commissionRate,
      interestRate,
    },
  };
};

const calculateSimpleInterest = ({ principal, durationMonths, interestRate }) => {
  const interestEarned = (principal * interestRate * durationMonths) / 100;
  const finalAmount = principal + interestEarned;

  return {
    interestEarned: roundTo(interestEarned),
    finalAmount: roundTo(finalAmount),
  };
};

const calculateCompoundInterest = ({ principal, durationMonths, interestRate }) => {
  const finalAmount = principal * ((1 + interestRate / 100) ** durationMonths);
  const interestEarned = finalAmount - principal;

  return {
    interestEarned: roundTo(interestEarned),
    finalAmount: roundTo(finalAmount),
  };
};

const calculateCustom = ({ principal, durationMonths, interestRate }, config) => {
  const customRules = config.customRules;
  if (!customRules || typeof customRules !== 'object') {
    return {
      error: 'Custom calculator rules are missing for this group.',
    };
  }

  const baseType = normalizeCalculationType(customRules.baseType || 'simple');
  const rateMultiplier = toNumber(customRules.rateMultiplier) ?? 1;
  const flatBonus = toNumber(customRules.flatBonus) ?? 0;
  const flatFee = toNumber(customRules.flatFee) ?? 0;
  const finalMultiplier = toNumber(customRules.finalMultiplier) ?? 1;

  const seeded = {
    principal,
    durationMonths,
    interestRate: (interestRate ?? 0) * rateMultiplier,
  };

  const baseResult = baseType === 'compound'
    ? calculateCompoundInterest(seeded)
    : calculateSimpleInterest(seeded);

  const finalAmount = (baseResult.finalAmount + flatBonus - flatFee) * finalMultiplier;
  const interestEarned = finalAmount - principal;

  return {
    interestEarned: roundTo(interestEarned),
    finalAmount: roundTo(finalAmount),
  };
};

const calculateByType = (payload, config) => {
  const totalInvestment = payload.totalChitAmount;
  const commissionAmount = totalInvestment * (payload.commissionRate / 100);
  const principal = totalInvestment - commissionAmount;
  const contributionPerMember = totalInvestment / payload.numberOfMembers;

  const interestResult = config.calculationType === 'simple'
    ? calculateSimpleInterest({
      principal,
      durationMonths: payload.durationMonths,
      interestRate: payload.interestRate,
    })
    : config.calculationType === 'compound'
      ? calculateCompoundInterest({
        principal,
        durationMonths: payload.durationMonths,
        interestRate: payload.interestRate,
      })
      : calculateCustom({
        principal,
        durationMonths: payload.durationMonths,
        interestRate: payload.interestRate,
      }, config);

  if (interestResult.error) return interestResult;

  return {
    totalInvestment: roundTo(totalInvestment),
    contributionPerMember: roundTo(contributionPerMember),
    commissionRate: roundTo(payload.commissionRate),
    commissionAmount: roundTo(commissionAmount),
    principalAfterCommission: roundTo(principal),
    interestEarned: roundTo(interestResult.interestEarned),
    finalAmount: roundTo(interestResult.finalAmount),
  };
};

module.exports = {
  normalizeCalculatorConfig,
  validateCalculatePayload,
  calculateByType,
};
