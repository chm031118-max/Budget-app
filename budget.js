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
let balance = 0,
  income = 0,
  outcome = 0;
const DELETE = "delete",
  EDIT = "edit";

// LOOK IF THERE IS DATA IN LOCAL STORAGE
ENTRY_LIST = JSON.parse(localStorage.getItem("entry_list")) || [];
updateUI();

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
  localStorage.setItem("entry_list", JSON.stringify(ENTRY_LIST));
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

function showValidationErrors(titleInput, amountInput, titleErrorElement, amountErrorElement, errors) {
  if (titleErrorElement) {
    titleErrorElement.textContent = errors.title || "";
  }

  if (amountErrorElement) {
    amountErrorElement.textContent = errors.amount || "";
  }

  titleInput.classList.toggle("input-error", Boolean(errors.title));
  amountInput.classList.toggle("input-error", Boolean(errors.amount));
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

function validateEntry(title, amount) {
  const trimmedTitle = title.trim();
  const numericAmount = Number(amount);
  const errors = {};

  if (!trimmedTitle) {
    errors.title = "Title is required.";
  }

  if (!amount || !Number.isFinite(numericAmount) || numericAmount <= 0) {
    errors.amount = "Amount must be greater than 0.";
  }

  if (numericAmount > 1000000) {
    errors.amount = "Amount is too large.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    value: {
      title: trimmedTitle,
      amount: numericAmount,
    },
  };
}
