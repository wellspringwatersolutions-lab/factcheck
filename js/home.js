import { checkClaims } from "./check-claims.js";
import { renderResults } from "./render-report.js";

const form = document.querySelector("#check-form");
const textarea = document.querySelector("#answer");
const button = document.querySelector("#check-button");
const resultsRoot = document.querySelector("#results");
const status = document.querySelector("#status");
const pending = document.querySelector("#pending");
const error = document.querySelector("#form-error");

const MAX_HEIGHT = 240;

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
  pending.hidden = false;
  status.textContent = "Checking claims.";
  try {
    const report = await checkClaims(text);
    if (location.hash) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    renderResults(resultsRoot, report);
    document.body.classList.add("is-results");
    grow();
    pending.hidden = true;
    status.textContent = "Check finished. Results are below.";
    resultsRoot.scrollIntoView({
      behavior: reducedMotion() ? "auto" : "smooth",
      block: "nearest",
    });
  } catch (err) {
    pending.hidden = true;
    showError((err && err.message) || "The check could not be finished. Try again.");
    status.textContent = "The check could not be finished.";
  } finally {
    button.disabled = false;
    button.textContent = "Check";
  }
});

grow();
