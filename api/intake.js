module.exports = function handler(_req, res) {
  res.status(200).json({
    intake: 'operator-reviewed',
    activation: 'manual-approval-only',
    privateKeysAccepted: false,
  });
};
