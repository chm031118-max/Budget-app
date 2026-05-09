//SELECT ELEMENTS
const balanceEl = document.querySelector(".balance .value");
const incomeTotalEl = document.querySelector(".income-total");
const outcomeTotalEl = document.querySelector(".outcome-total");
const incomeEl = document.querySelector("#income");
const expenseEl = document.querySelector("#expense");
const allEl = document.querySelector("#all");
const incomeList = document.querySelector("#income .list");
const expenseList = document.querySelector("#expense .list");
const allList = document.querySelector("#all .list");
const cookieBanner = document.getElementById("cookie-banner");
const acceptCookiesBtn = document.getElementById("accept-cookies");
const rejectCookiesBtn = document.getElementById("reject-cookies");
const necessaryCookiesBtn = document.getElementById("necessary-cookies");

const translations = {
  en: {
    balance: "Balance",
    income: "Income",
    outcome: "Outcome",
    dashboard: "Dashboard",
    expenses_tab: "Expenses",
    income_tab: "Income",
    all_tab: "All",
    title_placeholder: "title",
    amount_placeholder: "$0",
    add_expense_aria: "Add expense",
    add_income_aria: "Add income",
  },
  zh: {
    balance: "余额",
    income: "收入",
    outcome: "支出",
    dashboard: "仪表板",
    expenses_tab: "支出",
    income_tab: "收入",
    all_tab: "全部",
    title_placeholder: "标题",
    amount_placeholder: "金额",
    add_expense_aria: "添加支出",
    add_income_aria: "添加收入",
  }
};

//SELECT BUTTONS
const expenseBtn = document.querySelector(".first-tab");
const incomeBtn = document.querySelector(".second-tab");
const allBtn = document.querySelector(".third-tab");

//INPUT BTS
const addExpense = document.querySelector(".add-expense");
const expenseTitle = document.getElementById("expense-title-input");
const expenseAmount = document.getElementById("expense-amount-input");
const expenseTitleError = document.getElementById("expense-title-error");
const expenseAmountError = document.getElementById("expense-amount-error");
const addIncome = document.querySelector(".add-income");
const incomeTitle = document.getElementById("income-title-input");
const incomeAmount = document.getElementById("income-amount-input");
const incomeTitleError = document.getElementById("income-title-error");
const incomeAmountError = document.getElementById("income-amount-error");
//VARIABLES
let ENTRY_LIST;
let currentLang = localStorage.getItem("lang") || "en";
let balance = 0,
  income = 0,
  outcome = 0;
const DELETE = "delete",
  EDIT = "edit";

// LOOK IF THERE IS DATA IN LOCAL STORAGE
ENTRY_LIST = loadEntries();
updateUI();
initCookieBanner();

//EVENT LISTENERS
expenseBtn.addEventListener("click", function () {
  show(expenseEl);
  hide([incomeEl, allEl]);
  active(expenseBtn);
  inactive([incomeBtn, allBtn]);
});
incomeBtn.addEventListener("click", function () {
  show(incomeEl);
  hide([expenseEl, allEl]);
  active(incomeBtn);
  inactive([expenseBtn, allBtn]);
});
allBtn.addEventListener("click", function () {
  show(allEl);
  hide([incomeEl, expenseEl]);
  active(allBtn);
  inactive([incomeBtn, expenseBtn]);
});
addExpense.addEventListener("click", function () {
  const validationResult = validateEntry(expenseTitle.value, expenseAmount.value);

  if (!validationResult.valid) {
    showValidationErrors(
      expenseTitle,
      expenseAmount,
      expenseTitleError,
      expenseAmountError,
      validationResult.errors
    );
    return;
  }

  clearValidationErrors(
    expenseTitle,
    expenseAmount,
    expenseTitleError,
    expenseAmountError
  );

  let expense = {
    type: "expense",
    title: validationResult.value.title,
    amount: validationResult.value.amount,
  };

  ENTRY_LIST.push(expense);

  updateUI();
  clearInput([expenseTitle, expenseAmount]);
});

addIncome.addEventListener("click", function () {
  const validationResult = validateEntry(incomeTitle.value, incomeAmount.value);

  if (!validationResult.valid) {
    showValidationErrors(
      incomeTitle,
      incomeAmount,
      incomeTitleError,
      incomeAmountError,
      validationResult.errors
    );
    return;
  }

  clearValidationErrors(
    incomeTitle,
    incomeAmount,
    incomeTitleError,
    incomeAmountError
  );

  let income = {
    type: "income",
    title: validationResult.value.title,
    amount: validationResult.value.amount,
  };

  ENTRY_LIST.push(income);

  updateUI();
  clearInput([incomeTitle, incomeAmount]);
});

incomeList.addEventListener("click", deleteOrEdit);
expenseList.addEventListener("click", deleteOrEdit);
allList.addEventListener("click", deleteOrEdit);

if (rejectCookiesBtn) {
  rejectCookiesBtn.addEventListener("click", function () {
    saveCookieConsent("rejected");
  });
}

if (necessaryCookiesBtn) {
  necessaryCookiesBtn.addEventListener("click", function () {
    saveCookieConsent("necessary_only");
  });
}

if (acceptCookiesBtn) {
  acceptCookiesBtn.addEventListener("click", function () {
    saveCookieConsent("accepted_all");
  });
}

// HELEPER FUNCS
function deleteOrEdit(event) {
  const targetBtn = event.target.closest("button[data-action]");
  if (!targetBtn) return;

  const entry = targetBtn.closest("li");
  if (!entry) return;

  if (targetBtn.dataset.action === EDIT) {
    editEntry(entry);
  } else if (targetBtn.dataset.action === DELETE) {
    deleteEntry(entry);
  }
}

function deleteEntry(entry) {
  const index = Number(entry.dataset.index);
  if (!Number.isInteger(index)) return;

  ENTRY_LIST.splice(index, 1);
  updateUI();
}

function editEntry(entry) {
  const index = Number(entry.dataset.index);
  if (!Number.isInteger(index)) return;

  const selectedEntry = ENTRY_LIST[index];
  if (!selectedEntry) return;

  if (selectedEntry.type === "income") {
    incomeTitle.value = selectedEntry.title;
    incomeAmount.value = selectedEntry.amount;
  } else if (selectedEntry.type === "expense") {
    expenseTitle.value = selectedEntry.title;
    expenseAmount.value = selectedEntry.amount;
  }

  deleteEntry(entry);
}

function updateUI() {
  income = calculateTotal("income", ENTRY_LIST);
  outcome = calculateTotal("expense", ENTRY_LIST);
  balance = Math.abs(calculateBalance(income, outcome));

  let sign = income >= outcome ? "$" : "-$";

  //UPDATE UI
  balanceEl.innerHTML = `<small>${sign}</small>${balance}`;
  outcomeTotalEl.innerHTML = `<small>$</small>${outcome}`;
  incomeTotalEl.innerHTML = `<small>$</small>${income}`;

  clearElement([expenseList, incomeList, allList]);

  ENTRY_LIST.forEach((entry, index) => {
    if (entry.type == "expense") {
      showEntry(expenseList, entry.type, entry.title, entry.amount, index);
    } else if (entry.type == "income") {
      showEntry(incomeList, entry.type, entry.title, entry.amount, index);
    }
    showEntry(allList, entry.type, entry.title, entry.amount, index);
  });
  updateChart(income, outcome);
  saveEntries(ENTRY_LIST);
}

function showEntry(list, type, title, amount, id) {
  const listItem = document.createElement("li");
  listItem.dataset.index = id;
  listItem.className = type;

  const entryText = document.createElement("div");
  entryText.className = "entry";
  entryText.textContent = `${title} : $${amount}`;

  const editButton = document.createElement("button");
  editButton.className = "edit";
  editButton.type = "button";
  editButton.dataset.action = EDIT;
  editButton.setAttribute("aria-label", `Edit ${title}`);

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete";
  deleteButton.type = "button";
  deleteButton.dataset.action = DELETE;
  deleteButton.setAttribute("aria-label", `Delete ${title}`);

  listItem.append(entryText, editButton, deleteButton);
  list.prepend(listItem);
}

function clearElement(elements) {
  elements.forEach((element) => {
    element.innerHTML = "";
  });
}

function calculateTotal(type, list) {
  let sum = 0;
  list.forEach((entry) => {
    if (entry.type == type) {
      sum += entry.amount;
    }
  });
  return sum;
}

function calculateBalance(income, outcome) {
  return income - outcome;
}
function clearInput(inputs) {
  inputs.forEach((input) => {
    input.value = "";
  });
}

function show(element) {
  element.classList.remove("hide");
}

function hide(elements) {
  elements.forEach((element) => {
    element.classList.add("hide");
  });
}

function active(element) {
  element.classList.add("focus");
}
function inactive(elements) {
  elements.forEach((element) => {
    element.classList.remove("focus");
  });
}

const ERROR_MESSAGE_TRANSLATIONS = {
  zh: {
    "Title is required.": "请输入标题。",
    "Title must be 40 characters or fewer.": "标题不能超过 40 个字符。",
    "Amount is required.": "请输入金额。",
    "Amount must be a valid number.": "金额必须是有效数字。",
    "Amount must use digits only, with at most 2 decimal places.":
      "金额只能包含数字，且最多保留两位小数。",
    "Amount must be greater than 0.": "金额必须大于 0。",
    "Amount must not exceed 1,000,000,000.":
      "金额不能超过 1,000,000,000。",
  },
};

function translateValidationError(message) {
  if (!message) return "";

  if (currentLang === "zh") {
    return ERROR_MESSAGE_TRANSLATIONS.zh[message] || message;
  }

  return message;
}

function showValidationErrors(
  titleInput,
  amountInput,
  titleErrorElement,
  amountErrorElement,
  errors
) {
  titleErrorElement.textContent = translateValidationError(errors.title);
  amountErrorElement.textContent = translateValidationError(errors.amount);

  titleInput.classList.toggle("input-error", Boolean(errors.title));
  amountInput.classList.toggle("input-error", Boolean(errors.amount));
}

function refreshValidationErrorLanguage() {
  if (
    expenseTitle.classList.contains("input-error") ||
    expenseAmount.classList.contains("input-error")
  ) {
    const expenseValidation = validateEntry(
      expenseTitle.value,
      expenseAmount.value
    );

    if (!expenseValidation.valid) {
      showValidationErrors(
        expenseTitle,
        expenseAmount,
        expenseTitleError,
        expenseAmountError,
        expenseValidation.errors
      );
      return;
    }
  }

  if (
    incomeTitle.classList.contains("input-error") ||
    incomeAmount.classList.contains("input-error")
  ) {
    const incomeValidation = validateEntry(
      incomeTitle.value,
      incomeAmount.value
    );

    if (!incomeValidation.valid) {
      showValidationErrors(
        incomeTitle,
        incomeAmount,
        incomeTitleError,
        incomeAmountError,
        incomeValidation.errors
      );
    }
  }
}

function clearValidationErrors(titleInput, amountInput, titleErrorElement, amountErrorElement) {
  if (titleErrorElement) {
    titleErrorElement.textContent = "";
  }

  if (amountErrorElement) {
    amountErrorElement.textContent = "";
  }

  titleInput.classList.remove("input-error");
  amountInput.classList.remove("input-error");
}

function loadEntries() {
  try {
    const rawEntries = localStorage.getItem("entry_list");

    if (!rawEntries) {
      return [];
    }

    const parsedEntries = JSON.parse(rawEntries);

    if (!Array.isArray(parsedEntries)) {
      localStorage.removeItem("entry_list");
      return [];
    }

    return parsedEntries.filter(isValidStoredEntry);
  } catch (error) {
    console.error("Failed to load entries from localStorage:", error);
    localStorage.removeItem("entry_list");
    return [];
  }
}

function saveEntries(entries) {
  try {
    localStorage.setItem("entry_list", JSON.stringify(entries));
  } catch (error) {
    console.error("Failed to save entries to localStorage:", error);
  }
}

function isValidStoredEntry(entry) {
  return (
    entry &&
    (entry.type === "income" || entry.type === "expense") &&
    typeof entry.title === "string" &&
    typeof entry.amount === "number" &&
    Number.isFinite(entry.amount) &&
    entry.amount > 0
  );
}

function saveCookieConsent(status) {
  localStorage.setItem("cookie_consent", status);

  if (cookieBanner) {
    cookieBanner.classList.add("hide");
  }
}

function initCookieBanner() {
  if (!cookieBanner) {
    return;
  }

  const consentStatus = localStorage.getItem("cookie_consent");

  if (consentStatus) {
    cookieBanner.classList.add("hide");
  } else {
    cookieBanner.classList.remove("hide");
  }
}

function applyLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[lang] && translations[lang][key]) {
      el.placeholder = translations[lang][key];
    }
  });
  
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria");
    if (translations[lang] && translations[lang][key]) {
      el.setAttribute("aria-label", translations[lang][key]);
    }
  });
  
  const toggleBtn = document.getElementById("lang-toggle");
  if (toggleBtn) {
    toggleBtn.textContent = lang === "en" ? "🌐 中文" : "🌐 English";
  }
  localStorage.setItem("lang", lang);
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "zh" : "en";
  localStorage.setItem("lang", currentLang);
  applyLanguage(currentLang);
  refreshValidationErrorLanguage();
}

applyLanguage(currentLang);

const toggleBtn = document.getElementById('lang-toggle');
if (toggleBtn) {
  toggleBtn.addEventListener('click', toggleLanguage);
}