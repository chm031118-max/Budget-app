import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

function loadApp() {
  const html = readFileSync(join(projectRoot, "index.html"), "utf8");

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    url: "http://localhost/",
  });

  const { window } = dom;

  // jsdom does not fully implement canvas, so we mock the methods used by chart.js.
  window.HTMLCanvasElement.prototype.getContext = () => ({
    lineWidth: 0,
    strokeStyle: "",
    beginPath() {},
    arc() {},
    stroke() {},
    clearRect() {},
  });

  window.localStorage.clear();

  const validationCode = readFileSync(
    join(projectRoot, "src", "validation.js"),
    "utf8"
  );
  const chartCode = readFileSync(join(projectRoot, "chart.js"), "utf8");
  const budgetCode = readFileSync(join(projectRoot, "budget.js"), "utf8");

  window.eval(validationCode);
  window.eval(chartCode);
  window.eval(budgetCode);

  return {
    window,
    document: window.document,
    close: () => window.close(),
  };
}

function getStoredEntries(window) {
  return JSON.parse(window.localStorage.getItem("entry_list") || "[]");
}

function setInput(document, selector, value) {
  document.querySelector(selector).value = value;
}

describe("Budget app DOM validation", () => {
  it("blocks a negative expense amount and shows an error message", () => {
    const app = loadApp();
    const { window, document } = app;

    setInput(document, "#expense-title-input", "coffee");
    setInput(document, "#expense-amount-input", "-80");

    document.querySelector(".add-expense").click();

    expect(document.querySelector("#expense-amount-error").textContent).toBe(
      "Amount must be greater than 0."
    );
    expect(getStoredEntries(window)).toHaveLength(0);

    app.close();
  });

  it("blocks a whitespace-only expense title and shows an error message", () => {
    const app = loadApp();
    const { window, document } = app;

    setInput(document, "#expense-title-input", "   ");
    setInput(document, "#expense-amount-input", "11");

    document.querySelector(".add-expense").click();

    expect(document.querySelector("#expense-title-error").textContent).toBe(
      "Title is required."
    );
    expect(getStoredEntries(window)).toHaveLength(0);

    app.close();
  });

  it("blocks an expense amount above the maximum limit", () => {
    const app = loadApp();
    const { window, document } = app;

    setInput(document, "#expense-title-input", "rent");
    setInput(document, "#expense-amount-input", "1000000001");

    document.querySelector(".add-expense").click();

    expect(document.querySelector("#expense-amount-error").textContent).toBe(
      "Amount must not exceed 1,000,000,000."
    );
    expect(getStoredEntries(window)).toHaveLength(0);

    app.close();
  });

  it("adds a valid expense, trims the title, and clears error messages", () => {
    const app = loadApp();
    const { window, document } = app;

    // First submit invalid input to create an error message.
    setInput(document, "#expense-title-input", "coffee");
    setInput(document, "#expense-amount-input", "-80");
    document.querySelector(".add-expense").click();

    expect(document.querySelector("#expense-amount-error").textContent).toBe(
      "Amount must be greater than 0."
    );

    // Then submit valid input.
    setInput(document, "#expense-title-input", "  coffee  ");
    setInput(document, "#expense-amount-input", "12.22");
    document.querySelector(".add-expense").click();

    const entries = getStoredEntries(window);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({
      type: "expense",
      title: "coffee",
      amount: 12.22,
    });

    expect(document.querySelector("#expense-title-error").textContent).toBe("");
    expect(document.querySelector("#expense-amount-error").textContent).toBe("");
    expect(document.querySelector("#expense .list").textContent).toContain(
      "coffee"
    );
    expect(document.querySelector(".outcome-total").textContent).toContain(
      "$12.22"
    );

    app.close();
  });

  it("adds a valid income entry", () => {
    const app = loadApp();
    const { window, document } = app;

    setInput(document, "#income-title-input", "salary");
    setInput(document, "#income-amount-input", "1000");

    document.querySelector(".add-income").click();

    const entries = getStoredEntries(window);

    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual({
      type: "income",
      title: "salary",
      amount: 1000,
    });

    expect(document.querySelector("#income-title-error").textContent).toBe("");
    expect(document.querySelector("#income-amount-error").textContent).toBe("");
    expect(document.querySelector("#income .list").textContent).toContain(
      "salary"
    );
    expect(document.querySelector(".income-total").textContent).toContain(
      "$1000"
    );

    app.close();
  });
});