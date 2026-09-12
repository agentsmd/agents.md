const { createProofReceipt } = require('../../../src/web3/onramp');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'method_not_allowed' });
    return;
  }

  const payload = createProofReceipt(req.body || {});
  res.status(payload.statusCode).json(payload);
};
