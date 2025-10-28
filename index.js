const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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

// eBay Account Deletion Notification Endpoint
app.all('/webhook/ebay/account-deletion', (req, res) => {
  console.log('=== eBay Request Received ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Query Params:', JSON.stringify(req.query, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Timestamp:', new Date().toISOString());
  
  // Handle GET request with challenge_code (eBay verification)
  if (req.method === 'GET') {
    const challengeCode = req.query.challenge_code || req.query.challengeCode;
    
    if (challengeCode) {
      console.log('✅ Challenge code received:', challengeCode);
      const response = { challengeResponse: challengeCode };
      console.log('Responding with:', JSON.stringify(response));
      console.log('===================================');
      return res.status(200).json(response);
    }
    
    // Simple GET without challenge
    console.log('Simple GET - responding 200 OK');
    console.log('===================================');
    return res.status(200).json({
      status: 'active',
      endpoint: 'eBay Account Deletion Webhook'
    });
  }
  
  // Handle POST request (actual notifications)
  if (req.method === 'POST') {
    console.log('📬 POST notification received');
    
    // Handle challenge in POST body
    if (req.body && req.body.challengeCode) {
      console.log('✅ Challenge code in body:', req.body.challengeCode);
      const response = { challengeResponse: req.body.challengeCode };
      console.log('===================================');
      return res.status(200).json(response);
    }
    
    // Handle actual notification
    const notification = req.body;
    console.log('Processing notification');
    console.log('===================================');
    
    return res.status(200).json({
      status: 'received',
      timestamp: new Date().toISOString()
    });
  }
  
  // Other methods
  console.log('===================================');
  res.status(405).json({ error: 'Method not allowed' });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    status: 'working',
    message: 'Webhook is active!',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ eBay Webhook Handler running on port ${port}`);
  console.log(`📍 Webhook: /webhook/ebay/account-deletion`);
});
