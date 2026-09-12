export type ResourceIntent =
  | 'provide_compute'
  | 'request_compute'
  | 'provide_storage'
  | 'request_storage'
  | 'provide_network'
  | 'request_network'
  | 'provide_failover'
  | 'request_failover'
  | 'find_platform_resource'
  | 'onboard_node'
  | 'validate_proof';

export type CandidateLane =
  | 'base' | 'usdc' | 'x402' | 'allbridge' | 'helium' | 'ton' | 'cloudflare' | 'blockscout'
  | 'local_wifi' | 'lora' | 'azure' | 'railway' | 'vercel' | 'aws_lambda' | 'aws_dynamodb'
  | 'aws_s3' | 'community_compute' | 'device_compute' | 'solar_backup';

type ScoreAxis = 'latency' | 'uptime' | 'proofReadiness' | 'integrationReadiness' | 'resourceFit' | 'risk';

type LaneProfile = Record<ScoreAxis, number>;

const LANE_PROFILES: Record<CandidateLane, LaneProfile> = {
  base: { latency: 83, uptime: 86, proofReadiness: 85, integrationReadiness: 82, resourceFit: 72, risk: 62 },
  usdc: { latency: 78, uptime: 87, proofReadiness: 84, integrationReadiness: 80, resourceFit: 70, risk: 58 },
  x402: { latency: 65, uptime: 70, proofReadiness: 55, integrationReadiness: 50, resourceFit: 55, risk: 42 },
  allbridge: { latency: 58, uptime: 66, proofReadiness: 52, integrationReadiness: 48, resourceFit: 50, risk: 38 },
  helium: { latency: 68, uptime: 72, proofReadiness: 69, integrationReadiness: 64, resourceFit: 66, risk: 54 },
  ton: { latency: 72, uptime: 76, proofReadiness: 71, integrationReadiness: 68, resourceFit: 64, risk: 52 },
  cloudflare: { latency: 96, uptime: 95, proofReadiness: 90, integrationReadiness: 93, resourceFit: 84, risk: 80 },
  blockscout: { latency: 69, uptime: 74, proofReadiness: 88, integrationReadiness: 66, resourceFit: 60, risk: 55 },
  local_wifi: { latency: 91, uptime: 62, proofReadiness: 57, integrationReadiness: 60, resourceFit: 76, risk: 46 },
  lora: { latency: 48, uptime: 59, proofReadiness: 62, integrationReadiness: 58, resourceFit: 70, risk: 51 },
  azure: { latency: 86, uptime: 92, proofReadiness: 87, integrationReadiness: 88, resourceFit: 82, risk: 78 },
  railway: { latency: 81, uptime: 84, proofReadiness: 79, integrationReadiness: 85, resourceFit: 78, risk: 72 },
  vercel: { latency: 89, uptime: 90, proofReadiness: 86, integrationReadiness: 91, resourceFit: 80, risk: 76 },
  aws_lambda: { latency: 88, uptime: 93, proofReadiness: 89, integrationReadiness: 90, resourceFit: 85, risk: 79 },
  aws_dynamodb: { latency: 84, uptime: 94, proofReadiness: 88, integrationReadiness: 87, resourceFit: 83, risk: 77 },
  aws_s3: { latency: 83, uptime: 95, proofReadiness: 91, integrationReadiness: 88, resourceFit: 84, risk: 80 },
  community_compute: { latency: 71, uptime: 68, proofReadiness: 65, integrationReadiness: 60, resourceFit: 86, risk: 49 },
  device_compute: { latency: 87, uptime: 61, proofReadiness: 60, integrationReadiness: 63, resourceFit: 92, risk: 45 },
  solar_backup: { latency: 52, uptime: 57, proofReadiness: 73, integrationReadiness: 56, resourceFit: 81, risk: 53 },
};

const INTENT_WEIGHTS: Record<ResourceIntent, Record<ScoreAxis, number>> = {
  provide_compute: { latency: 0.18, uptime: 0.18, proofReadiness: 0.14, integrationReadiness: 0.14, resourceFit: 0.26, risk: 0.10 },
  request_compute: { latency: 0.24, uptime: 0.20, proofReadiness: 0.14, integrationReadiness: 0.16, resourceFit: 0.18, risk: 0.08 },
  provide_storage: { latency: 0.12, uptime: 0.24, proofReadiness: 0.16, integrationReadiness: 0.16, resourceFit: 0.22, risk: 0.10 },
  request_storage: { latency: 0.16, uptime: 0.24, proofReadiness: 0.16, integrationReadiness: 0.18, resourceFit: 0.18, risk: 0.08 },
  provide_network: { latency: 0.24, uptime: 0.20, proofReadiness: 0.14, integrationReadiness: 0.16, resourceFit: 0.16, risk: 0.10 },
  request_network: { latency: 0.26, uptime: 0.20, proofReadiness: 0.16, integrationReadiness: 0.16, resourceFit: 0.14, risk: 0.08 },
  provide_failover: { latency: 0.10, uptime: 0.30, proofReadiness: 0.18, integrationReadiness: 0.14, resourceFit: 0.14, risk: 0.14 },
  request_failover: { latency: 0.14, uptime: 0.30, proofReadiness: 0.18, integrationReadiness: 0.14, resourceFit: 0.12, risk: 0.12 },
  find_platform_resource: { latency: 0.16, uptime: 0.18, proofReadiness: 0.18, integrationReadiness: 0.22, resourceFit: 0.16, risk: 0.10 },
  onboard_node: { latency: 0.14, uptime: 0.20, proofReadiness: 0.22, integrationReadiness: 0.20, resourceFit: 0.14, risk: 0.10 },
  validate_proof: { latency: 0.10, uptime: 0.14, proofReadiness: 0.36, integrationReadiness: 0.18, resourceFit: 0.10, risk: 0.12 },
};

function latencyGrade(latency: number): 'Gold'|'Silver'|'Bronze' { if (latency >= 85) return 'Gold'; if (latency >= 70) return 'Silver'; return 'Bronze'; }
function band(score: number): 'best'|'strong'|'usable'|'caution'|'avoid' { if (score >= 85) return 'best'; if (score >= 75) return 'strong'; if (score >= 65) return 'usable'; if (score >= 50) return 'caution'; return 'avoid'; }

export function selectAutoDrillResource(input: { intent: ResourceIntent; candidates: CandidateLane[]; }): any {
  const weights = INTENT_WEIGHTS[input.intent];
  const lanes = [...new Set(input.candidates)].map((lane) => {
    const profile = LANE_PROFILES[lane];
    const score = Math.round((Object.keys(weights) as ScoreAxis[]).reduce((acc, axis) => acc + profile[axis] * weights[axis], 0) * 100) / 100;
    return {
      lane,
      score,
      band: band(score),
      latencyGrade: latencyGrade(profile.latency),
      proofRequired: true,
      humanApprovalRequired: true,
      allowedToExecute: false,
      factors: profile,
      explanation: `${lane} scored ${score} for ${input.intent} based on weighted latency, uptime, proof, integration, fit, and risk.`,
    };
  }).sort((a,b)=> b.score - a.score || a.lane.localeCompare(b.lane));

  const recommended = lanes[0] ?? null;
  const alternates = lanes.slice(1, 4);
  const avoidLanes = lanes.filter((x) => x.band === 'avoid' || x.band === 'caution');
  return {
    schemaVersion: '1.0',
    selector: 'skygrid-auto-drill-resource-selector',
    intent: input.intent,
    generatedAt: new Date().toISOString(),
    deterministic: true,
    recommendation: recommended,
    alternates,
    avoidLanes,
    bands: {
      best: lanes.filter((x) => x.band === 'best').map((x) => x.lane),
      strong: lanes.filter((x) => x.band === 'strong').map((x) => x.lane),
      usable: lanes.filter((x) => x.band === 'usable').map((x) => x.lane),
      caution: lanes.filter((x) => x.band === 'caution').map((x) => x.lane),
      avoid: lanes.filter((x) => x.band === 'avoid').map((x) => x.lane),
    },
    executionGuardrail: {
      advisoryOnly: true,
      allowedToExecute: false,
      reason: 'SkyGrid Preflight Protection Lane approval is required before any execution path can be enabled.',
    },
    compatibility: ['airtable', 'dynamodb', 'postman', 'proof-packets'],
    scoredLanes: lanes,
  };
}
