const User = require('../models/User');
const { processAadhaarOCR, cleanupFile } = require('../services/ocr.service');

const verifyAadhaar = async (req, res) => {
  let filePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aadhaar image is required'
      });
    }

    filePath = req.file.path;
    const ocrResult = await processAadhaarOCR(filePath);

    if (!ocrResult.aadhaarNumber) {
      cleanupFile(filePath);
      return res.status(422).json({
        success: false,
        message: 'Could not extract Aadhaar number from image. Please upload a clearer image.',
        data: { extractedText: ocrResult.raw }
      });
    }

    const existingAadhaar = await User.findByAadhaar(ocrResult.aadhaarNumber, req.user.id);
    if (existingAadhaar) {
      cleanupFile(filePath);
      return res.status(409).json({
        success: false,
        message: 'This Aadhaar is already registered with another account'
      });
    }

    const isValid = ocrResult.aadhaarNumber && 
                    ocrResult.aadhaarNumber.length === 12 && 
                    (ocrResult.name || ocrResult.dob);

    const updateData = {
      aadhaar_number: ocrResult.aadhaarNumber,
      aadhaar_name: ocrResult.name || null,
      aadhaar_dob: ocrResult.dob || null,
      aadhaar_address: ocrResult.address || null,
      is_kyc_verified: isValid
    };

    const user = await User.updateById(req.user.id, updateData);

    cleanupFile(filePath);

    res.status(200).json({
      success: true,
      message: isValid ? 'KYC verification successful' : 'Partial data extracted. Additional verification may be required.',
      data: {
        isKycVerified: user.is_kyc_verified,
        extracted: {
          name: ocrResult.name,
          dob: ocrResult.dob,
          aadhaarNumber: ocrResult.aadhaarNumber ? `XXXX-XXXX-${ocrResult.aadhaarNumber.slice(-4)}` : null,
          address: ocrResult.address
        }
      }
    });
  } catch (error) {
    if (filePath) cleanupFile(filePath);
    
    res.status(500).json({
      success: false,
      message: 'KYC verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getKycStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        isKycVerified: user.is_kyc_verified,
        aadhaarName: user.aadhaar_name,
        aadhaarDob: user.aadhaar_dob,
        hasAadhaar: !!user.aadhaar_number
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { verifyAadhaar, getKycStatus };
