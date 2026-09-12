const test = require('node:test');
const assert = require('node:assert/strict');
const { selectAutoDrillResource } = require('../src/aps/auto-drill-selector.ts');

test('auto drill selector returns deterministic recommendation and guardrails', () => {
  const input = { intent: 'request_compute', candidates: ['aws_lambda', 'vercel', 'x402', 'device_compute'] };
  const first = selectAutoDrillResource(input);
  const second = selectAutoDrillResource(input);

  assert.equal(first.recommendation.lane, second.recommendation.lane);
  assert.equal(first.recommendation.score, second.recommendation.score);
  assert.equal(first.executionGuardrail.allowedToExecute, false);
  assert.ok(first.alternates.length > 0);
  assert.ok(Array.isArray(first.avoidLanes));
});
