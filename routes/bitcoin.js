const express = require('express');
const router = express.Router();
const axios = require('axios');

const {
  RPC_USER,
  RPC_PASSWORD,
  RPC_HOST,
  RPC_PORT,
} = process.env;

const rpcUrl = `${RPC_HOST}:${RPC_PORT}/`;
const auth = Buffer.from(`${RPC_USER}:${RPC_PASSWORD}`).toString('base64');

router.get('/getblockchaininfo', async (req, res) => {
  try {
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: "1.0",
        id: "getblockchaininfo",
        method: "getblockchaininfo",
        params: [],
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json(response.data.result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
