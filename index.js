const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Set to 100% success rate for testing
const TRANSFER_SUCCESS_RATE = 1.0;
const DEBIN_APPROVAL_RATE = 1.0;

app.post('/api/transfer', (req, res) => {
  const { amount, toWalletId, source } = req.body;

  if (!amount || !toWalletId || !source) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  setTimeout(() => {
    const success = Math.random() < TRANSFER_SUCCESS_RATE;
    if (success) {
      res.json({ success: true, transactionId: `TR${Date.now()}` });
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
