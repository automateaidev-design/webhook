const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Parse JSON bodies
app.use(express.json());

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
  const notification = req.body;
  
  // Log the notification
  console.log('=== eBay Notification Received ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Headers:', req.headers);
  console.log('Body:', JSON.stringify(notification, null, 2));
  console.log('===================================');
  
  // Respond with 200 OK immediately (required by eBay)
  res.status(200).json({
    status: 'received',
    timestamp: new Date().toISOString(),
    notificationId: notification?.notificationId || 'unknown'
  });
  
  // TODO: If you want to actually process the notification,
  // you could:
  // 1. Store it in a database
  // 2. Send an email alert
  // 3. Trigger another workflow
  // 4. Call your n8n webhook
});

// Test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Webhook is working!',
    webhookUrl: '/webhook/ebay/account-deletion',
    method: 'POST'
  });
});

// Start server
app.listen(port, () => {
  console.log(`✅ eBay Webhook Handler running on port ${port}`);
  console.log(`📍 Webhook endpoint: /webhook/ebay/account-deletion`);
});
