const { randomBytes, randomUUID } = require('node:crypto');

const TREASURY_WALLET = '0xbAA5A03bC268546194550a427d3F1d5787c15403';
const BASE_MAINNET_CHAIN_ID = 8453;
const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

const SUPPORTED_PATHWAYS = new Set([
  'node_hosting',
  'pilot_access',
  'validation_credit',
]);

const SUPPORTED_ASSETS = new Set(['USDC']);

const BASE_MAINNET = Object.freeze({
  chainId: BASE_MAINNET_CHAIN_ID,
  name: 'Base Mainnet',
  network: 'base',
  rpcReference: 'https://mainnet.base.org',
  blockExplorer: 'https://basescan.org',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
});

const BASE_USDC = Object.freeze({
  symbol: 'USDC',
  name: 'USD Coin',
  address: BASE_USDC_ADDRESS,
  decimals: 6,
  standard: 'ERC-20',
});

const NON_CUSTODIAL_GUARDRAILS = Object.freeze({
  keyCollection: false,
  recoveryPhraseCollection: false,
  serverSigning: false,
  automaticTransfers: false,
  custody: false,
  manualWalletApprovalRequired: true,
});

function todayStamp(date = new Date()) {
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function randomToken(bytes = 5) {
  return randomBytes(bytes).toString('hex').toUpperCase();
}

function makePaymentRef(date = new Date()) {
  return `SG-${todayStamp(date)}-${randomToken(4)}`;
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeAddress(value) {
  return normalizeString(value).toLowerCase();
}

function parseAmount(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    return value.toFixed(2);
  }

  const text = normalizeString(value);
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;

  const amount = Number(text);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return amount.toFixed(2);
}

function assertNoSecretMaterial(payload) {
  const blockedKeys = new Set([
    'privatekey',
    'private_key',
    'seedphrase',
    'seed_phrase',
    'mnemonic',
    'secret',
    'serverprivatesigningkey',
  ]);

  for (const key of Object.keys(payload || {})) {
    const normalized = key.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    if (blockedKeys.has(normalized)) {
      return { ok: false, error: 'secret_material_not_accepted' };
    }
  }

  return { ok: true };
}

function validateQuoteRequest(input) {
  const secretCheck = assertNoSecretMaterial(input);
  if (!secretCheck.ok) return secretCheck;

  if (input?.consentConfirmed !== true) {
    return { ok: false, error: 'consent_required' };
  }

  const pathway = normalizeString(input?.pathway);
  if (!SUPPORTED_PATHWAYS.has(pathway)) {
    return { ok: false, error: 'unsupported_pathway', supportedPathways: [...SUPPORTED_PATHWAYS] };
  }

  const asset = normalizeString(input?.asset).toUpperCase();
  if (!SUPPORTED_ASSETS.has(asset)) {
    return { ok: false, error: 'unsupported_asset', supportedAssets: [...SUPPORTED_ASSETS] };
  }

  const chainId = Number(input?.chainId);
  if (chainId !== BASE_MAINNET_CHAIN_ID) {
    return { ok: false, error: 'unsupported_chain', expectedChainId: BASE_MAINNET_CHAIN_ID };
  }

  const amount = parseAmount(input?.amount);
  if (!amount) {
    return { ok: false, error: 'invalid_amount', message: 'Amount must be greater than zero with up to two decimals.' };
  }

  return { ok: true, pathway, asset, chainId, amount };
}

function createOnRampQuote(input, options = {}) {
  const validation = validateQuoteRequest(input);
  if (!validation.ok) {
    return { ok: false, statusCode: 400, ...validation };
  }

  const createdAt = options.now || new Date();
  const onRampId = `onramp_${randomUUID()}`;
  const proofId = `proof_${randomUUID()}`;

  return {
    ok: true,
    statusCode: 201,
    onRampId,
    paymentRef: makePaymentRef(createdAt),
    proofId,
    pathway: validation.pathway,
    asset: validation.asset,
    amount: validation.amount,
    receiverWallet: TREASURY_WALLET,
    chainId: BASE_MAINNET_CHAIN_ID,
    chain: BASE_MAINNET,
    token: BASE_USDC,
    status: 'awaiting_manual_wallet_approval',
    createdAt: createdAt.toISOString(),
    instructions: [
      'Connect a wallet that you control.',
      'Switch to Base Mainnet before sending funds.',
      'Manually review and approve a USDC transfer to the treasury wallet.',
      'Submit the transaction hash for proof review after the transfer is broadcast.',
    ],
    airtable: {
      adapterPrepared: true,
      persistence: 'pending_operator_configuration',
      requiredEnv: ['AIRTABLE_BASE_ID', 'AIRTABLE_ONRAMP_TABLE_ID', 'AIRTABLE_API_KEY'],
    },
    nonCustodial: NON_CUSTODIAL_GUARDRAILS,
  };
}

function validateTxHash(txHash) {
  return /^0x[a-fA-F0-9]{64}$/.test(normalizeString(txHash));
}

function validateProofSubmission(input) {
  const secretCheck = assertNoSecretMaterial(input);
  if (!secretCheck.ok) return secretCheck;

  if (input?.consentConfirmed !== true) {
    return { ok: false, error: 'consent_required' };
  }

  if (!normalizeString(input?.onRampId).startsWith('onramp_')) {
    return { ok: false, error: 'invalid_onramp_id' };
  }

  if (!/^SG-\d{8}-[A-F0-9]{8}$/.test(normalizeString(input?.paymentRef))) {
    return { ok: false, error: 'invalid_payment_ref' };
  }

  if (!normalizeString(input?.proofId).startsWith('proof_')) {
    return { ok: false, error: 'invalid_proof_id' };
  }

  if (!validateTxHash(input?.txHash)) {
    return { ok: false, error: 'invalid_tx_hash' };
  }

  if (Number(input?.chainId) !== BASE_MAINNET_CHAIN_ID) {
    return { ok: false, error: 'unsupported_chain', expectedChainId: BASE_MAINNET_CHAIN_ID };
  }

  if (normalizeAddress(input?.receiverWallet) !== normalizeAddress(TREASURY_WALLET)) {
    return { ok: false, error: 'wrong_receiver', expectedReceiverWallet: TREASURY_WALLET };
  }

  if (normalizeAddress(input?.tokenAddress) !== normalizeAddress(BASE_USDC_ADDRESS)) {
    return { ok: false, error: 'wrong_token', expectedTokenAddress: BASE_USDC_ADDRESS };
  }

  const amount = parseAmount(input?.amount);
  if (!amount) {
    return { ok: false, error: 'invalid_amount' };
  }

  return { ok: true, amount };
}

function createProofReceipt(input, options = {}) {
  const validation = validateProofSubmission(input);
  if (!validation.ok) {
    return { ok: false, statusCode: 400, ...validation };
  }

  const submittedAt = options.now || new Date();

  return {
    ok: true,
    statusCode: 202,
    onRampId: normalizeString(input.onRampId),
    paymentRef: normalizeString(input.paymentRef),
    proofId: normalizeString(input.proofId),
    txHash: normalizeString(input.txHash),
    receiverWallet: TREASURY_WALLET,
    chainId: BASE_MAINNET_CHAIN_ID,
    token: BASE_USDC,
    amount: validation.amount,
    status: 'submitted_for_review',
    submittedAt: submittedAt.toISOString(),
    explorerUrl: `${BASE_MAINNET.blockExplorer}/tx/${normalizeString(input.txHash)}`,
    nonCustodial: NON_CUSTODIAL_GUARDRAILS,
  };
}

function healthPayload(now = new Date()) {
  return {
    ok: true,
    service: 'skygrid-web3-onramp-reference-generator',
    mode: 'non_custodial_reference_only',
    defaultChain: BASE_MAINNET,
    defaultToken: BASE_USDC,
    receiverWallet: TREASURY_WALLET,
    supportedPathways: [...SUPPORTED_PATHWAYS],
    guardrails: NON_CUSTODIAL_GUARDRAILS,
    checkedAt: now.toISOString(),
  };
}

module.exports = {
  TREASURY_WALLET,
  BASE_MAINNET_CHAIN_ID,
  BASE_USDC_ADDRESS,
  BASE_MAINNET,
  BASE_USDC,
  NON_CUSTODIAL_GUARDRAILS,
  createOnRampQuote,
  createProofReceipt,
  healthPayload,
  makePaymentRef,
  validateProofSubmission,
  validateQuoteRequest,
  validateTxHash,
};
