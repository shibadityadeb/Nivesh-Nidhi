// Translation service using Google Translate API (free, CORS-friendly, generous limits)
const TRANSLATE_URL = "https://translate.googleapis.com/translate_a/single";

// In-memory cache – keyed by language
const translationCache = new Map();

// Request queue to throttle concurrent requests
let activeRequests = 0;
const MAX_CONCURRENT = 3;
const requestQueue = [];

function getCacheKey(text, targetLang) {
  return `${targetLang}::${text}`;
}

function processQueue() {
  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT) {
    const next = requestQueue.shift();
    next();
  }
}

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    const run = () => {
      activeRequests++;
      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeRequests--;
          processQueue();
        });
    };
    if (activeRequests < MAX_CONCURRENT) {
      run();
    } else {
      requestQueue.push(run);
    }
  });
}

/**
 * Translate a single string using Google Translate
 */
export async function translateText(text, targetLang) {
  if (!text || !targetLang || targetLang === "en") return text;

  const trimmed = typeof text === "string" ? text.trim() : "";
  if (!trimmed) return text;

  const cacheKey = getCacheKey(trimmed, targetLang);
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }

  return enqueue(async () => {
    // Double-check cache (another request may have resolved while queued)
    if (translationCache.has(cacheKey)) {
      return translationCache.get(cacheKey);
    }

    try {
      const params = new URLSearchParams({
        client: "gtx",
        sl: "en",
        tl: targetLang,
        dt: "t",
        q: trimmed,
      });

      const res = await fetch(`${TRANSLATE_URL}?${params.toString()}`);

      if (!res.ok) {
        console.warn(`[Translation] API returned ${res.status} for "${trimmed}"`);
        return text;
      }

      const data = await res.json();
      // Google returns nested array: [[["translated","original",...],...],...]
      const translated = data?.[0]
        ?.map((segment) => segment[0])
        .filter(Boolean)
        .join("") || text;

      translationCache.set(cacheKey, translated);
      return translated;
    } catch (error) {
      console.warn("[Translation] Failed:", error.message, "for:", trimmed);
      return text; // Fallback to original
    }
  });
}

/**
 * Translate a batch of strings in parallel (with concurrency limit)
 */
export async function translateBatch(texts, targetLang) {
  if (!targetLang || targetLang === "en") {
    return texts.reduce((acc, t) => ({ ...acc, [t]: t }), {});
  }

  const promises = texts.map(async (text) => {
    const translated = await translateText(text, targetLang);
    return [text, translated];
  });

  const results = await Promise.all(promises);
  return Object.fromEntries(results);
}

/**
 * Clear the translation cache (call when switching languages)
 */
export function clearTranslationCache() {
  translationCache.clear();
  // Also clear the queue
  requestQueue.length = 0;
}

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", flag: "🇮🇳" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", flag: "🇮🇳" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", flag: "🇮🇳" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", flag: "🇮🇳" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", flag: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "ur", name: "Urdu", nativeName: "اردو", flag: "🇵🇰" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
];
