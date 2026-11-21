import { summaryLine } from "./summary.js";

const SVG_NS = "http://www.w3.org/2000/svg";

const CATEGORIES = {
  event: "Event",
  measurement: "Measurement",
  scientific: "Scientific",
  quantity: "Quantity",
  schedule: "Schedule",
  policy: "Policy",
  credibility: "Credibility",
  prediction: "Prediction",
};

const VERDICT_LABELS = {
  supported: "Supported",
  contradicted: "Contradicted",
  unverified: "Unverified",
  conflicting: "Conflicting",
  hypothesis: "Hypothesis",
};

const FACT_READING = {
  supported: "A quoted passage backs this claim.",
  contradicted: "A quoted passage goes against this claim.",
  unverified: "No quoted passage or tool result was found.",
  conflicting: "The quoted sources do not agree with the claim as it was written.",
  hypothesis: "A prediction. The quoted passage does not establish it.",
};

const SOURCE_TYPES = {
  primary_document: "Primary document",
  audit_report: "Audit report",
  fact_checker: "Fact-checker",
  tool_result: "Tool result",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    /* Ignore values that are not http(s) links. */
  }
  return "";
}

function domainOf(value) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function formatCheckedOn(iso) {
  if (!iso || typeof iso !== "string") return "";
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day || !MONTHS[month - 1]) return "";
  return `Checked on ${MONTHS[month - 1]} ${day}, ${year}`;
}

function strengthScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(Math.max(0, Math.min(1, n)) * 100);
}

function externalLink(href, className, text) {
  const link = el("a", className, text);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.append(el("span", "visually-hidden", " (opens in a new tab)"));
  return link;
}

function verdictIcon(verdict) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("class", "verdict-icon");
  if (verdict === "unverified") {
    const circle = document.createElementNS(SVG_NS, "circle");
    circle.setAttribute("cx", "8");
    circle.setAttribute("cy", "8");
    circle.setAttribute("r", "5.2");
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke", "currentColor");
    circle.setAttribute("stroke-width", "1.6");
    circle.setAttribute("stroke-dasharray", "2.2 1.8");
    svg.append(circle);
    return svg;
  }
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.6");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  const paths = {
    supported: "M3.2 8.3 6.4 11.5 12.8 4.5",
    contradicted: "M4 4 L12 12 M12 4 L4 12",
    conflicting: "M3 5.2 h10 M3 10.8 h10",
    hypothesis: "M3.2 8 h8.2 M8.6 4.8 12.2 8 8.6 11.2",
  };
  path.setAttribute("d", paths[verdict] || paths.conflicting);
  svg.append(path);
  return svg;
}

function categoryLabel(value) {
  return CATEGORIES[value] || value || "Claim";
}

function verdictLabel(value) {
  return VERDICT_LABELS[value] || value || "Unchecked";
}

function sourceTypeLabel(value) {
  return SOURCE_TYPES[value] || value || "Source";
}

function rangeOf(claim, text) {
  if (Number.isInteger(claim.start) && Number.isInteger(claim.end) && claim.end > claim.start) {
    if (text.slice(claim.start, claim.end) === claim.claim) {
      return [claim.start, claim.end];
    }
  }
  const start = text.indexOf(claim.claim);
  if (start < 0) return null;
  return [start, start + claim.claim.length];
}

function renderPassage(container, text, claims) {
  const ranges = [];
  for (const claim of claims) {
    const range = rangeOf(claim, text);
    if (!range) continue;
    ranges.push({ claim, start: range[0], end: range[1] });
  }
  ranges.sort((a, b) => a.start - b.start);

  const paragraphs = [];
  let paragraph = el("p");
  paragraphs.push(paragraph);
  let cursor = 0;

  function pushText(chunk) {
    const parts = chunk.split("\n");
    parts.forEach((part, index) => {
      if (part) paragraph.append(document.createTextNode(part));
      if (index < parts.length - 1) {
        paragraph = el("p");
        paragraphs.push(paragraph);
      }
    });
  }

  for (const range of ranges) {
    if (range.start < cursor) continue;
    pushText(text.slice(cursor, range.start));
    const link = el("a", highlightClass(range.claim));
    link.href = `#claim-${range.claim.id}`;
    link.title =
      range.claim.claim_type === "opinion"
        ? "Opinion. Show this claim."
        : `Fact, ${verdictLabel(range.claim.verdict)}. Show this claim.`;
    link.append(document.createTextNode(text.slice(range.start, range.end)));
    link.append(
      el(
        "span",
        "visually-hidden",
        range.claim.claim_type === "opinion"
          ? " Opinion. Opens the claim card."
          : ` Fact, ${verdictLabel(range.claim.verdict)}. Opens the claim card.`,
      ),
    );
    paragraph.append(link);
    cursor = range.end;
  }
  pushText(text.slice(cursor));

  container.replaceChildren();
  for (const node of paragraphs) {
    if (node.textContent) container.append(node);
  }
  if (!container.childNodes.length) {
    container.append(el("p", "empty-record", "No pasted text was returned."));
  }
}

function highlightClass(claim) {
  if (claim.claim_type === "opinion") return "hl hl-opinion";
  return `hl hl-fact hl-${claim.verdict || "unverified"}`;
}

function renderStrength(claim) {
  const score = strengthScore(claim.strength_of_support);
  if (score == null) return null;
  const wrap = el("div", "strength");
  const row = el("div", "strength-row");
  const label = el("span", null, "Strength of support");
  label.id = `strength-${claim.id}`;
  row.append(label, el("span", null, `${score} / 100`));
  const meter = el("div", "meter");
  meter.setAttribute("role", "meter");
  meter.setAttribute("aria-valuemin", "0");
  meter.setAttribute("aria-valuemax", "100");
  meter.setAttribute("aria-valuenow", String(score));
  meter.setAttribute("aria-labelledby", label.id);
  const fill = el("span");
  fill.style.width = `${score}%`;
  meter.append(fill);
  wrap.append(row, meter);
  return wrap;
}

function renderSource(source, family) {
  const block = el("div", `source source-${family}`);
  const href = safeUrl(source.url);
  const quote = el("blockquote");
  const paragraph = el("p");
  if (href) {
    paragraph.append(externalLink(href, "quote-link", source.quote || ""));
  } else {
    paragraph.textContent = source.quote || "";
  }
  quote.append(paragraph);
  block.append(quote);

  const titleText = source.title || domainOf(source.url) || "Source";
  const titleLine = el("p", "source-line");
  if (href) titleLine.append(externalLink(href, "source-title", titleText));
  else titleLine.append(el("span", "source-title", titleText));
  block.append(titleLine);

  const bits = [];
  const domain = domainOf(source.url);
  if (domain) bits.push(domain);
  const checked = formatCheckedOn(source.checked_on);
  if (checked) bits.push(checked);
  if (source.source_type) bits.push(sourceTypeLabel(source.source_type));
  if (bits.length) block.append(el("p", "source-meta", bits.join(" · ")));
  return block;
}

function renderFactBody(card, claim) {
  const verdict = el("p", `verdict verdict-${claim.verdict || "unverified"}`);
  verdict.append(verdictIcon(claim.verdict));
  verdict.append(document.createTextNode(verdictLabel(claim.verdict)));
  card.append(verdict);
  card.append(el("p", "reading", FACT_READING[claim.verdict] || ""));
  const strength = renderStrength(claim);
  if (strength) card.append(strength);
  if (!claim.sources || !claim.sources.length) return;
  for (const source of claim.sources) card.append(renderSource(source, "fact"));
}

function renderOpinionBody(card, claim) {
  const strength = renderStrength(claim);
  if (strength) card.append(strength);
  card.append(el("h4", null, "What mainstream fact-checkers say"));
  const items = claim.mainstream_check?.items || [];
  if (!items.length) {
    card.append(el("p", "empty-record", "No mainstream fact-check was found for this opinion."));
    return;
  }
  const list = el("ol", "checker-list");
  for (const item of items) {
    const row = el("li");
    row.append(el("p", "checker-name", item.publisher || "Fact-checker"));
    if (item.rating_label) {
      row.append(el("p", "checker-rating", `Their rating: ${item.rating_label}`));
    }
    if (item.reason) row.append(el("p", "checker-reason", item.reason));
    const href = safeUrl(item.url);
    if (href) {
      row.append(externalLink(href, "checker-link", item.title || "Read the fact-check"));
    }
    list.append(row);
  }
  card.append(list);
}

function renderCard(claim) {
  const opinion = claim.claim_type === "opinion";
  const card = el(
    "article",
    opinion ? "card card-opinion" : `card card-fact card-v-${claim.verdict || "unverified"}`,
  );
  card.id = `claim-${claim.id}`;
  card.tabIndex = -1;
  const kicker = el(
    "p",
    "card-kicker",
    `${opinion ? "Opinion" : "Fact"} · ${categoryLabel(claim.claim_category)}`,
  );
  card.append(kicker);
  card.append(el("h3", "claim-text", claim.claim));
  if (opinion) renderOpinionBody(card, claim);
  else renderFactBody(card, claim);
  return card;
}

function renderLegend() {
  const section = el("section", "legend-block");
  const title = el("h2", null, "Color legend");
  title.id = "legend-title";
  section.setAttribute("aria-labelledby", "legend-title");
  section.append(title);

  const grid = el("div", "legend");
  const fact = el("p", "swatch swatch-fact");
  fact.append(el("strong", null, "Fact"));
  fact.append(
    document.createTextNode(
      " Colored from teal (most true) to red (least true). Supported only when a quoted source or tool result backs it.",
    ),
  );
  const opinion = el("p", "swatch swatch-opinion");
  opinion.append(el("strong", null, "Opinion"));
  opinion.append(
    document.createTextNode(
      " Copper. Reported as what mainstream fact-checkers say. Never labeled true or false.",
    ),
  );
  grid.append(fact, opinion);
  section.append(grid);

  const key = el("ul", "verdict-key");
  for (const verdict of ["supported", "hypothesis", "conflicting", "unverified"]) {
    const item = el("li");
    item.append(el("span", `hl hl-fact hl-${verdict}`, verdictLabel(verdict)));
    key.append(item);
  }
  const opinionItem = el("li");
  opinionItem.append(el("span", "hl hl-opinion", "Opinion"));
  key.append(opinionItem);
  section.append(key);
  section.append(
    el(
      "p",
      "legend-note",
      "Ranked from most true (teal) to least true (red). Opinions stay copper and are not given those verdicts.",
    ),
  );
  return section;
}

function markCurrent(id) {
  document.querySelectorAll(".hl.is-current, .card.is-current").forEach((node) => {
    node.classList.remove("is-current");
    node.removeAttribute("aria-current");
  });
  if (!id) return;
  const card = document.getElementById(id);
  if (card) {
    card.classList.add("is-current");
    card.setAttribute("aria-current", "true");
  }
  const mark = document.querySelector(`.hl[href="#${CSS.escape(id)}"]`);
  if (mark) mark.classList.add("is-current");
}

let hashBound = false;

export function renderResults(container, report) {
  // "Contradicted" is shown as "Conflicting" (one label for both).
  const claims = (Array.isArray(report?.claims) ? report.claims : []).map((c) =>
    c && c.verdict === "contradicted" ? { ...c, verdict: "conflicting" } : c,
  );
  const text = typeof report?.input_text === "string" ? report.input_text : "";
  container.replaceChildren();

  const root = el("div", "results");
  const head = el("div", "results-head");
  head.append(el("h2", "visually-hidden", "Summary"));
  head.append(el("p", "counts", summaryLine(claims) || "No claims"));

  const actions = el("div", "actions");
  const exportButton = el("button", "button-secondary", "Export evidence report");
  exportButton.type = "button";
  exportButton.disabled = true;
  exportButton.setAttribute("aria-disabled", "true");
  exportButton.setAttribute("aria-describedby", "soon");
  const shareButton = el("button", "button-secondary", "Share link");
  shareButton.type = "button";
  shareButton.disabled = true;
  shareButton.setAttribute("aria-disabled", "true");
  shareButton.setAttribute("aria-describedby", "soon");
  const soon = el("span", "soon-label", "Coming soon");
  soon.id = "soon";
  actions.append(exportButton, shareButton, soon);
  head.append(actions);
  root.append(head);

  root.append(
    el(
      "p",
      "evidence-note",
      "Highlights show where evidence was found; always check the source.",
    ),
  );
  const matched = claims.filter((claim) => rangeOf(claim, text)).length;
  if (!matched) {
    root.append(
      el(
        "p",
        "evidence-note",
        "This preview returned the sample report. Those claims were not found in the pasted text, so the passage has no highlights.",
      ),
    );
  } else {
    root.append(el("p", "preview-note", "Preview results from the local stub, not a live check."));
  }

  root.append(renderLegend());

  const split = el("div", "split");
  const passageCol = el("div", "passage-col");
  const passageTitle = el("h2", null, "Pasted text");
  passageTitle.id = "passage-title";
  const passage = el("div", "passage");
  passage.setAttribute("aria-labelledby", "passage-title");
  renderPassage(passage, text, claims);
  passage.addEventListener("click", (event) => {
    const link = event.target.closest("a.hl");
    if (!link || !passage.contains(link)) return;
    const id = (link.getAttribute("href") || "").slice(1);
    markCurrent(id);
    const card = document.getElementById(id);
    if (card) card.focus({ preventScroll: true });
  });
  passageCol.append(passageTitle, passage);

  const cardsCol = el("div", "cards-col");
  const cardsTitle = el("h2", null, "Claims");
  cardsTitle.id = "claims-title";
  const cards = el("div", "cards");
  cards.setAttribute("aria-labelledby", "claims-title");
  for (const claim of claims) cards.append(renderCard(claim));
  cardsCol.append(cardsTitle, cards);
  split.append(passageCol, cardsCol);
  root.append(split);
  container.append(root);

  if (!hashBound) {
    window.addEventListener("hashchange", () => {
      markCurrent(location.hash.replace(/^#/, ""));
    });
    hashBound = true;
  }
  markCurrent(location.hash.replace(/^#/, ""));
}
