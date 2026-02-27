const axios = require('axios');
const { maskSensitiveData } = require('../utils/maskSensitive');

// caching simple in-memory, TTL 6 hours
const cache = new Map();
const TTL = 6 * 60 * 60 * 1000;

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const PRIMARY_MODEL = process.env.CLAUDE_MODEL || 'claude-3-5-haiku-latest';
const FALLBACK_MODELS = [
  PRIMARY_MODEL,
  'claude-3-5-sonnet-latest',
  'claude-3-haiku-20240307'
];

function hashKey(groupData) {
  return JSON.stringify(groupData);
}

async function analyzeGroup(groupData) {
  const key = hashKey(groupData);
  const now = Date.now();
  if (cache.has(key)) {
    const entry = cache.get(key);
    if (now - entry.timestamp < TTL) return entry.result;
  }

  const systemPrompt = `You are a financial safety and trust advisor for a chit fund platform.\nAnalyze groups in a balanced and liberal manner.\nAvoid harsh judgments unless clear fraud signals exist.\nPrefer MEDIUM over HIGH risk unless strong evidence is present.\nReturn ONLY valid JSON.`;

  const userPrompt = `Analyze this chit fund group:\n${JSON.stringify(groupData)}`;

  try {
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not configured');
    }

    let response = null;
    let selectedModel = PRIMARY_MODEL;
    let lastError = null;

    for (const model of FALLBACK_MODELS) {
      try {
        response = await axios.post(
          CLAUDE_API_URL,
          {
            model,
            max_tokens: 512,
            temperature: 0.3,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }]
          },
          {
            headers: {
              'x-api-key': CLAUDE_API_KEY,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
            },
            timeout: 20000
          }
        );
        selectedModel = model;
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        if (error?.response?.status === 404) {
          continue;
        }
        throw error;
      }
    }

    if (!response) {
      throw lastError || new Error('Claude request failed');
    }

    const textBlocks = Array.isArray(response.data?.content)
      ? response.data.content.filter((item) => item?.type === 'text').map((item) => item.text)
      : [];
    let text = textBlocks.join('\n').trim();
    if (!text) {
      throw new Error('Claude returned empty content');
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) result = JSON.parse(m[0]);
      else throw e;
    }
    result = {
      riskLevel: result.riskLevel || 'MEDIUM',
      confidence: Number(result.confidence ?? 60),
      warningFlags: Array.isArray(result.warningFlags) ? result.warningFlags : [],
      positiveSignals: Array.isArray(result.positiveSignals) ? result.positiveSignals : [],
      summary: result.summary || 'AI analysis completed.',
      recommendation: result.recommendation || 'Review details before joining.',
      model: selectedModel,
      source: 'ai',
      updatedAt: now
    };
    cache.set(key, { timestamp: now, result });
    return result;
  } catch (err) {
    console.error('[GroupRiskClaude] error', maskSensitiveData(err));
    // fallback heuristic
    const heuristic = {
      riskLevel: 'MEDIUM',
      confidence: 50,
      warningFlags: [],
      positiveSignals: [],
      summary: 'Unable to reach AI service, using heuristic.',
      recommendation: 'Proceed with caution.',
      model: PRIMARY_MODEL,
      source: 'heuristic',
      updatedAt: now
    };
    if (!groupData.kyc) {
      heuristic.warningFlags.push('KYC not completed');
      heuristic.confidence += 10;
    }
    if (parseFloat(groupData.commission) > 12) {
      heuristic.warningFlags.push('High commission');
      heuristic.confidence += 10;
    }
    if (!groupData.description || groupData.description.length < 20) {
      heuristic.warningFlags.push('Vague description');
      heuristic.confidence += 10;
    }
    if (groupData.pastPerformance && groupData.pastPerformance.toLowerCase().includes('guarantee')) {
      heuristic.warningFlags.push('Suspicious promise');
      heuristic.confidence += 10;
    }
    return heuristic;
  }
}

module.exports = { analyzeGroup };
