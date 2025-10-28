const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

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
  
  if (req.method === 'GET') {
    const challengeCode = req.query.challenge_code || req.query.challengeCode;
    
    if (challengeCode) {
      console.log('✅ Challenge code received:', challengeCode);
      
      // Try plain text response (what eBay might actually want)
      console.log('Responding with PLAIN TEXT:', challengeCode);
      console.log('===================================');
      res.set('Content-Type', 'text/plain');
      return res.status(200).send(challengeCode);
    }
    
    console.log('Simple GET - responding 200 OK');
    console.log('===================================');
    return res.status(200).json({
      status: 'active',
      endpoint: 'eBay Account Deletion Webhook'
    });
  }
  
  if (req.method === 'POST') {
    console.log('📬 POST notification received');
    
    if (req.body && req.body.challengeCode) {
      console.log('✅ Challenge code in body:', req.body.challengeCode);
      res.set('Content-Type', 'text/plain');
      console.log('===================================');
      return res.status(200).send(req.body.challengeCode);
    }
    
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
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`✅ eBay Webhook Handler running on port ${port}`);
  console.log(`📍 Webhook: /webhook/ebay/account-deletion`);
});
