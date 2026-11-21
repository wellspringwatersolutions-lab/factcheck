import { SAMPLE_REPORT } from "./sample-report.js";

/* Live checker API. No secret here: the free check needs no key. */
export const API_BASE = "https://factcheck-mim7.onrender.com";
const TIMEOUT_MS = 90000; // checks can take 20 to 60 seconds

/* Add highlight offsets where a claim's text appears in the pasted answer. */
function addOffsets(report, input) {
  report.input_text = input;
  for (const claim of report.claims || []) {
    if (typeof claim.start === "number" && typeof claim.end === "number") continue;
    const start = input.indexOf(claim.claim);
    claim.start = start >= 0 ? start : null;
    claim.end = start >= 0 ? start + claim.claim.length : null;
  }
  return report;
}

/* Sample report, kept for previews and tests. */
export function buildReport(text) {
  const input = typeof text === "string" ? text : "";
  const report = structuredClone(SAMPLE_REPORT);
  report.demo = true;
  return addOffsets(report, input);
}

export async function checkClaims(text) {
  const input = typeof text === "string" ? text : "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${API_BASE}/check`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ text: input }),
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error(
      err && err.name === "AbortError"
        ? "The check took too long. Try again in a minute."
        : "The checker couldn't be reached. Try again in a minute."
    );
  } finally {
    clearTimeout(timer);
  }
  let body = null;
  try { body = await response.json(); } catch { body = null; }
  if (!response.ok) {
    const message = body && body.error && body.error.message;
    throw new Error(message || "The check could not be finished. Try again.");
  }
  return addOffsets(body || { claims: [] }, input);
}
