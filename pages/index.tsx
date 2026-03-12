// File: /pages/index.tsx

import React from "react";
import type { GetStaticProps } from "next";

import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import HowToUseSection from "@/components/HowToUseSection";
import ExamplesSection from "@/components/ExamplesSection";
import CompatibilitySection from "@/components/CompatibilitySection";
import WhySection from "@/components/WhySection";
import AboutSection from "@/components/AboutSection";

interface LandingPageProps {
  contributorsByRepo: Record<string, { avatars: string[]; total: number }>;
}

export default function LandingPage({ contributorsByRepo }: LandingPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-stretch font-sans">
      <main>
        <Hero />
        <WhySection />
        <CompatibilitySection />
        <ExamplesSection contributorsByRepo={contributorsByRepo} />
        <HowToUseSection />

        <div className="mt-16 flex flex-1 flex-col gap-4">
          <AboutSection />
          <FAQSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Simple in-memory cache.
// - In production: reduces refetching during the Node.js process lifetime.
// - In dev: prevents hitting GitHub rate limits when refreshing repeatedly.
let cachedContributors:
  | {
      data: Record<string, { avatars: string[]; total: number }>;
      fetchedAt: number; // epoch millis
    }
  | undefined;

type GitHubContributor = {
  avatar_url: string;
};

export const getStaticProps: GetStaticProps<LandingPageProps> = async () => {
  // Repositories displayed in ExampleListSection. Keep in sync with the REPOS constant there.
  const repoNames = ["openai/codex", "apache/airflow", "temporalio/sdk-java", "PlutoLang/Pluto"];

  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  const now = Date.now();

  if (cachedContributors && now - cachedContributors.fetchedAt < TWELVE_HOURS_MS) {
    return {
      props: { contributorsByRepo: cachedContributors.data },
      revalidate: 60 * 60, // 1 hour
    };
  }

  const contributorsByRepo: Record<string, { avatars: string[]; total: number }> = {};

  const baseHeaders: Record<string, string> = {
    "User-Agent": "agents-md-site",
    Accept: "application/vnd.github+json",
  };

  if (process.env.GH_AUTH_TOKEN) {
    baseHeaders.Authorization = `Bearer ${process.env.GH_AUTH_TOKEN}`;
  }

  for (const fullName of repoNames) {
    try {
      // Fetch top 3 contributor avatars
      const avatarsRes = await fetch(
        `https://api.github.com/repos/${fullName}/contributors?per_page=3`,
        { headers: baseHeaders }
      );

      const avatarsData: GitHubContributor[] = avatarsRes.ok
        ? ((await avatarsRes.json()) as GitHubContributor[])
        : [];

      const avatars = avatarsData.slice(0, 3).map((c) => c.avatar_url);

      // Fetch contributor count (per_page=1 then inspect Link header for "last")
      let total = avatarsData.length; // fallback

      try {
        const countRes = await fetch(
          `https://api.github.com/repos/${fullName}/contributors?per_page=1&anon=1`,
          { headers: baseHeaders }
        );

        const link = countRes.headers.get("link");

        if (link && /rel="last"/.test(link)) {
          const match = link.match(/&?page=(\d+)>; rel="last"/);
          if (match?.[1]) total = parseInt(match[1], 10);
        } else {
          // No pagination header → either 0 or 1 page. We only need length.
          const oneData = countRes.ok ? ((await countRes.json()) as unknown[]) : [];
          total = oneData.length;
        }
      } catch (err) {
        console.error(`Error fetching contributors count for ${fullName}`, err);
      }

      contributorsByRepo[fullName] = { avatars, total };
    } catch (err) {
      console.error(`Error fetching contributors for ${fullName}`, err);
      contributorsByRepo[fullName] = { avatars: [], total: 0 };
    }
  }

  cachedContributors = {
    data: contributorsByRepo,
    fetchedAt: Date.now(),
  };

  return {
    props: { contributorsByRepo },
    revalidate: 60 * 60 * 24, // 24 hours
  };
};
