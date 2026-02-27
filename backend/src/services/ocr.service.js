const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const processAadhaarOCR = async (filePath) => {
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath));
    formData.append('language', 'eng');
    formData.append('OCREngine', '1');
    formData.append('scale', 'true');
    formData.append('isTable', 'true');

    const response = await axios.post('https://api.ocr.space/parse/image', formData, {
      headers: {
        ...formData.getHeaders(),
        'apikey': process.env.OCR_SPACE_API_KEY
      },
      timeout: 30000
    });

    if (response.data.IsErroredOnProcessing) {
      throw new Error(response.data.ErrorMessage || 'OCR processing failed');
    }

    const parsedText = response.data.ParsedResults?.[0]?.ParsedText || '';
    return parseAadhaarData(parsedText);
  } catch (error) {
    if (error.response) {
      throw new Error(`OCR API error: ${error.response.data?.ErrorMessage || error.message}`);
    }
    throw error;
  }
};

const parseAadhaarData = (text) => {
  const result = {
    name: null,
    dob: null,
    aadhaarNumber: null,
    address: null,
    raw: text
  };

  const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
  const aadhaarMatch = text.match(aadhaarPattern);
  if (aadhaarMatch) {
    result.aadhaarNumber = aadhaarMatch[0].replace(/\s/g, '');
  }

  const dobPatterns = [
    /DOB[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    /Date of Birth[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    /Birth[:\s]*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    /\b(\d{2}[\/\-]\d{2}[\/\-]\d{4})\b/
  ];

  for (const pattern of dobPatterns) {
    const match = text.match(pattern);
    if (match) {
      result.dob = match[1];
      break;
    }
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (/government|india|uidai|aadhaar|male|female|dob|birth|address|s\/o|d\/o|w\/o|c\/o|\d{4}\s?\d{4}\s?\d{4}/i.test(line)) {
      continue;
    }

    if (/^[A-Z][a-z]+(\s[A-Z][a-z]+){1,3}$/.test(line) && line.length > 3 && line.length < 50) {
      result.name = line;
      break;
    }
  }

  const addressPatterns = [
    /Address[:\s]*([\s\S]*?)(?=\d{4}\s?\d{4}\s?\d{4}|$)/i,
    /S\/O|D\/O|W\/O|C\/O[:\s]*([\s\S]*?)(?=\d{4}\s?\d{4}\s?\d{4}|$)/i
  ];

  for (const pattern of addressPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      result.address = match[1].replace(/\n/g, ', ').trim().substring(0, 500);
      break;
    }
  }

  if (!result.address) {
    const addressLines = [];
    let capturing = false;

    for (const line of lines) {
      if (/s\/o|d\/o|w\/o|c\/o|address/i.test(line)) {
        capturing = true;
      }
      if (capturing && line.length > 0) {
        addressLines.push(line);
        if (addressLines.length >= 5) break;
      }
    }

    if (addressLines.length > 0) {
      result.address = addressLines.join(', ').substring(0, 500);
    }
  }

  return result;
};

const cleanupFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up file:', error.message);
  }
};

module.exports = { processAadhaarOCR, cleanupFile };
