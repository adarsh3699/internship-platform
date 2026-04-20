require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/opportunities', require('./routes/opportunities'));

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const User = require('./models/User');
    const Opportunity = require('./models/Opportunity');
    const students = await User.countDocuments({ role: 'student' });
    const organizations = await User.countDocuments({ role: 'organization' });
    const opportunities = await Opportunity.countDocuments({ status: 'active' });
    const applications = await Opportunity.aggregate([
      { $unwind: '$applicants' },
      { $count: 'total' }
    ]);
    res.json({
      success: true,
      stats: {
        students,
        organizations,
        opportunities,
        applications: applications[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Serve frontend
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

module.exports = app;
