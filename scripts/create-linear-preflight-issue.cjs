#!/usr/bin/env node

const fs = require('node:fs');

async function main() {
  const [reportPath = 'artifacts/skygrid-pnpk-preflight.json'] = process.argv.slice(2);
  const apiKey = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;
  if (!apiKey || !teamId) throw new Error('LINEAR_API_KEY and LINEAR_TEAM_ID are required');
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  if (report.ready) return;

  const desiredLabels = [...new Set(report.findings.flatMap((item) => item.labels))];
  const request = async (query, variables) => {
    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: { authorization: apiKey, 'content-type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const payload = await response.json();
    if (!response.ok || payload.errors) throw new Error(`Linear request failed: ${JSON.stringify(payload.errors || payload)}`);
    return payload.data;
  };
  const labels = await request('query Labels($team: ID!) { issueLabels(filter: { team: { id: { eq: $team } } }) { nodes { id name } } }', { team: teamId });
  const labelIds = labels.issueLabels.nodes.filter(({ name }) => desiredLabels.includes(name)).map(({ id }) => id);
  const description = [
    `Automated PNPK preflight failed for ${report.baseUrl}.`,
    '',
    ...report.findings.map((item) => `- **${item.lane}**: ${item.summary}`),
    '',
    'Controlled-pilot checks only; this report does not authorize routing, payment, device activation, or private-data movement.',
  ].join('\n');
  await request('mutation Create($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { identifier url } } }', {
    input: { teamId, title: `[PNPK] SKYGRID bridge preflight failed (${report.findings[0].lane})`, description, labelIds },
  });
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
