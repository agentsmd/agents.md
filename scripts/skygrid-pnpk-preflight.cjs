#!/usr/bin/env node

const BRIDGE_ROUTES = [
  '/health.json',
  '/api/skygrid/status',
  '/api/skygrid/intake',
  '/api/highway/status',
  '/api/highway/postman',
  '/api/aura-core/decide',
];
const CRITICAL_ROUTES = new Set(['/health.json', '/api/skygrid/status', '/api/highway/status']);
const EXPECTED_GUARDRAILS = {
  payment_execution: false,
  device_activation: false,
  production_failover: false,
  private_data_movement: false,
};

function finding(lane, summary, labels) {
  return { lane, summary, labels: ['skygrid', 'bridge-readiness', ...labels] };
}

async function runPreflight({ baseUrl, fetchImpl = fetch }) {
  const results = [];
  const findings = [];
  let manifest;

  for (const path of BRIDGE_ROUTES) {
    try {
      const response = await fetchImpl(new URL(path, baseUrl), { headers: { accept: 'application/json' } });
      let body = null;
      try { body = await response.json(); } catch {}
      results.push({ path, status: response.status, ok: response.ok });
      if (!response.ok) {
        const authBlocked = response.status === 401 || response.status === 403;
        findings.push(authBlocked
          ? finding('P2 CI/Auth Blocker', `${path} blocked preflight with HTTP ${response.status}`, ['vercel', 'postman'])
          : finding(CRITICAL_ROUTES.has(path) ? 'P0 Bridge Down' : 'P1 Manifest Drift', `${path} returned HTTP ${response.status}`, CRITICAL_ROUTES.has(path) ? ['incident-response'] : ['manifest-drift']));
      }
      if (path === '/api/skygrid/status' && response.ok) manifest = body;
    } catch (error) {
      results.push({ path, status: null, ok: false });
      findings.push(finding(CRITICAL_ROUTES.has(path) ? 'P0 Bridge Down' : 'P1 Manifest Drift', `${path} request failed: ${error.message}`, ['incident-response']));
    }
  }

  if (manifest) {
    for (const path of manifest.routes || []) {
      const result = results.find((entry) => entry.path === path);
      if (!result || !result.ok) findings.push(finding('P1 Manifest Drift', `advertised route is not healthy: ${path}`, ['manifest-drift']));
    }
    const missingAws = Object.entries(manifest.awsBridge || {}).filter(([, ready]) => ready !== true).map(([name]) => name);
    if (missingAws.length) findings.push(finding('P1 AWS Bridge Config', `AWS readiness flags are false or missing: ${missingAws.join(', ')}`, ['aws']));
    const changed = Object.entries(EXPECTED_GUARDRAILS).filter(([key, value]) => manifest.productionGuardrails?.[key] !== value).map(([key]) => key);
    if (changed.length) findings.push(finding('P0 Bridge Down', `production guardrails changed or missing: ${changed.join(', ')}`, ['incident-response']));
  }

  return { schema: 'skygrid.pnpk.preflight.v1', baseUrl, ready: findings.length === 0, results, findings };
}

module.exports = { BRIDGE_ROUTES, EXPECTED_GUARDRAILS, runPreflight };

if (require.main === module) {
  const baseUrl = process.env.SKYGRID_PREFLIGHT_BASE_URL || process.argv.slice(2).find((argument) => argument !== '--');
  if (!baseUrl) {
    console.error('Usage: pnpm skygrid:preflight -- <base-url>');
    process.exitCode = 2;
  } else {
    runPreflight({ baseUrl }).then((report) => {
      console.log(JSON.stringify(report, null, 2));
      if (!report.ready) process.exitCode = 1;
    });
  }
}
