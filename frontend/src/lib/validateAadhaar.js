const D_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

const P_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

export const sanitizeAadhaar = (aadhaarNumber) => {
  if (aadhaarNumber === null || aadhaarNumber === undefined) return "";
  return String(aadhaarNumber).replace(/\s+/g, "");
};

const isSequential = (digits) => {
  if (digits.length !== 12) return false;

  let asc = true;
  let desc = true;

  for (let i = 1; i < digits.length; i += 1) {
    const prev = Number(digits[i - 1]);
    const current = Number(digits[i]);
    if (current !== (prev + 1) % 10) asc = false;
    if (current !== (prev + 9) % 10) desc = false;
  }

  return asc || desc;
};

const hasValidVerhoeffChecksum = (digits) => {
  let checksum = 0;
  for (let i = 0; i < digits.length; i += 1) {
    const digit = Number(digits[digits.length - 1 - i]);
    checksum = D_TABLE[checksum][P_TABLE[i % 8][digit]];
  }
  return checksum === 0;
};

export const validateAadhaar = (aadhaarNumber) => {
  const sanitized = sanitizeAadhaar(aadhaarNumber);

  if (!sanitized) return "not verified";
  if (!/^\d{12}$/.test(sanitized)) return "not verified";
  if (!/^[2-9]/.test(sanitized)) return "not verified";
  if (/^(\d)\1{11}$/.test(sanitized)) return "not verified";
  if (isSequential(sanitized)) return "not verified";
  if (!hasValidVerhoeffChecksum(sanitized)) return "not verified";

  return "verified";
};
