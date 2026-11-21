import { SAMPLE_REPORT } from "./sample-report.js";

const DELAY_MS = 700;

/**
 * The only function the Check button calls.
 * Stub: waits, then returns the sample report. The text is not uploaded.
 *
 * When the check endpoint exists, replace the body of checkClaims with:
 *
 *   const response = await fetch("check", {
 *     method: "POST",
 *     headers: {
 *       "content-type": "application/json",
 *       accept: "application/json",
 *     },
 *     body: JSON.stringify({ text }),
 *   });
 *   if (!response.ok) throw new Error("Check failed");
 *   return response.json();
 *
 * The response shape is openapi.json. Highlight offsets are optional;
 * the results view also matches claim text inside the pasted answer.
 */
export function buildReport(text) {
  const input = typeof text === "string" ? text : "";
  const report = structuredClone(SAMPLE_REPORT);
  report.input_text = input;
  report.demo = true;
  for (const claim of report.claims) {
    const start = input.indexOf(claim.claim);
    if (start >= 0) {
      claim.start = start;
      claim.end = start + claim.claim.length;
    } else {
      claim.start = null;
      claim.end = null;
    }
  }
  return report;
}

export async function checkClaims(text) {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  return buildReport(text);
}
