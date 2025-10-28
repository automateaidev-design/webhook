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
```

---

## 🎯 **UPDATE EBAY WITH NEW URL (WITHOUT verification_token):**

**Use this URL in eBay Developer Portal:**
```
https://webhook-ebay.onrender.com/webhook/ebay/account-deletion
```

**NO query parameters!** Just the plain URL.

---

## 📋 **STEPS:**

### **Step 1: Update GitHub**

1. Edit `index.js` 
2. Replace with code above
3. Commit

### **Step 2: Wait for Deploy** (2-3 min)

### **Step 3: Update eBay Portal**

1. Go to: https://developer.ebay.com/my/keys
2. Find your application
3. **Change the URL to:**
```
   https://webhook-ebay.onrender.com/webhook/ebay/account-deletion
```
   **(No ?verification_token= part!)**

4. Click **"Verify endpoint"**

### **Step 4: Watch Render Logs**

You should see:
```
=== eBay Request Received ===
Method: GET
URL: /webhook/ebay/account-deletion?challenge_code=...
✅ Challenge code received: ...
Responding with: {"challengeResponse":"..."}
===================================
```

**And eBay should show:** ✅ **Verified!**

---

## 🤔 **BUT WAIT - WHAT ABOUT THE VERIFICATION TOKEN?**

**The verification token in eBay settings is NOT used in the webhook URL!**

It's used for:
1. **RuName configuration** (OAuth flow) - Different feature
2. **Internal eBay tracking** - Not sent in requests

**For the webhook endpoint itself, eBay just:**
1. Sends a GET request with `challenge_code`
2. Expects you to echo it back as `challengeResponse`
3. That's it!

---

## ✅ **SUMMARY:**

**The fix:**
- Remove verification token logic from code
- Use simple URL without query parameters
- Just echo back the challenge_code

**Your webhook URL for eBay:**
```
https://webhook-ebay.onrender.com/webhook/ebay/account-deletion
