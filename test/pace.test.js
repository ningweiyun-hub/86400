"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const {
  ApiProblem,
  extractOutputText,
  handlePlan,
  normalizeNextActionPayload,
  normalizePlanPayload,
  validateNextActionRequest,
  validatePlanRequest
} = require("../server/pace");

function mockResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    end(body) { this.body = body || ""; }
  };
}

test("plan request validation applies safe defaults", () => {
  assert.deepEqual(validatePlanRequest({ goal: "  Build a reading habit  " }), {
    goal: "Build a reading habit",
    locale: "en",
    timezone: "UTC"
  });
});

test("plan request rejects blank and oversized goals", () => {
  assert.throws(() => validatePlanRequest({ goal: "  " }), error => error instanceof ApiProblem && error.status === 400 && error.code === "INVALID_GOAL");
  assert.throws(() => validatePlanRequest({ goal: "x".repeat(2001) }), error => error instanceof ApiProblem && error.status === 400 && error.code === "INVALID_GOAL");
});

test("next-action request validates the complete context", () => {
  const input = validateNextActionRequest({
    goal: "Run a 5K",
    weeklySprintGoal: "Walk and jog for thirty minutes this week",
    previousActionTitle: "Walk for ten minutes",
    previousActionCompleted: true,
    currentDay: 2
  });
  assert.equal(input.currentDay, 2);
  assert.equal(input.reflection, "No reflection provided");
  assert.equal(input.mood, "Not provided");
  assert.equal(input.previousActionCompleted, true);
});

test("structured response text is extracted from the raw Responses API payload", () => {
  const text = extractOutputText({
    output: [{ type: "message", content: [{ type: "output_text", text: '{"ok":true}' }] }]
  });
  assert.equal(text, '{"ok":true}');
});

test("plan payload preserves the frontend contract", () => {
  const payload = normalizePlanPayload({
    goalClassification: "Wellbeing",
    reasoning: "A smaller starting point protects consistency.",
    weeklySprintGoal: "Complete three short walks this week.",
    successCriteria: ["Record three completed walks."],
    todayAction: {
      title: "Walk for ten minutes",
      description: "Finish one uninterrupted ten-minute walk.",
      minimumCompletion: "Walk for three minutes",
      durationMinutes: 10,
      difficulty: "easy"
    },
    coachMessage: "A short walk is enough to begin."
  });
  assert.equal(payload.dailyActionPlan.length, 1);
  assert.equal(payload.dailyActionPlan[0].day, 1);
  assert.deepEqual(payload.sideTasks, []);
});

test("next-action payload advances by exactly one day", () => {
  const payload = normalizeNextActionPayload({
    nextAction: {
      title: "Walk for twelve minutes",
      description: "Finish one uninterrupted twelve-minute walk.",
      minimumCompletion: "Walk for four minutes",
      durationMinutes: 12,
      difficulty: "easy"
    },
    coachMessage: "Keep tomorrow small and steady."
  }, 3);
  assert.equal(payload.day, 4);
  assert.equal(payload.nextAction.day, 4);
});

test("plan endpoint returns 503 when the server-side key is absent", async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  const response = mockResponse();
  try {
    await handlePlan({ method: "POST", body: { goal: "Build a calm reading habit" } }, response);
    assert.equal(response.statusCode, 503);
    assert.equal(JSON.parse(response.body).error.code, "AI_NOT_CONFIGURED");
  } finally {
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});

test("plan endpoint sends a strict schema request and returns the frontend contract", async () => {
  const originalKey = process.env.OPENAI_API_KEY;
  const originalFetch = globalThis.fetch;
  let providerRequest;
  process.env.OPENAI_API_KEY = "test-only-key";
  globalThis.fetch = async (_url, options) => {
    providerRequest = JSON.parse(options.body);
    return {
      ok: true,
      async json() {
        return {
          output: [{
            type: "message",
            content: [{
              type: "output_text",
              text: JSON.stringify({
                goalClassification: "Wellbeing",
                reasoning: "A smaller start protects consistency.",
                weeklySprintGoal: "Complete three short walks this week.",
                successCriteria: ["Record three completed walks."],
                todayAction: {
                  title: "Walk for ten minutes",
                  description: "Finish one uninterrupted ten-minute walk.",
                  minimumCompletion: "Walk for three minutes",
                  durationMinutes: 10,
                  difficulty: "easy"
                },
                coachMessage: "A short walk is enough to begin."
              })
            }]
          }]
        };
      }
    };
  };
  const response = mockResponse();
  try {
    await handlePlan({
      method: "POST",
      body: { goal: "Walk consistently", locale: "en-US", timezone: "Europe/Amsterdam" }
    }, response);
    const body = JSON.parse(response.body);
    assert.equal(response.statusCode, 200);
    assert.equal(body.dailyActionPlan.length, 1);
    assert.equal(providerRequest.text.format.type, "json_schema");
    assert.equal(providerRequest.text.format.strict, true);
    assert.equal(providerRequest.store, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});
