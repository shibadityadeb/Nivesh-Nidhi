const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

const User = {
  create: async (userData) => {
    const { name, email, phone, password } = userData;

    if (!name || !email || !phone || !password) {
      throw new Error('All fields are required');
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Please provide a valid email');
    }

    const phoneStr = String(phone).trim();
    if (!/^[6-9]\d{9}$/.test(phoneStr)) {
      throw new Error('Please provide a valid Indian phone number');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      const newUser = await prisma.user.create({
        data: {
          name: name.trim().substring(0, 100),
          email: email.toLowerCase().trim(),
          phone: phoneStr,
          password: hashedPassword,
          role: 'USER',
          isKycVerified: false,
        }
      });
      return newUser;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('Email already registered');
      }
      throw error;
    }
  },

  findByEmail: async (email, includePassword = false) => {
    const selectFields = includePassword
      ? undefined
      : {
        id: true,
        name: true,
        email: true,
        phone: true,
        aadhaarNumber: true,
        age: true,
        address: true,
        isKycVerified: true,
        role: true,
        createdAt: true
      };

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: selectFields
    });

    return user;
  },

  findById: async (id) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        aadhaarNumber: true,
        age: true,
        address: true,
        isKycVerified: true,
        role: true,
        createdAt: true
      }
    });

    return user;
  },

  findByAadhaar: async (aadhaarNumber, excludeId = null) => {
    let whereClause = { aadhaarNumber };
    if (excludeId) {
      whereClause.id = { not: excludeId };
    }

    const user = await prisma.user.findFirst({
      where: whereClause,
      select: {
        id: true,
        aadhaarNumber: true
      }
    });

    return user;
  },

  findByAadhaarHash: async (aadhaarHash, excludeId = null) => {
    return User.findByAadhaar(aadhaarHash, excludeId);
  },

  updateById: async (id, updateData) => {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return updatedUser;
  },

  comparePassword: async (candidatePassword, hashedPassword) => {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  },

  validate: (userData) => {
    const errors = [];

    if (!userData.name || userData.name.trim().length < 2 || userData.name.trim().length > 100) {
      errors.push('Name must be 2-100 characters');
    }

    if (!userData.email || !/^\\S+@\\S+\\.\\S+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    if (!userData.phone || !/^[6-9]\d{9}$/.test(String(userData.phone).trim())) {
      errors.push('Invalid Indian phone number');
    }

    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (userData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(userData.password)) {
      errors.push('Password must contain uppercase, lowercase, and number');
    }

    return errors;
  }
};

module.exports = User;
