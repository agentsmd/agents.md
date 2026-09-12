const assert = require("node:assert/strict");
const test = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (module, filename) => {
  const source = require("node:fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.Node10,
    },
  });
  module._compile(output.outputText, filename);
};

const { createPreflightRecord } = require("../src/aps/preflight-ledger.ts");

function makeTable({ duplicate = false } = {}) {
  return {
    calls: [],
    async putItem(item, conditionExpression) {
      this.calls.push({ item, conditionExpression });
      if (duplicate) {
        throw new Error("ConditionalCheckFailedException: duplicate key");
      }
    },
  };
}

test("creates one preflight record with defaults and step-functions friendly output", async () => {
  const table = makeTable();
  const now = new Date("2026-05-20T10:00:00.000Z");

  const result = await createPreflightRecord(
    {
      preflight_id: "pf_001",
      linear_issue: "MVP-50",
      github_repo: "aura-core",
      evidence_urls: ["https://example.com/proof"],
      human_approval_flags: ["ops_review_pending"],
      wallet_approval_flags: ["wallet_not_approved"],
    },
    table,
    now,
  );

  assert.equal(result.ok, true);
  assert.equal(result.status, "CREATED");
  assert.equal(result.stepFunctions.nextState, "PreflightIntakeRecorded");
  assert.equal(table.calls.length, 1);
  assert.equal(table.calls[0].conditionExpression, "attribute_not_exists(PreflightID)");
  assert.equal(table.calls[0].item.PreflightID, "pf_001");
  assert.equal(table.calls[0].item.RiskLevel, "Medium");
  assert.equal(table.calls[0].item.EmergencyLaneStatus, "Intake");
  assert.equal(table.calls[0].item.FinalReadinessState, "Not Started");
  assert.equal(table.calls[0].item.CreatedAt, "2026-05-20T10:00:00.000Z");
});

test("missing preflight_id returns clear validation error", async () => {
  const table = makeTable();
  const result = await createPreflightRecord({}, table);

  assert.equal(result.ok, false);
  assert.equal(result.status, "ERROR");
  assert.equal(result.error.code, "validation_error");
  assert.match(result.error.message, /preflight_id/);
  assert.equal(table.calls.length, 0);
});

test("duplicate PreflightID is blocked and not silently overwritten", async () => {
  const table = makeTable({ duplicate: true });
  const result = await createPreflightRecord({ preflight_id: "pf_dup" }, table);

  assert.equal(result.ok, false);
  assert.equal(result.status, "DUPLICATE");
  assert.equal(result.error.code, "duplicate_preflight_id");
  assert.equal(result.stepFunctions.nextState, "PreflightDuplicate");
});
