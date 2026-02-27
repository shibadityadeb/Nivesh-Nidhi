const crypto = require('crypto');
const { prisma } = require('../config/db');
const { getCanonicalState, getCanonicalCity } = require('../constants/indiaLocations');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = () => Math.floor(Math.random() * 1001) + 7000;

const verifyKyc = async (req, res) => {
  try {
    const { aadhaarNumber, name, age, state, city } = req.body;

    // Fetch the user using Prisma
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User no longer exist'
      });
    }

    if (user.isKycVerified) {
      return res.status(409).json({
        success: false,
        message: 'KYC already verified for this account'
      });
    }

    // Check if Aadhaar is already in use by someone else
    const aadhaarHash = crypto.createHash('sha256').update(aadhaarNumber).digest('hex');
    const existingAadhaar = await prisma.user.findFirst({
      where: {
        aadhaarNumber: aadhaarHash,
        id: { not: req.user.id }
      }
    });

    if (existingAadhaar) {
      return res.status(409).json({
        success: false,
        message: 'This Aadhaar is already linked with another account'
      });
    }

    // Process valid location strings
    const canonicalState = getCanonicalState(state);
    const canonicalCity = getCanonicalCity(canonicalState, city);
    const normalizedAddress = `${canonicalCity || city}, ${canonicalState || state}`;

    // Simulate third-party delay
    await wait(randomDelay());

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name.trim(),
        isKycVerified: true,
        aadhaarNumber: aadhaarHash,
        age: Number(age),
        city: canonicalCity || city,
        state: canonicalState || state,
        address: normalizedAddress
      }
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
          city: updatedUser.city,
          state: updatedUser.state,
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
