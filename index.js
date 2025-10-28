const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Your verification token
const VERIFICATION_TOKEN = '9f1d8e75ac92b2439ccf4a4e6b7db7a0';

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint - health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'active',
    service: 'eBay Webhook Handler',
    timestamp: new Date().toISOString()
  });
});

// eBay Account Deletion Notification Endpoint - Handle BOTH GET and POST
app.all('/webhook/ebay/account-deletion', (req, res) => {
  console.log('=== eBay Request Received ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Query Params:', JSON.stringify(req.query, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Timestamp:', new Date().toISOString());
  
  // Try to find verification token in multiple places
  const token = req.query.verification_token || 
                req.body.verification_token || 
                req.headers['x-ebay-verification-token'] ||
                req.headers['verification-token'];
  
  console.log('Token found:', token ? 'YES' : 'NO');
  console.log('Token value:', token);
  
  // Validate verification token if provided
  if (token && token !== VERIFICATION_TOKEN) {
    console.log('❌ ERROR: Invalid verification token');
    console.log('Expected:', VERIFICATION_TOKEN);
    console.log('Received:', token);
    return res.status(403).json({ error: 'Invalid verification token' });
  }
  
  if (token) {
    console.log('✅ Verification token valid');
  }
  
  // Handle GET request (eBay verification)
  if (req.method === 'GET') {
    console.log('📋 GET verification request');
    
    // Check if there's a challenge code in query params
    const challengeCode = req.query.challenge_code || req.query.challengeCode;
    
    if (challengeCode) {
      console.log('Challenge code in query:', challengeCode);
      const response = {
        challengeResponse: challengeCode
      };
      console.log('Responding with:', JSON.stringify(response));
      console.log('===================================');
      return res.status(200).json(response);
    }
    
    // Simple verification response
    console.log('Simple GET verification - responding with 200 OK');
    console.log('===================================');
    return res.status(200).json({
      status: 'active',
      endpoint: 'eBay Account Deletion Webhook',
      timestamp: new Date().toISOString()
    });
  }
  
  // Handle POST request (actual notification)
  if (req.method === 'POST') {
    console.log('📬 POST notification received');
    
    // Handle eBay challenge code (verification request in POST)
    if (req.body && req.body.challengeCode) {
      console.log('Challenge code in body:', req.body.challengeCode);
      const response = {
        challengeResponse: req.body.challengeCode
      };
      console.log('Responding with:', JSON.stringify(response));
      console.log('===================================');
      return res.status(200).json(response);
    }
    
    // Handle actual notification
    const notification = req.body;
    
    console.log('Processing notification:', notification?.notificationId || 'unknown');
    console.log('===================================');
    
    // Respond with 200 OK
    return res.status(200).json({
      status: 'received',
      timestamp: new Date().toISOString(),
      notificationId: notification?.notificationId || 'unknown'
    });
  }
  
  // Handle any other methods
  console.log('⚠️  Unsupported method:', req.method);
  console.log('===================================');
  res.status(405).json({ error: 'Method not allowed' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    status: 'working',
    message: 'Webhook is active!',
    webhookUrl: '/webhook/ebay/account-deletion?verification_token=9f1d8e75ac92b2439ccf4a4e6b7db7a0',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ eBay Webhook Handler running on port ${port}`);
  console.log(`📍 Webhook: ALL /webhook/ebay/account-deletion`);
  console.log(`🔑 Verification token: ${VERIFICATION_TOKEN}`);
  console.log(`🧪 Test: GET /test`);
});
