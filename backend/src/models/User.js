const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const User = {
  // Create a new user
  create: async (userData) => {
    const { name, email, phone, password } = userData;
    
    // Validate required fields
    if (!name || !email || !phone || !password) {
      throw new Error('All fields are required');
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Please provide a valid email');
    }

    // Validate phone format (Indian)
    if (!/^[6-9]\d{9}$/.test(phone)) {
      throw new Error('Please provide a valid Indian phone number');
    }

    // Validate password length
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: uuidv4(),
        name: name.trim().substring(0, 100),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        password: hashedPassword,
        role: 'user',
        is_kyc_verified: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Email already registered');
      }
      throw error;
    }

    return data;
  },

  // Find user by email (with password for login)
  findByEmail: async (email, includePassword = false) => {
    let query = supabase
      .from('users')
      .select(includePassword ? '*' : 'id, name, email, phone, aadhaar_number, aadhaar_name, aadhaar_dob, aadhaar_address, is_kyc_verified, role, created_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    const { data, error } = await query;

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error;
    }

    return data;
  },

  // Find user by ID
  findById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, phone, aadhaar_number, aadhaar_name, aadhaar_dob, aadhaar_address, is_kyc_verified, role, created_at')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Find user by Aadhaar number
  findByAadhaar: async (aadhaarNumber, excludeId = null) => {
    let query = supabase
      .from('users')
      .select('id, aadhaar_number')
      .eq('aadhaar_number', aadhaarNumber);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  // Update user by ID
  updateById: async (id, updateData) => {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
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

    if (!userData.email || !/^\S+@\S+\.\S+$/.test(userData.email)) {
      errors.push('Invalid email format');
    }

    if (!userData.phone || !/^[6-9]\d{9}$/.test(userData.phone)) {
      errors.push('Invalid Indian phone number');
    }

    if (!userData.password || userData.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    if (userData.password && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
      errors.push('Password must contain uppercase, lowercase, and number');
    }

    return errors;
  }
};

module.exports = User;
