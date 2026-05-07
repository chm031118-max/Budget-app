// src/validation.js

(function (global) {
    const MAX_TITLE_LENGTH = 40;
    const MAX_AMOUNT = 1000000000;;
  
    const ERROR_MESSAGES = {
      titleRequired: "Title is required.",
      titleTooLong: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
      amountRequired: "Amount is required.",
      amountInvalid: "Amount must be a valid number.",
      amountFormat: "Amount must use digits only, with at most 2 decimal places.",
      amountPositive: "Amount must be greater than 0.",
      amountTooLarge: `Amount must not exceed ${MAX_AMOUNT.toLocaleString()}.`,
    };
  
    function validateTitle(title) {
      const cleanedTitle = String(title ?? "").trim();
  
      if (cleanedTitle.length === 0) {
        return {
          valid: false,
          value: "",
          error: ERROR_MESSAGES.titleRequired,
        };
      }
  
      if (cleanedTitle.length > MAX_TITLE_LENGTH) {
        return {
          valid: false,
          value: cleanedTitle,
          error: ERROR_MESSAGES.titleTooLong,
        };
      }
  
      return {
        valid: true,
        value: cleanedTitle,
        error: "",
      };
    }
  
    function validateAmount(amount) {
      const rawAmount = String(amount ?? "").trim();
  
      if (rawAmount.length === 0) {
        return {
          valid: false,
          value: null,
          error: ERROR_MESSAGES.amountRequired,
        };
      }
  
      const numericAmount = Number(rawAmount);
  
      if (!Number.isFinite(numericAmount)) {
        return {
          valid: false,
          value: null,
          error: ERROR_MESSAGES.amountInvalid,
        };
      }
  
      if (numericAmount <= 0) {
        return {
          valid: false,
          value: null,
          error: ERROR_MESSAGES.amountPositive,
        };
      }
  
      // Only allow normal currency-like numbers:
      // valid examples: 12, 12.2, 12.22
      // invalid examples: 12.222, 1e+45, abc, $12
      const normalNumberPattern = /^\d+(\.\d{1,2})?$/;
  
      if (!normalNumberPattern.test(rawAmount)) {
        return {
          valid: false,
          value: null,
          error: ERROR_MESSAGES.amountFormat,
        };
      }
  
      if (numericAmount > MAX_AMOUNT) {
        return {
          valid: false,
          value: null,
          error: ERROR_MESSAGES.amountTooLarge,
        };
      }
  
      return {
        valid: true,
        value: numericAmount,
        error: "",
      };
    }
  
    function validateEntry(title, amount) {
      const titleResult = validateTitle(title);
      const amountResult = validateAmount(amount);
  
      const isValid = titleResult.valid && amountResult.valid;
  
      if (!isValid) {
        return {
          valid: false,
          value: null,
          errors: {
            title: titleResult.error,
            amount: amountResult.error,
          },
        };
      }
  
      return {
        valid: true,
        value: {
          title: titleResult.value,
          amount: amountResult.value,
        },
        errors: {
          title: "",
          amount: "",
        },
      };
    }
  
    const validationAPI = {
      validateTitle,
      validateAmount,
      validateEntry,
      ERROR_MESSAGES,
      MAX_TITLE_LENGTH,
      MAX_AMOUNT,
    };
  
    // Browser usage
    global.validateTitle = validateTitle;
    global.validateAmount = validateAmount;
    global.validateEntry = validateEntry;
    global.validationAPI = validationAPI;
  
    // Test usage in Vitest / Node
    if (typeof module !== "undefined" && module.exports) {
      module.exports = validationAPI;
    }
  })(typeof window !== "undefined" ? window : globalThis);