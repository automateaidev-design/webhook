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
app.post('/webhook/ebay/account-deletion', (req, res) => {
  console.log('=== eBay Notification Received ===');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('Query:', JSON.stringify(req.query, null, 2));
  console.log('Timestamp:', new Date().toISOString());
  console.log('===================================');
  
  // Handle eBay challenge code (verification request)
  if (req.body && req.body.challengeCode) {
    console.log('Challenge code received:', req.body.challengeCode);
    return res.status(200).json({
      challengeResponse: req.body.challengeCode
    });
  }
  
  // Handle actual notification
  const notification = req.body;
  
  // Respond with 200 OK immediately (required by eBay)
  res.status(200).json({
    status: 'received',
    timestamp: new Date().toISOString(),
    notificationId: notification?.notificationId || 'unknown'
  });
});

// Also handle GET requests for testing
app.get('/webhook/ebay/account-deletion', (req, res) => {
  console.log('GET request to webhook endpoint');
  res.status(200).json({
    message: 'Webhook endpoint is active. Use POST method for notifications.',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Webhook is working!',
    webhookUrl: '/webhook/ebay/account-deletion',
    method: 'POST',
    timestamp: new Date().toISOString()
  });
});

// Catch-all for debugging
app.use((req, res) => {
  console.log('Unhandled request:', req.method, req.path);
  res.status(404).json({
    error: 'Not found',
    method: req.method,
    path: req.path
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ eBay Webhook Handler running on port ${port}`);
  console.log(`📍 Webhook endpoint: POST /webhook/ebay/account-deletion`);
  console.log(`🧪 Test endpoint: GET /test`);
});
