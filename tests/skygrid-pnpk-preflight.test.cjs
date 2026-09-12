const assert = require('node:assert/strict');
const test = require('node:test');
const runtime = require('../api/runtime.js');
const { BRIDGE_ROUTES, runPreflight } = require('../scripts/skygrid-pnpk-preflight.cjs');

function runtimeFetch(url) {
  const body = runtime.route(url.pathname);
  return Promise.resolve({ ok: Boolean(body), status: body ? 200 : 404, json: async () => body });
}

test('PNPK bridge contract exposes every documented route and fail-closed guardrail', async () => {
  const report = await runPreflight({ baseUrl: 'https://example.test', fetchImpl: runtimeFetch });
  assert.deepEqual(report.results.map(({ path }) => path), BRIDGE_ROUTES);
  assert.equal(report.findings[0].lane, 'P1 AWS Bridge Config');
  assert.equal(report.findings.length, 1);
  assert.equal(runtime.route('/api/aura-core/decide').decision, 'HOLD');
});

test('PNPK triages critical failures, manifest drift, and Vercel auth blocks', async () => {
  const fetchImpl = async (url) => {
    if (url.pathname === '/health.json') return { ok: false, status: 503, json: async () => ({}) };
    if (url.pathname === '/api/highway/postman') return { ok: false, status: 403, json: async () => ({}) };
    const body = runtime.route(url.pathname);
    return { ok: true, status: 200, json: async () => body };
  };
  const report = await runPreflight({ baseUrl: 'https://example.test', fetchImpl });
  assert.ok(report.findings.some(({ lane }) => lane === 'P0 Bridge Down'));
  assert.ok(report.findings.some(({ lane }) => lane === 'P1 Manifest Drift'));
  assert.ok(report.findings.some(({ lane }) => lane === 'P2 CI/Auth Blocker'));
});
