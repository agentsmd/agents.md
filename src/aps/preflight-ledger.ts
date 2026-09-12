export interface PreflightRecordInput {
  preflight_id?: string;
  client_matter?: string;
  linear_issue?: string;
  github_repo?: string;
  github_branch?: string;
  github_commit?: string;
  risk_level?: string;
  evidence_urls?: string[];
  human_approval_flags?: string[];
  wallet_approval_flags?: string[];
  operator_notes?: string;
  [key: string]: unknown;
}

export interface DynamoTableClient {
  putItem(item: Record<string, unknown>, conditionExpression: string): Promise<void>;
}

export interface CreatePreflightRecordResult {
  ok: boolean;
  status: "CREATED" | "DUPLICATE" | "ERROR";
  preflightId?: string;
  stepFunctions: {
    shouldContinue: boolean;
    nextState: "PreflightIntakeRecorded" | "PreflightDuplicate" | "PreflightValidationError";
    blockedActions: string[];
  };
  record?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
  };
}

const BLOCKED_ACTIONS = [
  "layer2_execution",
  "wallet_movement",
  "financial_execution",
  "contract_execution",
  "client_facing_action",
];

function utcNowIso(now: Date = new Date()): string {
  return now.toISOString();
}

function requiredFieldError(field: string): CreatePreflightRecordResult {
  return {
    ok: false,
    status: "ERROR",
    stepFunctions: {
      shouldContinue: false,
      nextState: "PreflightValidationError",
      blockedActions: BLOCKED_ACTIONS,
    },
    error: {
      code: "validation_error",
      message: `Missing required field: ${field}`,
    },
  };
}

export async function createPreflightRecord(
  preflightData: PreflightRecordInput,
  table: DynamoTableClient,
  now: Date = new Date(),
): Promise<CreatePreflightRecordResult> {
  if (!preflightData.preflight_id) {
    return requiredFieldError("preflight_id");
  }

  const timestamp = utcNowIso(now);
  const record: Record<string, unknown> = {
    PreflightID: preflightData.preflight_id,
    ClientMatter: preflightData.client_matter ?? null,
    LinearIssue: preflightData.linear_issue ?? null,
    GitHubRepo: preflightData.github_repo ?? null,
    GitHubBranch: preflightData.github_branch ?? null,
    GitHubCommit: preflightData.github_commit ?? null,
    RiskLevel: preflightData.risk_level ?? "Medium",
    EmergencyLaneStatus: "Intake",
    FinalReadinessState: "Not Started",
    EvidenceURLs: preflightData.evidence_urls ?? [],
    HumanApprovalFlags: preflightData.human_approval_flags ?? [],
    WalletApprovalFlags: preflightData.wallet_approval_flags ?? [],
    OperatorNotes: preflightData.operator_notes ?? null,
    Layer2Blocked: true,
    CreatedAt: timestamp,
    UpdatedAt: timestamp,
  };

  try {
    await table.putItem(record, "attribute_not_exists(PreflightID)");
    return {
      ok: true,
      status: "CREATED",
      preflightId: preflightData.preflight_id,
      record,
      stepFunctions: {
        shouldContinue: true,
        nextState: "PreflightIntakeRecorded",
        blockedActions: BLOCKED_ACTIONS,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const isDuplicate = /ConditionalCheckFailed/i.test(message);

    return {
      ok: false,
      status: isDuplicate ? "DUPLICATE" : "ERROR",
      preflightId: preflightData.preflight_id,
      stepFunctions: {
        shouldContinue: false,
        nextState: isDuplicate ? "PreflightDuplicate" : "PreflightValidationError",
        blockedActions: BLOCKED_ACTIONS,
      },
      error: {
        code: isDuplicate ? "duplicate_preflight_id" : "dynamodb_put_failed",
        message,
      },
    };
  }
}
