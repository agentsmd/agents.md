const { selectAutoDrillResource } = require('../../src/aps/auto-drill-selector.ts');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }

  const { intent, candidates } = req.body || {};
  if (!intent || !Array.isArray(candidates)) {
    res.status(400).json({ error: 'invalid_request', required: ['intent', 'candidates'] });
    return;
  }

  const result = selectAutoDrillResource({ intent, candidates });
  res.status(200).json(result);
};
