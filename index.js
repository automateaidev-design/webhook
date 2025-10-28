const express = require('express');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3000;

// IMPORTANT: These must match what you enter in eBay Developer Portal
const VERIFICATION_TOKEN = '9f1d8e75ac92b2439ccf4a4e6b7db7a0';
const ENDPOINT_URL = 'https://webhook-ebay.onrender.com/webhook/ebay/account-deletion';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'active',
    service: 'eBay Webhook Handler',
    timestamp: new Date().toISOString()
  });
});

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
      
      // Create SHA-256 hash of: challengeCode + verificationToken + endpointURL
      const hashString = challengeCode + VERIFICATION_TOKEN + ENDPOINT_URL;
      console.log('Hash input:', hashString);
      
      const hash = crypto.createHash('sha256').update(hashString).digest('hex');
      console.log('Hash output:', hash);
      
      const response = { challengeResponse: hash };
      console.log('Responding with:', JSON.stringify(response));
      console.log('===================================');
      
      res.set('Content-Type', 'application/json');
      return res.status(200).json(response);
    }
    
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
    
    const notification = req.body;
    console.log('Processing notification');
    console.log('===================================');
    
    return res.status(200).json({
      status: 'received',
      timestamp: new Date().toISOString()
    });
  }
  
  console.log('===================================');
  res.status(405).json({ error: 'Method not allowed' });
});

app.get('/test', (req, res) => {
  res.status(200).json({
    status: 'working',
    message: 'Webhook is active!',
    verificationToken: VERIFICATION_TOKEN,
    endpointURL: ENDPOINT_URL,
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`✅ eBay Webhook Handler running on port ${port}`);
  console.log(`📍 Endpoint: ${ENDPOINT_URL}`);
  console.log(`🔑 Verification Token: ${VERIFICATION_TOKEN}`);
});
