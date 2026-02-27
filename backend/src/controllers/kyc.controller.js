const crypto = require('crypto');
const User = require('../models/User');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => Math.floor(Math.random() * 1001) + 7000;

const verifyKyc = async (req, res) => {
  try {
    const { aadhaarNumber, name, age, address } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isKycVerified) {
      return res.status(409).json({
        success: false,
        message: 'KYC already verified for this account'
      });
    }

    const aadhaarHash = crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
    const existingAadhaar = await User.findByAadhaar(aadhaarHash, req.user.id);

    if (existingAadhaar) {
      return res.status(409).json({
        success: false,
        message: 'This Aadhaar is already linked with another account'
      });
    }

    await wait(randomDelay());

    const updatedUser = await User.updateById(req.user.id, {
      name: name.trim(),
      isKycVerified: true,
      aadhaarNumber: aadhaarHash,
      age: Number(age),
      address: address.trim()
    });

    return res.status(200).json({
      success: true,
      message: 'KYC Verified Successfully',
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          isKycVerified: updatedUser.isKycVerified,
          age: updatedUser.age,
          address: updatedUser.address
        }
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'KYC verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { verifyKyc };
