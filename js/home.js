import { buildReport, checkClaims } from "./check-claims.js";
import { renderResults } from "./render-report.js";

const form = document.querySelector("#check-form");
const textarea = document.querySelector("#answer");
const button = document.querySelector("#check-button");
const resultsRoot = document.querySelector("#results");
const status = document.querySelector("#status");
const error = document.querySelector("#form-error");

const MAX_HEIGHT = 240;
const DEMO_DELAY_MS = 12000;
const STEP_MS = 4000;

const STEPS = [
  "Finding claims in your text",
  "Searching sources",
  "Reading source pages",
  "Checking quotes against sources",
  "Asking fact-checkers about opinions",
  "Writing your report",
];

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function demoMode() {
  return new URLSearchParams(window.location.search).get("demo") === "1";
}

function grow() {
  const compact =
    document.body.classList.contains("is-results") && !textarea.classList.contains("is-expanded");
  const cap = compact ? 72 : MAX_HEIGHT;
  textarea.style.height = "auto";
  const next = Math.min(textarea.scrollHeight, cap);
  textarea.style.height = `${next}px`;
  textarea.style.overflowY = textarea.scrollHeight > cap ? "auto" : "hidden";
}

function showError(message) {
  error.hidden = false;
  error.textContent = message;
}

function hideError() {
  error.hidden = true;
  error.textContent = "";
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderProgress() {
  const section = el("section", "progress");
  section.setAttribute("aria-busy", "true");
  section.setAttribute("aria-labelledby", "progress-title");

  const title = el("h2", "visually-hidden", "Check in progress");
  title.id = "progress-title";
  section.append(title);

  const scan = el("div", "scan");
  scan.setAttribute("aria-hidden", "true");
  scan.append(el("span"));
  section.append(scan);

  section.append(el("p", "progress-note", "Checks usually take under a minute."));

  const elapsed = el("p", "elapsed");
  elapsed.append(document.createTextNode("Elapsed "));
  const count = el("span", null, "0");
  count.id = "elapsed-count";
  elapsed.append(count, document.createTextNode("s"));
  section.append(elapsed);

  const list = el("ol", "check-steps");
  list.id = "check-steps";
  STEPS.forEach((label, index) => {
    const item = el("li", index === 0 ? "is-active" : "is-waiting");
    if (index === 0) item.setAttribute("aria-current", "step");
    const mark = el("span", "step-mark");
    mark.setAttribute("aria-hidden", "true");
    item.append(mark, el("span", "step-label", label));
    list.append(item);
  });
  section.append(list);

  const skeletons = el("div", "skeletons");
  skeletons.setAttribute("aria-hidden", "true");
  skeletons.append(
    el("div", "skeleton skeleton-fact"),
    el("div", "skeleton skeleton-opinion"),
    el("div", "skeleton skeleton-fact"),
  );
  section.append(skeletons);

  resultsRoot.replaceChildren(section);
  resultsRoot.classList.remove("is-arriving");
}

function paintSteps(activeIndex) {
  const items = resultsRoot.querySelectorAll("#check-steps li");
  items.forEach((item, index) => {
    item.classList.remove("is-active", "is-done", "is-waiting");
    item.removeAttribute("aria-current");
    if (index < activeIndex) item.classList.add("is-done");
    else if (index === activeIndex) {
      item.classList.add("is-active");
      item.setAttribute("aria-current", "step");
    } else item.classList.add("is-waiting");
  });
}

function startProgress() {
  renderProgress();
  status.textContent = STEPS[0];
  let activeIndex = 0;
  let seconds = 0;
  const elapsedTimer = window.setInterval(() => {
    seconds += 1;
    const node = document.getElementById("elapsed-count");
    if (node) node.textContent = String(seconds);
  }, 1000);
  const stepTimer = window.setInterval(() => {
    if (activeIndex >= STEPS.length - 1) return;
    activeIndex += 1;
    paintSteps(activeIndex);
    status.textContent = STEPS[activeIndex];
  }, STEP_MS);
  return function stop() {
    window.clearInterval(elapsedTimer);
    window.clearInterval(stepTimer);
    const section = resultsRoot.querySelector(".progress");
    if (section) section.setAttribute("aria-busy", "false");
  };
}

function showProgressError(message) {
  const panel = el("div", "progress-error");
  panel.append(el("p", null, message));
  resultsRoot.replaceChildren(panel);
  resultsRoot.classList.remove("is-arriving");
}

async function previewReport(text) {
  await new Promise((resolve) => window.setTimeout(resolve, DEMO_DELAY_MS));
  return buildReport(text);
}

textarea.addEventListener("input", grow);
textarea.addEventListener("focus", () => {
  textarea.classList.add("is-expanded");
  grow();
});
textarea.addEventListener("blur", () => {
  textarea.classList.remove("is-expanded");
  grow();
});
textarea.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    form.requestSubmit();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = textarea.value;
  if (!text.trim()) {
    showError("Paste an answer or a claim to check.");
    status.textContent = "Paste an answer or a claim to check.";
    textarea.focus();
    return;
  }
  hideError();
  button.disabled = true;
  button.textContent = "Checking…";
  document.body.classList.add("is-results");
  grow();
  const stop = startProgress();
  resultsRoot.scrollIntoView({
    behavior: reducedMotion() ? "auto" : "smooth",
    block: "nearest",
  });
  try {
    const report = demoMode() ? await previewReport(text) : await checkClaims(text, (p) => {
          if (p && p.total) button.textContent = `Checking… ${p.done} of ${p.total} claims`;
        });
    stop();
    const reveal = () => {
      if (location.hash) {
        history.replaceState(null, "", location.pathname + location.search);
      }
      renderResults(resultsRoot, report);
      resultsRoot.classList.add("is-arriving");
      status.textContent = "Check finished. Results are below.";
    };
    const leaving = resultsRoot.querySelector(".progress");
    if (leaving && !reducedMotion()) {
      leaving.classList.add("is-leaving");
      window.setTimeout(reveal, 220);
    } else {
      reveal();
    }
  } catch (err) {
    stop();
    const message = (err && err.message) || "The check could not be finished. Try again.";
    showError(message);
    showProgressError(message);
    status.textContent = message;
  } finally {
    button.disabled = false;
    button.textContent = "Check";
  }
});

grow();
