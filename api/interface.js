module.exports = function handler(_req, res) {
  res.status(200).json({
    interface: 'skygrid-b12',
    status: 'advisory-safe',
    noLiveMoneyMovement: true,
    operatorApprovalRequired: true,
  });
};
