const assert = require('node:assert/strict');
const test = require('node:test');

const runtime = require('../api/runtime.js');

const requiredRoutes = [
  '/',
  '/health.json',
  '/highway',
  '/api/highway/status',
  '/api/highway/flasks',
  '/api/highway/postman',
  '/dispatch',
  '/scenarios',
  '/rates',
  '/base',
  '/pay',
  '/api/pay/quote?amount=25',
];

test('runtime proof lane exposes required advisory routes', () => {
  for (const route of requiredRoutes) {
    const payload = runtime.route(route);
    assert.ok(payload, `${route} should return a payload`);
    assert.equal(payload.guardrails.advisoryOnly, true);
    assert.equal(payload.guardrails.noLiveMoneyMovement, true);
    assert.equal(payload.guardrails.operatorApprovalRequired, true);
    assert.equal(payload.trainingConfig.routingMode, 'base_primary_protected_ready');
    assert.equal(payload.trainingConfig.guardConfig, 'skygrid-sunpay-base-rate-guard');
    assert.equal(payload.trainingConfig.pricingDecision, 'HOLD');
  }
});

test('pay quote remains held and quote-only', () => {
  const payload = runtime.route('/api/pay/quote?amount=25');

  assert.equal(payload.quote.amount, 25);
  assert.equal(payload.quote.pricingDecision, 'HOLD');
  assert.equal(payload.quote.fulfillment, 'operator-approved-only');
  assert.equal(payload.liveCharge, false);
});

test('highway postman manifest includes every MVP-64 required route', () => {
  const payload = runtime.route('/api/highway/postman');

  for (const route of requiredRoutes) {
    assert.ok(payload.requiredRoutes.includes(route), `${route} missing from proof manifest`);
  }
  assert.ok(payload.requiredRoutes.includes('/api/stripe/device-link'));
});
