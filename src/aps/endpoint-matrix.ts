export type EndpointMatrixRow = {
  endpoint: string;
  method: string;
  expectedStatus: number;
  cachePolicy: "immutable" | "short" | "swr" | "none";
  proofTag: string;
};

export type EndpointMatrixArtifact = {
  schemaVersion: "1.0";
  generatedBy: "skygrid-auto-drill";
  rows: EndpointMatrixRow[];
  summary: {
    totalEndpoints: number;
    byCachePolicy: Record<EndpointMatrixRow["cachePolicy"], number>;
  };
};

const CACHE_POLICIES: EndpointMatrixRow["cachePolicy"][] = ["immutable", "short", "swr", "none"];

function normalizeRow(row: EndpointMatrixRow): EndpointMatrixRow {
  return {
    endpoint: row.endpoint,
    method: row.method.toUpperCase(),
    expectedStatus: row.expectedStatus,
    cachePolicy: row.cachePolicy,
    proofTag: row.proofTag,
  };
}

export function buildEndpointMatrixArtifact(rows: EndpointMatrixRow[]): EndpointMatrixArtifact {
  const normalizedRows = rows.map(normalizeRow).sort((a, b) => {
    if (a.endpoint !== b.endpoint) return a.endpoint.localeCompare(b.endpoint);
    if (a.method !== b.method) return a.method.localeCompare(b.method);
    return a.proofTag.localeCompare(b.proofTag);
  });

  const byCachePolicy = Object.fromEntries(CACHE_POLICIES.map((key) => [key, 0])) as EndpointMatrixArtifact["summary"]["byCachePolicy"];
  for (const row of normalizedRows) {
    byCachePolicy[row.cachePolicy] += 1;
  }

  return {
    schemaVersion: "1.0",
    generatedBy: "skygrid-auto-drill",
    rows: normalizedRows,
    summary: {
      totalEndpoints: normalizedRows.length,
      byCachePolicy,
    },
  };
}
