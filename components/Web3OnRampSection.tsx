import React, { useMemo, useState } from "react";

import Section from "@/components/Section";

type QuoteResponse = {
  ok: boolean;
  onRampId?: string;
  paymentRef?: string;
  proofId?: string;
  amount?: string;
  receiverWallet?: string;
  chainId?: number;
  chain?: { name: string; blockExplorer: string };
  token?: { symbol: string; address: string; decimals: number };
  status?: string;
  error?: string;
  instructions?: string[];
};

type ProofResponse = {
  ok: boolean;
  status?: string;
  proofId?: string;
  txHash?: string;
  explorerUrl?: string;
  error?: string;
};

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const TREASURY_WALLET = "0xbAA5A03bC268546194550a427d3F1d5787c15403";
const BASE_USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const BASE_CHAIN_ID = 8453;

export default function Web3OnRampSection() {
  const [pathway, setPathway] = useState("node_hosting");
  const [amount, setAmount] = useState("25.00");
  const [walletAddress, setWalletAddress] = useState("");
  const [txHash, setTxHash] = useState("");
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [proof, setProof] = useState<ProofResponse | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmitProof = useMemo(
    () => Boolean(quote?.ok && quote.onRampId && quote.paymentRef && quote.proofId && txHash),
    [quote, txHash],
  );

  async function requestQuote() {
    setLoading(true);
    setMessage("");
    setProof(null);

    const response = await fetch("/api/web3/onramp/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathway,
        asset: "USDC",
        amount,
        chainId: BASE_CHAIN_ID,
        consentConfirmed: true,
      }),
    });
    const payload = (await response.json()) as QuoteResponse;
    setQuote(payload);
    setMessage(payload.ok ? "Payment reference generated. Review details before manual wallet approval." : `Quote rejected: ${payload.error}`);
    setLoading(false);
  }

  async function connectWallet() {
    setMessage("");

    if (!window.ethereum) {
      setMessage("No browser wallet detected. You can still generate a reference and submit a transaction hash manually.");
      return;
    }

    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    if (Array.isArray(accounts) && typeof accounts[0] === "string") {
      setWalletAddress(accounts[0]);
      setMessage("Wallet connected for manual approval only. SkyGrid will not request private keys or server-side signing.");
    }
  }

  async function submitProof() {
    if (!quote?.ok || !quote.onRampId || !quote.paymentRef || !quote.proofId) {
      setMessage("Generate a payment reference before submitting proof.");
      return;
    }

    setLoading(true);
    setMessage("");

    const response = await fetch("/api/web3/onramp/proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        onRampId: quote.onRampId,
        paymentRef: quote.paymentRef,
        proofId: quote.proofId,
        txHash,
        receiverWallet: TREASURY_WALLET,
        tokenAddress: BASE_USDC_ADDRESS,
        chainId: BASE_CHAIN_ID,
        amount,
        consentConfirmed: true,
      }),
    });
    const payload = (await response.json()) as ProofResponse;
    setProof(payload);
    setMessage(payload.ok ? "Proof submitted for operator review." : `Proof rejected: ${payload.error}`);
    setLoading(false);
  }

  return (
    <Section id="web3-onramp" title="SkyGrid Web3 On-Ramp Reference" className="py-16 border-t border-gray-100 dark:border-gray-800">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Non-custodial</p>
          <p className="mt-3 text-gray-700 dark:text-gray-300">
            Generate a unique on-ramp reference for Base USDC. SkyGrid routes the reference to the configured treasury wallet and never asks for private keys, seed phrases, custody, server-side signing, or automatic transfers.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Pathway
              <select
                value={pathway}
                onChange={(event) => setPathway(event.target.value)}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="node_hosting">Node hosting</option>
                <option value="pilot_access">Pilot access</option>
                <option value="validation_credit">Validation credit</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Amount in Base USDC
              <input
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                placeholder="25.00"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={requestQuote}
                disabled={loading}
                className="rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-80 disabled:opacity-50 dark:bg-white dark:text-black"
              >
                Generate reference
              </button>
              <button
                type="button"
                onClick={connectWallet}
                className="rounded-full border border-gray-300 px-5 py-3 text-sm font-medium hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900"
              >
                Connect wallet
              </button>
            </div>
          </div>

          {walletAddress ? (
            <p className="mt-4 rounded-2xl bg-gray-50 p-3 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Connected wallet: <code>{walletAddress}</code>
            </p>
          ) : null}
        </div>

        <div className="rounded-3xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-900/60">
          <h3 className="text-xl font-semibold">Manual approval details</h3>
          {quote?.ok ? (
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-semibold">On-ramp ID</dt>
                <dd><code>{quote.onRampId}</code></dd>
              </div>
              <div>
                <dt className="font-semibold">Payment reference</dt>
                <dd><code>{quote.paymentRef}</code></dd>
              </div>
              <div>
                <dt className="font-semibold">Proof ID</dt>
                <dd><code>{quote.proofId}</code></dd>
              </div>
              <div>
                <dt className="font-semibold">Receiver wallet</dt>
                <dd><code>{quote.receiverWallet}</code></dd>
              </div>
              <div>
                <dt className="font-semibold">Chain / token</dt>
                <dd>Base Mainnet ({quote.chainId}) / {quote.token?.symbol} <code>{quote.token?.address}</code></dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Generate a reference to display treasury wallet, Base chain, token, and proof metadata.</p>
          )}

          <label className="mt-6 grid gap-2 text-sm font-medium">
            Submit transaction hash after manual approval
            <input
              value={txHash}
              onChange={(event) => setTxHash(event.target.value)}
              className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100"
              placeholder="0x..."
            />
          </label>
          <button
            type="button"
            onClick={submitProof}
            disabled={loading || !canSubmitProof}
            className="mt-3 rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-80 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            Submit proof
          </button>

          {proof?.ok ? (
            <p className="mt-4 rounded-2xl bg-white p-3 text-sm dark:bg-gray-950">
              Proof <code>{proof.proofId}</code> is <strong>{proof.status}</strong>. {proof.explorerUrl ? <a className="underline" href={proof.explorerUrl} target="_blank" rel="noreferrer">View on BaseScan</a> : null}
            </p>
          ) : null}

          {message ? <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">{message}</p> : null}
        </div>
      </div>
    </Section>
  );
}
