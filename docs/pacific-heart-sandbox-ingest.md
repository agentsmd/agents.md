# Pacific Heart sandbox emergency ingest

This sandbox flow defines the minimum Pacific Heart emergency payload path into SkyGrid without adding a live public medical-data workload to the website front door.

## Sandbox flow boundary

The executable flow is implemented as a local validation module and test path:

1. normalize the inbound Pacific Heart emergency event schema,
2. validate required emergency fields and vitals,
3. build a SkyGrid sandbox ingestion handoff,
4. render the dispatcher dashboard result object,
5. prepare a responder handoff packet for operator review,
6. return evidence with timestamp, endpoint, status code, dashboard result, responder handoff status, and event id.

The sandbox endpoint identifier used in evidence is `/sandbox/pacific-heart/events`. It is a validation identifier for the tested flow, not a claim that a production medical ingest endpoint is deployed.

## Supported inbound schemas

The normalizer accepts both the existing camelCase sandbox shape and a Pacific Heart-style nested snake_case shape.

### CamelCase sandbox request

```json
{
  "eventId": "ph_evt_20260527_001",
  "patientId": "ph_patient_demo_001",
  "eventType": "cardiac_alert",
  "occurredAt": "2026-05-27T23:45:00.000Z",
  "vitals": {
    "heartRateBpm": 134,
    "bloodPressureSystolic": 162,
    "bloodPressureDiastolic": 96,
    "glucoseMgDl": 118
  },
  "alerts": ["tachycardia_detected", "hypertension_stage_2"],
  "location": {
    "lat": 45.5132,
    "lng": -122.6784,
    "label": "sandbox-scene"
  },
  "medicalContext": {
    "conditions": ["hypertension"],
    "medications": ["demo-medication-record"],
    "allergies": ["demo-allergy-record"]
  }
}
```

### Nested snake_case sandbox request

```json
{
  "event": {
    "event_id": "ph_evt_snake_001",
    "patient_id": "ph_patient_demo_002",
    "event_type": "diabetic_crisis",
    "occurred_at": "2026-05-28T00:02:03Z",
    "vitals": {
      "heart_rate_bpm": "108",
      "blood_pressure_systolic": "146",
      "blood_pressure_diastolic": 91,
      "glucose_mg_dl": "54",
      "spo2": "97"
    },
    "alerts": [" hypoglycemia_detected ", "diabetic_crisis"],
    "location": {
      "latitude": "43.72973",
      "longitude": "-121.531512",
      "scene": "sandbox driveway scene"
    }
  },
  "medical": {
    "conditions": ["type 1 diabetes"],
    "medications": ["insulin"],
    "allergies": ["penicillin"]
  }
}
```

## Response behavior

- `202` with `ok: true` for valid sandbox payloads.
- `400` with `ok: false` and validation error for malformed sandbox payloads.
- Dispatcher dashboard status: `visible_for_dispatch_review`.
- Responder handoff status: `ready_for_operator_review`.

## SkyGrid handoff definition

The ingestion packet emits a bounded handoff with:

- `lane`: `skygrid-emergency-intake-sandbox`
- `handoff.queue`: `skygrid.emergency.ingest`
- `handoff.mode`: `operator-reviewed`
- `handoff.state`: `accepted_for_processing`

## MVP-62 validation evidence

Local sandbox evidence captured by the integration test:

```json
{
  "timestamp": "2026-05-29T13:45:00.000Z",
  "endpoint": "/sandbox/pacific-heart/events",
  "statusCode": 202,
  "dashboardResult": "visible_for_dispatch_review",
  "responderHandoff": "ready_for_operator_review",
  "eventId": "ph_evt_20260527_001"
}
```

Verification run on 2026-05-29 UTC:

- `pnpm install --frozen-lockfile` passed.
- `pnpm run lint` passed.
- `pnpm test` passed with the Pacific Heart normalization unit tests and end-to-end sandbox integration test.
- `pnpm dev` plus `curl -i http://127.0.0.1:3000/health.json` returned `HTTP/1.1 200 OK` for local front-door smoke coverage.

This evidence demonstrates the sandbox validation path only. It does not claim live emergency dispatch authority, production Pacific Heart integration, or a deployed medical ingest endpoint.
