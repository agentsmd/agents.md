module.exports = function handler(_req, res) {
  res.status(200).json({
    preflight: 'passive-check-only',
    transactionSigning: false,
    automaticRouting: false,
    secretExposure: false,
  });
};
