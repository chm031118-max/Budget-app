import { describe, it, expect } from "vitest";
import validationAPI from "../src/validation.js";

const {
  validateTitle,
  validateAmount,
  validateEntry,
  MAX_TITLE_LENGTH,
  MAX_AMOUNT,
} = validationAPI;

describe("validateTitle", () => {
  it("accepts a normal title", () => {
    const result = validateTitle("coffee");

    expect(result.valid).toBe(true);
    expect(result.value).toBe("coffee");
    expect(result.error).toBe("");
  });

  it("trims spaces around the title", () => {
    const result = validateTitle("  salary  ");

    expect(result.valid).toBe(true);
    expect(result.value).toBe("salary");
  });

  it("rejects an empty title", () => {
    const result = validateTitle("");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Title is required.");
  });

  it("rejects a whitespace-only title", () => {
    const result = validateTitle("   ");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Title is required.");
  });

  it("rejects a title longer than the maximum length", () => {
    const longTitle = "a".repeat(MAX_TITLE_LENGTH + 1);
    const result = validateTitle(longTitle);

    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
  });
});

describe("validateAmount", () => {
  it("accepts a valid integer amount", () => {
    const result = validateAmount("100");

    expect(result.valid).toBe(true);
    expect(result.value).toBe(100);
    expect(result.error).toBe("");
  });

  it("accepts a valid amount with two decimal places", () => {
    const result = validateAmount("12.22");

    expect(result.valid).toBe(true);
    expect(result.value).toBe(12.22);
  });

  it("rejects an empty amount", () => {
    const result = validateAmount("");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Amount is required.");
  });

  it("rejects a non-numeric amount", () => {
    const result = validateAmount("abc");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Amount must be a valid number.");
  });

  it("rejects zero", () => {
    const result = validateAmount("0");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Amount must be greater than 0.");
  });

  it("rejects negative amounts", () => {
    const result = validateAmount("-80");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Amount must be greater than 0.");
  });

  it("rejects amounts with more than two decimal places", () => {
    const result = validateAmount("12.222222");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Amount must use digits only, with at most 2 decimal places.");
  });

  it("rejects scientific notation", () => {
    const result = validateAmount("1e+45");

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Amount must use digits only, with at most 2 decimal places.");
  });

  it("rejects amounts greater than the maximum limit", () => {
    const result = validateAmount(String(MAX_AMOUNT + 1));

    expect(result.valid).toBe(false);
    expect(result.error).toBe(`Amount must not exceed ${MAX_AMOUNT.toLocaleString()}.`);
  });
});

describe("validateEntry", () => {
  it("accepts a valid title and amount", () => {
    const result = validateEntry("coffee", "12.22");

    expect(result.valid).toBe(true);
    expect(result.value).toEqual({
      title: "coffee",
      amount: 12.22,
    });
    expect(result.errors).toEqual({
      title: "",
      amount: "",
    });
  });

  it("returns both title and amount errors when both inputs are invalid", () => {
    const result = validateEntry("   ", "-80");

    expect(result.valid).toBe(false);
    expect(result.value).toBe(null);
    expect(result.errors.title).toBe("Title is required.");
    expect(result.errors.amount).toBe("Amount must be greater than 0.");
  });
});