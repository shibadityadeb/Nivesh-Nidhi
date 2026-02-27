const bcrypt = require('bcryptjs');
const { prisma } = require('../config/db');

const User = {
  // Create a new user
  create: async (userData) => {
    const { name, email, phone, password } = userData;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      throw new Error('All fields are required');
    }

    // Validate email format
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('Please provide a valid email');
    }

    // Validate phone format (Indian) - ensure it is a string first
    const phoneStr = String(phone).trim();
    if (!/^[6-9]\d{9}$/.test(phoneStr)) {
      throw new Error('Please provide a valid Indian phone number');
    }

    // Validate password length
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Hash password
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
      if (error.code === 'P2002') { // Prisma Unique constraint violation
        throw new Error('Email already registered');
      }
      throw error;
    }
  },

  // Find user by email (with password for login)
  findByEmail: async (email, includePassword = false) => {
    const selectFields = includePassword
      ? undefined
      : {
        id: true,
        name: true,
        email: true,
        phone: true,
        phone: true,
        aadhaarNumber: true,
        city: true,
        state: true,
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

  // Find user by ID
  findById: async (id) => {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        phone: true,
        aadhaarNumber: true,
        city: true,
        state: true,
        address: true,
        isKycVerified: true,
        role: true,
        createdAt: true
      }
    });

    return user;
  },

  // Find user by Aadhaar number
  findByAadhaar: async (aadhaarNumber, excludeId = null) => {
    let whereClause = { aadhaarNumber: aadhaarNumber };
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

  // Update user by ID
  updateById: async (id, updateData) => {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return updatedUser;
  },

  // Compare password for login
  comparePassword: async (candidatePassword, hashedPassword) => {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  },

  // Validate user data
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
