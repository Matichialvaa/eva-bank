const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Set to 100% success rate for testing
const TRANSFER_SUCCESS_RATE = 1.0;
const DEBIN_APPROVAL_RATE = 1.0;

// Wall-E backend URL
const WALLE_BACKEND_URL = process.env.WALLE_BACKEND_URL || 'http://localhost:3000';

app.post('/api/transfer', async (req, res) => {
  const { amount, alias, source } = req.body;

  if (!amount || !alias || !source) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  setTimeout(async () => {
    const success = Math.random() < TRANSFER_SUCCESS_RATE;
    if (success) {
      try {
        // Call wall-e backend to actually deposit the money to the user's account
        const depositResponse = await axios.post(`${WALLE_BACKEND_URL}/bank/deposit`, {
          amount,
          alias,
          source
        });

        if (depositResponse.data.success) {
          res.json({ success: true, transactionId: `TR${Date.now()}` });
        } else {
          res.status(400).json({ success: false, error: 'Failed to deposit money to account' });
        }
      } catch (error) {
        console.error('Error calling wall-e backend:', error.message);
        res.status(500).json({ success: false, error: 'Internal transfer processing error' });
      }
    } else {
      res.status(400).json({ success: false, error: 'Transaction declined by bank' });
    }
  }, 1000);
});

app.post('/api/debin-request', (req, res) => {
  const { amount, toWalletId } = req.body;

  if (!amount || !toWalletId) {
    return res.status(400).json({ approved: false, error: 'Missing required fields' });
  }

  setTimeout(() => {
    const approved = Math.random() < DEBIN_APPROVAL_RATE;
    if (approved) {
      res.json({ approved: true, debinId: `DB${Date.now()}` });
    } else {
      res.json({ approved: false, error: 'DEBIN request not approved' });
    }
  }, 1500);
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

app.listen(port, () => {
  console.log(`Bank service listening at http://localhost:${port}`);
});
