// src/utils/maskSensitive.js
// Utility to mask sensitive data in logs

function maskSensitiveData(obj) {
  if (!obj) return obj;
  let str = typeof obj === 'string' ? obj : JSON.stringify(obj);
  // Mask API keys, tokens, emails, phone numbers
  str = str.replace(/(api[_-]?key|token|authorization)["':=\s]*[\w-]+/gi, '$1:***MASKED***');
  str = str.replace(/[\w.-]+@[\w.-]+/g, '***@***.***');
  str = str.replace(/\b\d{10,}\b/g, '***MASKED-NUMBER***');
  return str;
}

module.exports = { maskSensitiveData };