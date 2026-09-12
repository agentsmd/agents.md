const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, rmSync } = require('node:fs');
const { execSync } = require('node:child_process');

const { buildEndpointMatrixArtifact } = require('../src/aps/endpoint-matrix.ts');

test('buildEndpointMatrixArtifact creates stable sorted output', () => {
  const artifact = buildEndpointMatrixArtifact([
    { endpoint: '/b', method: 'get', expectedStatus: 200, cachePolicy: 'swr', proofTag: 'z' },
    { endpoint: '/a', method: 'post', expectedStatus: 201, cachePolicy: 'none', proofTag: 'a' },
  ]);

  assert.deepEqual(artifact.rows.map((r) => `${r.endpoint}:${r.method}`), ['/a:POST', '/b:GET']);
  assert.equal(artifact.summary.totalEndpoints, 2);
  assert.equal(artifact.summary.byCachePolicy.none, 1);
});

test('endpoint matrix script generates json artifact', () => {
  rmSync('artifacts/endpoint-matrix.json', { force: true });
  execSync('pnpm endpoint:matrix', { stdio: 'pipe' });
  const artifact = JSON.parse(readFileSync('artifacts/endpoint-matrix.json', 'utf8'));
  assert.equal(artifact.schemaVersion, '1.0');
  assert.equal(artifact.generatedBy, 'skygrid-auto-drill');
  assert.ok(Array.isArray(artifact.rows));
});
