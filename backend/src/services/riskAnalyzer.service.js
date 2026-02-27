// src/services/riskAnalyzer.service.js
// Automated Organizer Risk Assessment using Claude API and fallback logic

const axios = require('axios');
const { maskSensitiveData } = require('../utils/maskSensitive');
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL ="https://api.anthropic.com/v1/messages" // Anthropic Claude API endpoint

// Cache for risk profiles (in-memory, replace with Redis for prod)
const riskCache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCacheKey(organizerId, dataHash) {
  return `${organizerId}:${dataHash}`;
}

function hashData(data) {
  // Simple hash for cache key (replace with crypto for prod)
  return JSON.stringify(data);
}

function ruleBasedRisk(data) {
  let score = 0;
  const concerns = [];
  const positives = [];

  if (data.age && data.age < 25) {
    score += 10;
    concerns.push('Organizer is under 25 years old');
  } else if (data.age && data.age >= 25) {
    positives.push('Organizer is 25 or older');
  }
  if (data.income && data.income < 25000) {
    score += 15;
    concerns.push('Income below ₹25k');
  } else if (data.income && data.income >= 25000) {
    positives.push('Income above ₹25k');
  }
  if (!data.experience || data.experience < 1) {
    score += 20;
    concerns.push('No prior work experience');
  } else {
    positives.push('Has work experience');
  }
  if (!data.businessName) {
    score += 25;
    concerns.push('No business registered');
  } else {
    positives.push('Has a business');
  }
  if (!data.kyc) {
    score += 20;
    concerns.push('KYC not completed');
  } else {
    positives.push('KYC completed');
  }

  let riskLevel = 'LOW';
  if (score >= 60) riskLevel = 'HIGH';
  else if (score >= 30) riskLevel = 'MEDIUM';

  return {
    riskLevel,
    riskScore: Math.min(score, 100),
    keyConcerns: concerns,
    positiveFactors: positives,
    recommendation: riskLevel === 'HIGH' ? 'Proceed with caution or reject.' : (riskLevel === 'MEDIUM' ? 'Review carefully.' : 'Low risk. Proceed.'),
    fallback: true
  };
}

async function analyzeRisk(organizerId, organizerData) {
  const data = {
    age: organizerData.age,
    occupation: organizerData.occupation,
    experience: organizerData.workExperience,
    income: organizerData.incomeRange,
    incomeSource: organizerData.incomeSource,
    purpose: organizerData.purposeOfFund,
    members: organizerData.expectedMembers,
    contribution: organizerData.monthlyContribution,
    kyc: organizerData.kycStatus === true || organizerData.kycStatus === 'true',
    businessName: organizerData.businessName || '',
    pastRecords: organizerData.pastRecords || ''
  };
  const dataHash = hashData(data);
  const cacheKey = getCacheKey(organizerId, dataHash);
  const now = Date.now();

  // Check cache
  if (riskCache.has(cacheKey)) {
    const cached = riskCache.get(cacheKey);
    if (now - cached.generatedAt < CACHE_TTL) {
      return cached;
    }
  }

  // Prepare Claude prompt
  const prompt = `You are a financial risk assessment AI.\nAnalyze the following chit fund organizer profile and classify risk.\nReturn ONLY valid JSON.\nInput: ${JSON.stringify({
    age: data.age,
    occupation: data.occupation,
    experience: data.experience,
    income: data.income,
    incomeSource: data.incomeSource,
    purpose: data.purpose,
    members: data.members,
    contribution: data.contribution,
    kyc: data.kyc
  })}\nOutput Format: {\n  "riskLevel": "LOW | MEDIUM | HIGH",\n  "riskScore": 0-100,\n  "keyConcerns": [ "...", "..." ],\n  "positiveFactors": [ "...", "..." ],\n  "recommendation": "..."\n}`;

  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 512,
        temperature: 0.2,
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10s
      }
    );
    let aiResult = response.data.choices?.[0]?.message?.content || response.data.result || response.data;
    // Parse JSON from Claude response
    let riskProfile;
    try {
      riskProfile = JSON.parse(aiResult);
    } catch (e) {
      // Try to extract JSON substring
      const match = aiResult.match(/\{[\s\S]*\}/);
      if (match) {
        riskProfile = JSON.parse(match[0]);
      } else {
        throw new Error('Claude response not valid JSON');
      }
    }
    const result = {
      level: riskProfile.riskLevel,
      score: riskProfile.riskScore,
      concerns: riskProfile.keyConcerns,
      positives: riskProfile.positiveFactors,
      recommendation: riskProfile.recommendation,
      generatedAt: now,
      fallback: false
    };
    riskCache.set(cacheKey, result);
    return result;
  } catch (err) {
    // Log error, mask sensitive data
    console.error('[RiskAnalyzer] Claude API failed:', maskSensitiveData(err));
    // Fallback
    const fallbackResult = ruleBasedRisk(data);
    const result = {
      level: fallbackResult.riskLevel,
      score: fallbackResult.riskScore,
      concerns: fallbackResult.keyConcerns,
      positives: fallbackResult.positiveFactors,
      recommendation: fallbackResult.recommendation,
      generatedAt: now,
      fallback: true
    };
    riskCache.set(cacheKey, result);
    return result;
  }
}

module.exports = {
  analyzeRisk,
  ruleBasedRisk
};
