require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const bitcoinRoutes = require('./routes/bitcoin');

app.use(cors());
app.use(express.json());
app.use('/api/bitcoin', bitcoinRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Bitcoin RPC Server running at http://localhost:${PORT}`);
});
