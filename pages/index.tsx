import React from "react";

import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import HowToUseSection from "@/components/HowToUseSection";
import ExamplesSection from "@/components/ExamplesSection";
import CompatibilitySection from "@/components/CompatibilitySection";
import { GetStaticProps } from "next";
import WhySection from "@/components/WhySection";
import AboutSection from "@/components/AboutSection";
import { request } from "@octokit/request";

interface LandingPageProps {
  contributorsByRepo: Record<string, { avatars: string[]; total: number }>;
}

export default function LandingPage({ contributorsByRepo }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen items-stretch font-sans">
      <main>
        <Hero />
        <WhySection />
        <CompatibilitySection />
        <ExamplesSection contributorsByRepo={contributorsByRepo} />
        <HowToUseSection />
        <div className="flex-1 flex flex-col gap-4 mt-16">
          <AboutSection />
          <FAQSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Simple in-memory cache. In production this avoids refetching during
// the Node.js process lifetime, while in development it prevents hitting
// the GitHub rate-limit when you refresh the page a few times.
let cachedContributors:
  | {
      data: Record<string, { avatars: string[]; total: number }>;
      fetchedAt: number; // epoch millis
    }
  | undefined;

export const getStaticProps: GetStaticProps<LandingPageProps> = async () => {
  // List of repositories displayed in ExampleListSection. Keep in sync with
  // the REPOS constant in that component.
  const repositories: { owner: string; repo: string }[] = [
    { owner: "openai", repo: "codex" },
    { owner: "apache", repo: "airflow" },
    { owner: "temporalio", repo: "sdk-java" },
    { owner: "PlutoLang", repo: "Pluto" },
  ];

  // If we fetched within the last 12 hours, reuse the cached data.
  // This drastically cuts down on unauthenticated GitHub API requests
  // during local development (limit: 60 req / hr).
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
  const now = Date.now();

  if (
    cachedContributors &&
    now - cachedContributors.fetchedAt < TWELVE_HOURS_MS
  ) {
    return {
      props: {
        contributorsByRepo: cachedContributors.data,
      },
      // No need to revalidate until the cache window expires.
      // (Next.js will still obey the value, it just determines the earliest
      //  time a background revalidation *could* run.)
      revalidate: 60 * 60, // 1 hour
    };
  }

  const contributorsByRepo: Record<
    string,
    { avatars: string[]; total: number }
  > = {};

  // Build common headers for GitHub API requests. We add the Authorization
  // header only when an access token is present. Supplying an empty
  // `Authorization` header would prompt GitHub to treat the request as
  // unauthenticated, so we include it conditionally.
  const baseHeaders: Record<string, string> = {
    "User-Agent": "agents-md-site",
    Accept: "application/vnd.github+json",
  };

  if (process.env.GH_AUTH_TOKEN) {
    baseHeaders["Authorization"] = `Bearer ${process.env.GH_AUTH_TOKEN}`;
  }

  for (const { owner, repo } of repositories) {
    const repository = `${owner}/${repo}`;
    try {
      // Fetch top 3 contributor avatars
      const { data: avatarsData } = await request(
        "GET /repos/{owner}/{repo}/contributors",
        {
          owner,
          repo,
          per_page: 3,
          headers: baseHeaders,
        }
      );

      const avatars = avatarsData
        .slice(0, 3)
        .map((c) => c.avatar_url)
        .filter((url): url is string => url !== undefined);

      // Fetch contributor count (using per_page=1 to inspect Link header)
      let total = avatarsData.length; // fallback
      try {
        const countRes = await request(
          "GET /repos/{owner}/{repo}/contributors",
          {
            owner,
            repo,
            per_page: 1,
            anon: "1",
            headers: baseHeaders,
          }
        );

        const link = countRes.headers.link;
        if (link && /rel="last"/.test(link)) {
          const match = link.match(/&?page=(\d+)>; rel="last"/);
          if (match?.[1]) {
            total = parseInt(match[1], 10);
          }
        } else {
          total = countRes.data.length;
        }
      } catch {
        // ignore errors, keep fallback
        console.error(`Error fetching contributors for ${repository}`);
      }

      contributorsByRepo[repository] = {
        avatars,
        total,
      };
    } catch {
      console.error(`Error fetching contributors for ${repository}`);
      contributorsByRepo[repository] = { avatars: [], total: 0 };
    }
  }

  cachedContributors = {
    data: contributorsByRepo,
    fetchedAt: Date.now(),
  };

  return {
    props: {
      contributorsByRepo,
    },
    // Revalidate every 24 hours in production. The in-memory cache prevents
    // us from hitting the limit during development between dev server restarts.
    revalidate: 60 * 60 * 24,
  };
};
