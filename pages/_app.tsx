import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/next";
export default function App({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <title>AGENTS.md</title>
      <meta name="description" content="AGENTS.md is a simple, open format for guiding coding agents, used by over 60k open-source projects. Think of it as a README for agents." />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="AGENTS.md" />
      <meta name="twitter:description" content="AGENTS.md is a simple, open format for guiding coding agents. Think of it as a README for agents." />
      <meta name="twitter:image" content="https://agents.md/og.png" />
      <meta name="twitter:domain" content="agents.md" />
      <meta name="twitter:url" content="https://agents.md" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="AGENTS.md" />
      <meta property="og:description" content="AGENTS.md is a simple, open format for guiding coding agents. Think of it as a README for agents." />
      <meta property="og:image" content="https://agents.md/og.png" />
    </Head>
    <Component {...pageProps} />
    <Analytics />
  </>;
}
