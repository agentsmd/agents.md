const assert = require('node:assert/strict');
const { healthPayload, BASE_MAINNET_CHAIN_ID, BASE_USDC_ADDRESS, TREASURY_WALLET } = require('../src/web3/onramp');

const payload = healthPayload();
assert.equal(payload.ok, true);
assert.equal(payload.receiverWallet, TREASURY_WALLET);
assert.equal(payload.defaultChain.chainId, BASE_MAINNET_CHAIN_ID);
assert.equal(payload.defaultToken.address, BASE_USDC_ADDRESS);
assert.equal(payload.guardrails.serverSigning, false);
assert.equal(payload.guardrails.automaticTransfers, false);
console.log(JSON.stringify({ ok: true, service: payload.service, chainId: payload.defaultChain.chainId }, null, 2));
