import { SAMPLE_REPORT } from "./sample-report.js";

/* Live checker API. No secret here: the free check needs no key. */
export const API_BASE = "https://factcheck-mim7.onrender.com";
const TIMEOUT_MS = 90000; // checks can take 20 to 60 seconds

/* Add highlight offsets where a claim's text appears in the pasted answer. */
function addOffsets(report, input) {
  // In question mode the claims come from the drafted answer, so highlight that.
  const draft = report && report.draft_answer && report.draft_answer.text;
  if (typeof draft === "string" && draft) input = draft;
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

const POLL_MS = 2000;
const JOB_TIMEOUT_MS = 180000; // background checks get up to two minutes

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal });
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
    const message = body && body.error && (body.error.message || body.error);
    throw new Error(typeof message === "string" ? message : "The check could not be finished. Try again.");
  }
  return { status: response.status, body };
}

/* Starts a background check and polls until it's done. onProgress gets {done, total}. */
export async function checkClaims(text, onProgress) {
  const input = typeof text === "string" ? text : "";
  const started = await fetchJson(`${API_BASE}/check`, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ text: input, async: true }),
  });
  // Older servers answer right away with the report.
  if (!(started.body && started.body.job_id)) return addOffsets(started.body || { claims: [] }, input);
  const jobId = started.body.job_id;
  const deadline = Date.now() + JOB_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_MS);
    let job;
    try {
      job = (await fetchJson(`${API_BASE}/v1/jobs/${encodeURIComponent(jobId)}`, { headers: { accept: "application/json" } })).body;
    } catch (err) {
      continue; // a brief network blip shouldn't end the check
    }
    if (!job) continue;
    if (job.progress && typeof onProgress === "function") onProgress(job.progress);
    if (job.status === "done" && job.report) return addOffsets(job.report, input);
    if (job.status === "error") {
      const message = job.error && (job.error.message || job.error);
      throw new Error(typeof message === "string" ? message : "The check could not be finished. Try again.");
    }
  }
  throw new Error("The check took too long. Try again in a minute.");
}
