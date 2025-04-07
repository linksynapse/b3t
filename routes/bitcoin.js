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

// 공통 JSON-RPC 요청 함수
async function callRpcMethod(method, params = []) {
  try {
    const response = await axios.post(
      rpcUrl,
      {
        jsonrpc: "1.0",
        id: method,
        method,
        params,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.result;
  } catch (error) {
    console.error(`RPC Error [${method}]:`, error.message);
    throw error;
  }
}

// 블록체인 정보 조회
// bitcoin-cli getblockchaininfo
router.get('/getblockchaininfo', async (req, res) => {
  try {
    const result = await callRpcMethod('getblockchaininfo');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 네트워크 정보 조회
// bitcoin-cli getnetworkinfo
router.get('/getnetworkinfo', async (req, res) => {
  try {
    const result = await callRpcMethod('getnetworkinfo');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 지갑 정보 조회
// bitcoin-cli getwalletinfo
router.get('/getwalletinfo', async (req, res) => {
  try {
    const result = await callRpcMethod('getwalletinfo');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 새 비트코인 주소 생성
// bitcoin-cli getnewaddress
router.get('/getnewaddress', async (req, res) => {
  try {
    const result = await callRpcMethod('getnewaddress');
    res.json({ address: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 비트코인 주소로 송금
// bitcoin-cli sendtoaddress <address> <amount>
router.post('/sendtoaddress', async (req, res) => {
  const { address, amount } = req.body;
  try {
    const result = await callRpcMethod('sendtoaddress', [address, amount]);
    res.json({ txid: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 트랜잭션 상세 정보 조회 (지갑 관련)
// bitcoin-cli gettransaction <txid>
router.get('/gettransaction/:txid', async (req, res) => {
  const { txid } = req.params;
  try {
    const result = await callRpcMethod('gettransaction', [txid]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 트랜잭션 원시 데이터 조회
// bitcoin-cli getrawtransaction <txid> [verbose]
router.get('/getrawtransaction/:txid', async (req, res) => {
  const { txid } = req.params;
  const verbose = req.query.verbose === 'true';
  try {
    const result = await callRpcMethod('getrawtransaction', [txid, verbose]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 지갑 잔액 조회
// bitcoin-cli getbalance
router.get('/getbalance', async (req, res) => {
  try {
    const result = await callRpcMethod('getbalance');
    res.json({ balance: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 원시 트랜잭션 hex 디코딩
// bitcoin-cli decoderawtransaction <hex>
router.post('/decoderawtransaction', async (req, res) => {
  const { hex } = req.body;
  try {
    const result = await callRpcMethod('decoderawtransaction', [hex]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 블록 높이로 블록 해시 조회
// bitcoin-cli getblockhash <height>
router.get('/getblockhash/:height', async (req, res) => {
  const { height } = req.params;
  try {
    const result = await callRpcMethod('getblockhash', [parseInt(height)]);
    res.json({ blockhash: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 블록 해시로 블록 정보 조회
// bitcoin-cli getblock <blockhash>
router.get('/getblock/:blockhash', async (req, res) => {
  const { blockhash } = req.params;
  try {
    const result = await callRpcMethod('getblock', [blockhash]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 주소 유효성 검사
// bitcoin-cli validateaddress <address>
router.get('/validateaddress/:address', async (req, res) => {
  const { address } = req.params;
  try {
    const result = await callRpcMethod('validateaddress', [address]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 특정 주소의 관련 트랜잭션 ID 목록 조회
// bitcoin-cli scantxoutset start '[{"desc": "addr(...)"}]'
router.get('/gettransactionsbyaddress/:address', async (req, res) => {
    const { address } = req.params;
    try {
      const scanResult = await callRpcMethod('scantxoutset', ['start', [{ desc: `addr(${address})` }]]);
      const txids = (scanResult.unspents || []).map(u => u.txid);
      res.json({ txids });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
