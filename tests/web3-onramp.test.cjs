const assert = require('node:assert/strict');
const test = require('node:test');

const {
  BASE_MAINNET_CHAIN_ID,
  BASE_USDC_ADDRESS,
  TREASURY_WALLET,
  createOnRampQuote,
  createProofReceipt,
  healthPayload,
  validateTxHash,
} = require('../src/web3/onramp');
const chainsHealth = require('../api/web3/chains/health');
const onrampNew = require('../api/web3/onramp/new');
const onrampProof = require('../api/web3/onramp/proof');

function invoke(handler, { method = 'GET', body } = {}) {
  const headers = {};
  let statusCode = 0;
  let jsonPayload;
  const res = {
    setHeader(key, value) {
      headers[key.toLowerCase()] = value;
      return res;
    },
    status(code) {
      statusCode = code;
      return res;
    },
    json(payload) {
      jsonPayload = payload;
      return res;
    },
  };

  handler({ method, body }, res);
  return { statusCode, headers, json: jsonPayload };
}

function validQuoteRequest(overrides = {}) {
  return {
    pathway: 'node_hosting',
    asset: 'USDC',
    amount: '25.00',
    chainId: BASE_MAINNET_CHAIN_ID,
    consentConfirmed: true,
    ...overrides,
  };
}

function validProofRequest(quote, overrides = {}) {
  return {
    onRampId: quote.onRampId,
    paymentRef: quote.paymentRef,
    proofId: quote.proofId,
    txHash: `0x${'a'.repeat(64)}`,
    receiverWallet: TREASURY_WALLET,
    tokenAddress: BASE_USDC_ADDRESS,
    chainId: BASE_MAINNET_CHAIN_ID,
    amount: quote.amount,
    consentConfirmed: true,
    ...overrides,
  };
}

function assertNoSecretFields(payload) {
  const text = JSON.stringify(payload).toLowerCase();
  for (const blocked of ['privatekey', 'private_key', 'seedphrase', 'seed_phrase', 'mnemonic', 'server signing material']) {
    assert.equal(text.includes(blocked), false, `${blocked} should not be exposed`);
  }
}

test('on-ramp quote creates unique identifiers and Base USDC treasury contract', () => {
  const first = createOnRampQuote(validQuoteRequest(), { now: new Date('2026-06-01T12:00:00.000Z') });
  const second = createOnRampQuote(validQuoteRequest(), { now: new Date('2026-06-01T12:00:00.000Z') });

  assert.equal(first.ok, true);
  assert.equal(first.statusCode, 201);
  assert.match(first.onRampId, /^onramp_[0-9a-f-]{36}$/);
  assert.match(first.paymentRef, /^SG-20260601-[A-F0-9]{8}$/);
  assert.match(first.proofId, /^proof_[0-9a-f-]{36}$/);
  assert.notEqual(first.onRampId, second.onRampId);
  assert.notEqual(first.paymentRef, second.paymentRef);
  assert.notEqual(first.proofId, second.proofId);
  assert.equal(first.receiverWallet, TREASURY_WALLET);
  assert.equal(first.chainId, BASE_MAINNET_CHAIN_ID);
  assert.equal(first.chain.chainId, BASE_MAINNET_CHAIN_ID);
  assert.equal(first.token.address, BASE_USDC_ADDRESS);
  assert.equal(first.nonCustodial.serverSigning, false);
  assert.equal(first.nonCustodial.automaticTransfers, false);
  assertNoSecretFields(first);
});

test('quote rejects invalid chain, invalid amount, and missing consent', () => {
  assert.equal(createOnRampQuote(validQuoteRequest({ chainId: 1 })).error, 'unsupported_chain');
  assert.equal(createOnRampQuote(validQuoteRequest({ amount: '0' })).error, 'invalid_amount');
  assert.equal(createOnRampQuote(validQuoteRequest({ amount: '-25.00' })).error, 'invalid_amount');
  assert.equal(createOnRampQuote(validQuoteRequest({ consentConfirmed: false })).error, 'consent_required');
});

test('proof submission validates tx hash, receiver, token, chain, amount, and consent', () => {
  const quote = createOnRampQuote(validQuoteRequest());
  const proof = createProofReceipt(validProofRequest(quote));

  assert.equal(proof.ok, true);
  assert.equal(proof.statusCode, 202);
  assert.equal(proof.receiverWallet, TREASURY_WALLET);
  assert.equal(proof.chainId, BASE_MAINNET_CHAIN_ID);
  assert.equal(proof.token.address, BASE_USDC_ADDRESS);
  assert.equal(proof.status, 'submitted_for_review');
  assert.equal(validateTxHash(proof.txHash), true);
  assertNoSecretFields(proof);

  assert.equal(createProofReceipt(validProofRequest(quote, { txHash: 'bad' })).error, 'invalid_tx_hash');
  assert.equal(createProofReceipt(validProofRequest(quote, { receiverWallet: '0x0000000000000000000000000000000000000000' })).error, 'wrong_receiver');
  assert.equal(createProofReceipt(validProofRequest(quote, { tokenAddress: '0x0000000000000000000000000000000000000000' })).error, 'wrong_token');
  assert.equal(createProofReceipt(validProofRequest(quote, { chainId: 1 })).error, 'unsupported_chain');
  assert.equal(createProofReceipt(validProofRequest(quote, { amount: '0.00' })).error, 'invalid_amount');
  assert.equal(createProofReceipt(validProofRequest(quote, { consentConfirmed: false })).error, 'consent_required');
});

test('API handlers expose health, quote, and proof contracts', () => {
  const health = invoke(chainsHealth, { method: 'GET' });
  assert.equal(health.statusCode, 200);
  assert.equal(health.json.receiverWallet, TREASURY_WALLET);
  assert.equal(health.json.defaultChain.chainId, BASE_MAINNET_CHAIN_ID);
  assert.equal(health.json.defaultToken.address, BASE_USDC_ADDRESS);
  assertNoSecretFields(health.json);

  const quoteResponse = invoke(onrampNew, { method: 'POST', body: validQuoteRequest() });
  assert.equal(quoteResponse.statusCode, 201);
  assert.equal(quoteResponse.json.receiverWallet, TREASURY_WALLET);
  assert.match(quoteResponse.json.paymentRef, /^SG-\d{8}-[A-F0-9]{8}$/);

  const proofResponse = invoke(onrampProof, { method: 'POST', body: validProofRequest(quoteResponse.json) });
  assert.equal(proofResponse.statusCode, 202);
  assert.equal(proofResponse.json.status, 'submitted_for_review');
  assertNoSecretFields(proofResponse.json);
});

test('health payload is non-custodial and reference-only', () => {
  const payload = healthPayload(new Date('2026-06-01T00:00:00.000Z'));
  assert.equal(payload.mode, 'non_custodial_reference_only');
  assert.equal(payload.guardrails.custody, false);
  assert.equal(payload.guardrails.manualWalletApprovalRequired, true);
});
