const assert = require("node:assert/strict");
const test = require("node:test");
const { generateKeyPairSync } = require("node:crypto");
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

const { passportClaims } = require("../src/aps/agent-passport.ts");
const { verifyActionReceipt } = require("../src/aps/action-receipt.ts");
const { DelegationSpendLedger, processAgentPaymentAfterAPS, runAPSPreflight } = require("../src/aps/preflight.ts");
const { signPayload } = require("../src/aps/crypto.ts");
const { delegationClaims } = require("../src/aps/delegation.ts");

function ed25519Pair() {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    publicKeyPem: publicKey.export({ type: "spki", format: "pem" }),
    privateKeyPem: privateKey.export({ type: "pkcs8", format: "pem" }),
  };
}

function fixture(overrides = {}) {
  const issuer = ed25519Pair();
  const agent = ed25519Pair();
  const principal = ed25519Pair();
  const receipt = ed25519Pair();
  const now = new Date("2026-05-07T12:00:00.000Z");

  const passport = {
    id: "passport_agent_001",
    agentId: "agent_001",
    agentPublicKeyPem: agent.publicKeyPem,
    issuer: "aps-passport-authority",
    issuedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2026-12-31T23:59:59.000Z",
  };
  passport.signature = signPayload(passportClaims(passport), issuer.privateKeyPem);

  const delegation = {
    id: "delegation_test_budget_001",
    humanPrincipalId: "human_principal_001",
    agentPassportId: passport.id,
    issuedAt: "2026-01-01T00:00:00.000Z",
    expiresAt: "2026-12-31T23:59:59.000Z",
    scope: {
      actions: ["commerce.payment"],
      maxSpendMinor: 10_000,
      currency: "USD",
      merchantCategories: ["software"],
    },
  };
  delegation.signature = signPayload(delegationClaims(delegation), principal.privateKeyPem);

  const ledger = new DelegationSpendLedger();
  const config = {
    passportRegistry: {
      issuerPublicKeys: {
        "aps-passport-authority": issuer.publicKeyPem,
      },
    },
    delegationRegistry: {
      principalPublicKeys: {
        human_principal_001: principal.publicKeyPem,
      },
    },
    merchantPolicy: {
      merchants: {
        merchant_cloud_tools: {
          id: "merchant_cloud_tools",
          name: "Cloud Tools Inc.",
          category: "software",
          allowed: true,
          riskLevel: "low",
        },
        merchant_denied_exchange: {
          id: "merchant_denied_exchange",
          name: "Denied Exchange",
          category: "crypto",
          allowed: false,
          riskLevel: "high",
        },
      },
    },
    receiptSigner: {
      keyId: "aps-receipt-signer-test",
      privateKey: receipt.privateKeyPem,
    },
    ledger,
    now,
  };

  return {
    ...overrides,
    issuer,
    agent,
    principal,
    receipt,
    passport: overrides.passport ?? passport,
    delegation: overrides.delegation ?? delegation,
    config: overrides.config ?? config,
    payment: overrides.payment ?? {
      action: "commerce.payment",
      amountMinor: 2_500,
      currency: "USD",
      merchantId: "merchant_cloud_tools",
    },
  };
}

async function preflightWithFixture(fx) {
  return runAPSPreflight(
    {
      passport: fx.passport,
      delegationChain: [fx.delegation],
      payment: fx.payment,
    },
    fx.config,
  );
}

function assertSignedReceipt(result, receiptPublicKey, keyId) {
  assert.equal(typeof result.receipt.signature, "string");
  assert.equal(verifyActionReceipt(result.receipt, receiptPublicKey, keyId), true);
}

test("APS allows an all-pass payment, signs receipt, tracks spend, then invokes processor", async () => {
  const fx = fixture();
  const result = await preflightWithFixture(fx);

  assert.equal(result.decision, "ALLOW");
  assert.equal(result.approved, true);
  assert.deepEqual(result.gateResults.map((gate) => [gate.gate, gate.passed]), [
    ["passport", true],
    ["scope", true],
    ["budget", true],
    ["merchant", true],
  ]);
  assert.equal(fx.config.ledger.getApprovedSpendMinor(fx.delegation.id), 2_500);
  assert.equal(fx.config.ledger.getAttempts().length, 1);
  assertSignedReceipt(result, fx.receipt.publicKeyPem, fx.config.receiptSigner.keyId);

  let processorCalls = 0;
  const processed = await processAgentPaymentAfterAPS({
    preflight: result,
    payment: fx.payment,
    receiptSigner: fx.config.receiptSigner,
    processor: async (_request, preflight) => {
      processorCalls += 1;
      assert.equal(preflight.approved, true);
      return { id: "pi_test_001" };
    },
  });

  assert.equal(processorCalls, 1);
  assert.equal(processed.receipt.processorPaymentId, "pi_test_001");
  assertSignedReceipt(processed, fx.receipt.publicKeyPem, fx.config.receiptSigner.keyId);
});

test("APS blocks expired passports and still emits a signed receipt", async () => {
  const fx = fixture();
  fx.passport.expiresAt = "2026-01-01T00:00:00.000Z";
  fx.passport.signature = signPayload(passportClaims(fx.passport), fx.issuer.privateKeyPem);

  const result = await preflightWithFixture(fx);

  assert.equal(result.decision, "BLOCK");
  assert.equal(result.gateResults[0].gate, "passport");
  assert.equal(result.gateResults[0].reason, "passport_expired");
  assert.equal(fx.config.ledger.getAttempts()[0].decision, "BLOCK");
  assertSignedReceipt(result, fx.receipt.publicKeyPem, fx.config.receiptSigner.keyId);
});

test("APS blocks delegations without payment scope", async () => {
  const fx = fixture();
  fx.delegation.scope.actions = ["commerce.quote"];
  fx.delegation.signature = signPayload(delegationClaims(fx.delegation), fx.principal.privateKeyPem);

  const result = await preflightWithFixture(fx);

  assert.equal(result.decision, "BLOCK");
  assert.deepEqual(result.gateResults.map((gate) => gate.gate), ["passport", "scope"]);
  assert.equal(result.gateResults.at(-1).reason, "delegation_action_not_allowed");
  assertSignedReceipt(result, fx.receipt.publicKeyPem, fx.config.receiptSigner.keyId);
});

test("APS blocks payments that exceed remaining delegation budget", async () => {
  const fx = fixture();
  fx.config.ledger.recordApprovedSpend(fx.delegation.id, 9_000);

  const result = await preflightWithFixture(fx);

  assert.equal(result.decision, "BLOCK");
  assert.equal(result.gateResults.at(-1).gate, "budget");
  assert.equal(result.gateResults.at(-1).reason, "budget_exceeded");
  assert.equal(fx.config.ledger.getAttempts()[0].decision, "BLOCK");
  assertSignedReceipt(result, fx.receipt.publicKeyPem, fx.config.receiptSigner.keyId);
});

test("APS blocks merchants outside the allowlist", async () => {
  const fx = fixture({
    payment: {
      action: "commerce.payment",
      amountMinor: 2_500,
      currency: "USD",
      merchantId: "merchant_unknown",
    },
  });

  const result = await preflightWithFixture(fx);

  assert.equal(result.decision, "BLOCK");
  assert.equal(result.gateResults.at(-1).gate, "merchant");
  assert.equal(result.gateResults.at(-1).reason, "merchant_unknown");
  assertSignedReceipt(result, fx.receipt.publicKeyPem, fx.config.receiptSigner.keyId);
});

test("payment processor is not called for blocked preflight results", async () => {
  const fx = fixture({
    payment: {
      action: "commerce.payment",
      amountMinor: 2_500,
      currency: "USD",
      merchantId: "merchant_denied_exchange",
    },
  });
  const result = await preflightWithFixture(fx);
  let processorCalls = 0;

  const processed = await processAgentPaymentAfterAPS({
    preflight: result,
    payment: fx.payment,
    receiptSigner: fx.config.receiptSigner,
    processor: async () => {
      processorCalls += 1;
      return { id: "pi_should_not_exist" };
    },
  });

  assert.equal(processorCalls, 0);
  assert.equal(processed.decision, "BLOCK");
  assert.equal(processed.receipt.processorPaymentId, undefined);
  assertSignedReceipt(processed, fx.receipt.publicKeyPem, fx.config.receiptSigner.keyId);
});
