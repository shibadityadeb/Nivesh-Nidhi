const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const kycRoutes = require('./routes/kyc.route');
const userRoutes = require('./routes/user.routes');
const organizerRoutes = require('./routes/organizer.routes');
const adminRoutes = require('./routes/admin.routes');
const organizationRoutes = require('./routes/organization.routes');
const chitGroupRoutes = require('./routes/chitgroup.routes');
const escrowRoutes = require('./routes/escrow.routes');
const orgManageRoutes = require('./routes/orgmanage.routes');
const organizerRequestRoutes = require('./routes/organizerRequest.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const locationRoutes = require('./routes/location.routes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nivesh Nidhi API is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/user', userRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/chit-groups', chitGroupRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/org-manage', orgManageRoutes);
app.use('/api/organizer/requests', organizerRequestRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/locations', locationRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum 5MB allowed.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app;
