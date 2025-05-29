const fs = require('fs');
const path = require('path');

console.log('🔍 Backend Testing Script');
console.log('========================');

// Check if Node.js modules exist
try {
  const express = require('express');
  const cors = require('cors');
  const { v4: uuidv4 } = require('uuid');
  console.log('✅ All required modules found');
} catch (error) {
  console.error('❌ Missing modules:', error.message);
  process.exit(1);
}

// Check if server.js exists and read it
if (!fs.existsSync('server.js')) {
  console.error('❌ server.js not found');
  process.exit(1);
}

console.log('✅ server.js exists');

// Try to start a test server
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Test health endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Lyo Backend Test Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Basic auth test endpoint
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@lyo.ai' && password === 'admin123') {
    res.json({
      success: true,
      token: 'test-jwt-token-123',
      user: {
        id: 'test-user-1',
        name: 'Test User',
        email: email
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Test Backend Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔑 Login: POST http://localhost:${PORT}/api/v1/auth/login`);
  console.log('✨ Backend is ready for frontend testing!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  server.close(() => {
    process.exit(0);
  });
});
