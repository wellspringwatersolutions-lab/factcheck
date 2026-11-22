const VERDICT_ORDER = [
  "supported",
  "hypothesis",
  "opinion",
  "conflicting",
  "unverified",
];

const VERDICT_WORDS = {
  supported: ["supported", "supported"],
  unverified: ["unverified", "unverified"],
  conflicting: ["conflicting", "conflicting"],
  hypothesis: ["hypothesis", "hypotheses"],
};

export function summarize(claims) {
  const counts = {
    supported: 0,
    unverified: 0,
    conflicting: 0,
    hypothesis: 0,
  };
  let opinions = 0;
  for (const claim of claims || []) {
    if (claim.claim_type === "opinion") {
      opinions += 1;
      continue;
    }
    const raw = String(claim.verdict || "").toLowerCase();
    const v = raw === "contradicted" ? "conflicting" : raw === "likely_true" ? "hypothesis" : raw;
    if (Object.prototype.hasOwnProperty.call(counts, v)) {
      counts[v] += 1;
    }
  }
  return { counts, opinions };
}

export function summaryLine(claims) {
  const { counts, opinions } = summarize(claims);
  const parts = [];
  for (const verdict of VERDICT_ORDER) {
    if (verdict === "opinion") {
      if (opinions) parts.push(`${opinions} ${opinions === 1 ? "opinion" : "opinions"}`);
      continue;
    }
    const n = counts[verdict];
    if (!n) continue;
    const [one, many] = VERDICT_WORDS[verdict];
    parts.push(`${n} ${n === 1 ? one : many}`);
  }
  return parts.join(", ");
}
