const test = require('node:test');
const assert = require('node:assert/strict');

const {
  SANDBOX_ENDPOINT,
  sandboxPayload,
  normalizePacificHeartEvent,
  validatePacificHeartPayload,
  buildSkyGridHandoff,
  runPacificHeartSandboxFlow,
} = require('../src/emergency/pacific-heart-ingest');

test('sandbox payload normalizes and validates', () => {
  const normalized = normalizePacificHeartEvent(sandboxPayload);

  assert.equal(normalized.ok, true);
  assert.equal(normalized.event.eventId, sandboxPayload.eventId);
  assert.equal(normalized.event.occurredAt, '2026-05-27T23:45:00.000Z');
  assert.deepEqual(validatePacificHeartPayload(sandboxPayload), {
    ok: true,
    event: normalized.event,
  });
});

test('snake_case inbound emergency event schema normalizes to SkyGrid fields', () => {
  const inboundPayload = {
    event: {
      event_id: 'ph_evt_snake_001',
      patient_id: 'ph_patient_demo_002',
      event_type: 'diabetic_crisis',
      occurred_at: '2026-05-28T00:02:03Z',
      vitals: {
        heart_rate_bpm: '108',
        blood_pressure_systolic: '146',
        blood_pressure_diastolic: 91,
        glucose_mg_dl: '54',
        spo2: '97',
      },
      alerts: [' hypoglycemia_detected ', 'diabetic_crisis'],
      location: {
        latitude: '43.72973',
        longitude: '-121.531512',
        scene: 'sandbox driveway scene',
      },
    },
    medical conditions {none}
    },
  };

  const normalized = normalizePacificHeartEvent(inboundPayload);

  assert.equal(normalized.ok, true);
  assert.equal(normalized.event.eventId, 'ph_evt_snake_001');
  assert.equal(normalized.event.eventType, 'diabetic_crisis');
  assert.equal(normalized.event.vitals.heartRateBpm, 108);
  assert.equal(normalized.event.vitals.glucoseMgDl, 54);
  assert.equal(normalized.event.location.lng, -121.531512);
  assert.deepEqual(normalized.event.medicalContext.allergies, ['penicillin']);
});

test('missing required field is rejected after normalization', () => {
  const payload = { ...sandboxPayload };
  delete payload.vitals;
  assert.equal(validatePacificHeartPayload(payload).ok, false);
});

test('buildSkyGridHandoff creates deterministic lane metadata', () => {
  const handoff = buildSkyGridHandoff(sandboxPayload);
  assert.equal(handoff.lane, 'skygrid-emergency-intake-sandbox');
  assert.equal(handoff.handoff.queue, 'skygrid.emergency.ingest');
  assert.equal(handoff.event.eventId, sandboxPayload.eventId);
});

test('integration path ingests event, renders dashboard result, and prepares responder handoff evidence', () => {
  const observedAt = '2026-05-29T13:45:00.000Z';
  const result = runPacificHeartSandboxFlow(sandboxPayload, { observedAt });

  assert.equal(result.ok, true);
  assert.equal(result.endpoint, SANDBOX_ENDPOINT);
  assert.equal(result.statusCode, 202);
  assert.equal(result.ingestion.handoff.state, 'accepted_for_processing');
  assert.equal(result.dashboardResult.status, 'visible_for_dispatch_review');
  assert.equal(result.dashboardResult.priority, 'high');
  assert.equal(result.responderHandoff.status, 'ready_for_operator_review');
  assert.deepEqual(result.evidence, {
    timestamp: observedAt,
    endpoint: SANDBOX_ENDPOINT,
    statusCode: 202,
    dashboardResult: 'visible_for_dispatch_review',
    responderHandoff: 'ready_for_operator_review',
    eventId: sandboxPayload.eventId,
  });
});
