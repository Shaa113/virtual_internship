// Default categories and monthly budget limits
const DEFAULT_BUDGETS = {
    Food: 5000.0,
    Entertainment: 3000.0,
    Bills: 10000.0,
    Transport: 2500.0,
    Other: 4000.0
};

// Default starter transactions to make the dashboard alive out of the box
const DEFAULT_TRANSACTIONS = [
    { id: "tx_1", date: getOffsetDateStr(0), category: "Bills", amount: 3500.0, description: "Monthly Broadband & Internet bill" },
    { id: "tx_2", date: getOffsetDateStr(-1), category: "Food", amount: 1250.0, description: "Weekly grocery store stock up" },
    { id: "tx_3", date: getOffsetDateStr(-3), category: "Entertainment", amount: 800.0, description: "Movie ticket and popcorn" },
    { id: "tx_4", date: getOffsetDateStr(-5), category: "Transport", amount: 450.0, description: "Weekly metro smartcard recharge" },
    { id: "tx_5", date: getOffsetDateStr(-7), category: "Food", amount: 350.0, description: "Lunch with study group" }
];

// Helper to calculate relative dates
function getOffsetDateStr(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
}

// In-memory application state
let budgets = {};
let transactions = [];

// DOM Elements
const kpiTotalExpenses = document.getElementById("kpiTotalExpenses");
const kpiTotalBudget = document.getElementById("kpiTotalBudget");
const kpiNetMargin = document.getElementById("kpiNetMargin");
const kpiAlertStatus = document.getElementById("kpiAlertStatus");
const kpiAlertFooter = document.getElementById("kpiAlertFooter");
const kpiAlertIconWrapper = document.getElementById("kpiAlertIconWrapper");
const alertSummaryCard = document.getElementById("alertSummaryCard");

const expenseForm = document.getElementById("expenseForm");
const budgetConfigForm = document.getElementById("budgetConfigForm");
const inputDate = document.getElementById("inputDate");

const categoryDashboard = document.getElementById("categoryDashboard");
const ledgerTableBody = document.getElementById("ledgerTableBody");
const ledgerCountText = document.getElementById("ledgerCountText");
const ledgerCategoryFilter = document.getElementById("ledgerCategoryFilter");

const csvImportInput = document.getElementById("csvImportInput");
const btnExportLedger = document.getElementById("btnExportLedger");
const toastContainer = document.getElementById("toastContainer");

document.addEventListener("DOMContentLoaded", () => {
    // Set default date picker to today
    inputDate.value = new Date().toISOString().slice(0, 10);

    // Initialize application state from localStorage or defaults
    loadState();

    // Event listeners
    expenseForm.addEventListener("submit", handleAddExpense);
    budgetConfigForm.addEventListener("submit", handleConfigureBudget);
    ledgerCategoryFilter.addEventListener("change", renderLedger);
    csvImportInput.addEventListener("change", handleCSVImport);
    btnExportLedger.addEventListener("click", exportLedgerToCSV);

    // Initial render
    updateDashboard();
});

// Toast alerts system
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
    if (type === "warning" || type === "danger-alert") {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else if (type === "success") {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    }

    toast.innerHTML = `
        ${iconSvg}
        <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    // Auto remove toast
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        setTimeout(() => toast.remove(), 300);
    }, 4500);
}

// State Management: Loading & Saving to localStorage
function loadState() {
    // Load budgets
    const savedBudgets = localStorage.getItem("finance_budgets");
    if (savedBudgets) {
        budgets = JSON.parse(savedBudgets);
    } else {
        budgets = { ...DEFAULT_BUDGETS };
    }

    // Load transactions
    const savedTransactions = localStorage.getItem("finance_transactions");
    if (savedTransactions) {
        transactions = JSON.parse(savedTransactions);
    } else {
        transactions = [...DEFAULT_TRANSACTIONS];
    }
}

function saveState() {
    localStorage.setItem("finance_budgets", JSON.stringify(budgets));
    localStorage.setItem("finance_transactions", JSON.stringify(transactions));
}

// Logging an Expense record
function handleAddExpense(e) {
    e.preventDefault();

    const category = document.getElementById("selectCategory").value;
    const amount = parseFloat(document.getElementById("inputAmount").value);
    const date = document.getElementById("inputDate").value;
    const description = document.getElementById("inputDescription").value.trim();

    if (isNaN(amount) || amount <= 0) {
        showToast("Error: Amount must be greater than zero.", "error");
        return;
    }

    if (!date) {
        showToast("Error: Please select a valid date.", "error");
        return;
    }

    if (!description) {
        showToast("Error: Description note cannot be blank.", "error");
        return;
    }

    const txId = `tx_${Date.now()}`;
    const newTx = { id: txId, date, category, amount, description };

    transactions.push(newTx);
    saveState();

    showToast(`Logged Rs ${amount.toFixed(2)} spent on ${category}!`, "success");

    // Check threshold alert for the specific category
    checkThresholdAlerts(category, amount);

    // Reset input fields
    document.getElementById("inputAmount").value = "";
    document.getElementById("inputDescription").value = "";
    inputDate.value = new Date().toISOString().slice(0, 10);

    updateDashboard();
}

// Recalculates total monthly expenses, checks triggers & fires warning toast notification alerts
function checkThresholdAlerts(category, newAmount) {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    // Sum category spending for current month
    const monthlySpending = transactions
        .filter(t => t.category === category && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    const limit = budgets[category];
    const pctUsed = (monthlySpending / limit) * 100;

    if (pctUsed >= 100) {
        showToast(`Alert: Budget Exceeded! You are spending Rs ${(monthlySpending - limit).toFixed(2)} over your monthly limit on '${category}'.`, "danger-alert");
    } else if (pctUsed >= 80) {
        showToast(`Warning: You have consumed ${pctUsed.toFixed(1)}% of your monthly budget for '${category}'. Please spend cautiously.`, "warning");
    }
}

// Editing monthly category budgets
function handleConfigureBudget(e) {
    e.preventDefault();

    const category = document.getElementById("selectConfigCat").value;
    const limit = parseFloat(document.getElementById("inputConfigLimit").value);

    if (isNaN(limit) || limit < 0) {
        showToast("Error: Budget limits cannot be negative values.", "error");
        return;
    }

    budgets[category] = limit;
    saveState();

    showToast(`Updated monthly budget cap for '${category}' to Rs ${limit.toFixed(2)}.`, "success");
    document.getElementById("inputConfigLimit").value = "";
    updateDashboard();
}

// Deleting an expense record
function deleteTransaction(txId) {
    const index = transactions.findIndex(t => t.id === txId);
    if (index === -1) return;

    const tx = transactions[index];
    transactions.splice(index, 1);
    saveState();

    showToast(`Deleted expense entry for '${tx.description}' (Rs ${tx.amount.toFixed(2)})`);
    updateDashboard();
}

// Core Dashboard Renderer
function updateDashboard() {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    // Group transactions by category (overall time for analytics summary)
    const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalBudgetLimit = Object.values(budgets).reduce((sum, b) => sum + b, 0);
    const netMargin = totalBudgetLimit - totalSpent;

    kpiTotalExpenses.textContent = `Rs ${totalSpent.toFixed(2)}`;
    kpiTotalBudget.textContent = `Rs ${totalBudgetLimit.toFixed(2)}`;

    if (netMargin < 0) {
        kpiNetMargin.textContent = `Rs ${netMargin.toFixed(2)}`;
        kpiNetMargin.className = "kpi-value text-gold"; // Highlight deficit
    } else {
        kpiNetMargin.textContent = `Rs ${netMargin.toFixed(2)}`;
        kpiNetMargin.className = "kpi-value";
    }

    // Category Breakdowns and Progress Bars
    const categorySpending = {};
    Object.keys(budgets).forEach(cat => {
        // Filter category transactions specifically in the current calendar month
        categorySpending[cat] = transactions
            .filter(t => t.category === cat && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
    });

    // Render consumption dashboard bars
    categoryDashboard.innerHTML = "";
    let systemStatus = "safe";
    let exceededCategoriesCount = 0;
    let warningCategoriesCount = 0;

    Object.keys(budgets).forEach(cat => {
        const spent = categorySpending[cat];
        const limit = budgets[cat];
        const pct = limit > 0 ? (spent / limit) * 100 : 0;

        let statusClass = "safe";
        let labelClass = "pct-safe";

        if (pct >= 100) {
            statusClass = "danger";
            labelClass = "pct-danger";
            exceededCategoriesCount++;
        } else if (pct >= 80) {
            statusClass = "warning";
            labelClass = "pct-warning";
            warningCategoriesCount++;
        }

        const barGroup = document.createElement("div");
        barGroup.className = "category-bar-group";
        barGroup.innerHTML = `
            <div class="category-bar-meta">
                <span class="category-bar-name">${cat}</span>
                <span class="category-bar-spent">Rs <strong>${spent.toFixed(2)}</strong> / Rs ${limit.toFixed(0)}</span>
                <span class="category-bar-pct ${labelClass}">${pct.toFixed(1)}%</span>
            </div>
            <div class="bar-track">
                <div class="bar-fill ${statusClass}" style="width: ${Math.min(pct, 100)}%"></div>
            </div>
        `;
        categoryDashboard.appendChild(barGroup);
    });

    // Update global system status card
    alertSummaryCard.className = "kpi-card glass"; // Reset
    if (exceededCategoriesCount > 0) {
        systemStatus = "danger";
        alertSummaryCard.classList.add("status-danger");
        kpiAlertStatus.textContent = "Deficit Alert";
        kpiAlertFooter.textContent = `${exceededCategoriesCount} budget limit(s) exceeded!`;
        kpiAlertIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    } else if (warningCategoriesCount > 0) {
        systemStatus = "warning";
        alertSummaryCard.classList.add("status-warning");
        kpiAlertStatus.textContent = "Caution";
        kpiAlertFooter.textContent = `${warningCategoriesCount} category approaching limits.`;
        kpiAlertIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
    } else {
        systemStatus = "safe";
        alertSummaryCard.classList.add("status-safe");
        kpiAlertStatus.textContent = "Safe Mode";
        kpiAlertFooter.textContent = "All budgets under targets.";
        kpiAlertIconWrapper.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    }

    renderLedger();
}

// Render filtered ledger list
function renderLedger() {
    const filterCat = ledgerCategoryFilter.value;

    // Sort transactions reverse-chronologically (newest first)
    const filteredList = transactions
        .filter(t => filterCat === "ALL" || t.category === filterCat)
        .sort((a, b) => b.date.localeCompare(a.date));

    ledgerCountText.textContent = `Showing ${filteredList.length} of ${transactions.length} records`;
    ledgerTableBody.innerHTML = "";

    if (filteredList.length === 0) {
        ledgerTableBody.innerHTML = `
            <tr>
                <td colspan="5" class="td-empty text-muted">No expense items found matching selection criteria.</td>
            </tr>
        `;
        return;
    }

    filteredList.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${t.date}</td>
            <td><span class="category-tag tag-${t.category}">${t.category}</span></td>
            <td>Rs ${t.amount.toFixed(2)}</td>
            <td>${t.description}</td>
            <td>
                <button class="btn-delete" title="Remove transaction record">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </td>
        `;

        tr.querySelector(".btn-delete").addEventListener("click", () => {
            deleteTransaction(t.id);
        });

        ledgerTableBody.appendChild(tr);
    });
}

// Export complete ledger transactions state as expenses.csv file
function exportLedgerToCSV() {
    if (transactions.length === 0) {
        showToast("Error: The ledger database is currently empty. No items to export.", "error");
        return;
    }

    try {
        const csvRows = [];
        // Header
        csvRows.push(['date', 'category', 'amount', 'description'].join(','));

        // Data entries
        transactions.forEach(t => {
            const row = [
                t.date,
                t.category,
                t.amount,
                `"${t.description.replace(/"/g, '""')}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvBlob);

        const link = document.createElement("a");
        link.setAttribute("href", csvUrl);
        link.setAttribute("download", `expenses.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(`Successfully exported ${transactions.length} transactions to CSV database.`, "success");
    } catch (e) {
        showToast(`CSV Backup Export failed: ${e.message}`, "error");
    }
}

// Client-side CSV database parser
function handleCSVImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const text = evt.target.result;
            const lines = text.split(/\r?\n/);
            if (lines.length < 2) throw new Error("Dataset is blank or missing format headers.");

            const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ''));
            const required = ['date', 'category', 'amount', 'description'];
            const missing = required.filter(r => !headers.includes(r));

            if (missing.length > 0) {
                throw new Error(`CSV database structure mismatch. Missing fields: ${missing.join(", ")}`);
            }

            const parsedItems = [];
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ''));
                if (cols.length < headers.length) continue;

                const raw = {};
                headers.forEach((h, index) => {
                    raw[h] = cols[index];
                });

                const amt = parseFloat(raw.amount);
                if (isNaN(amt) || amt <= 0) continue;

                // Validate category matches budgets
                const rawCat = raw.category.trim().charAt(0).toUpperCase() + raw.category.trim().slice(1).toLowerCase();
                const matchedCat = DEFAULT_BUDGETS[rawCat] ? rawCat : "Other";

                parsedItems.push({
                    id: `tx_${Date.now()}_${i}`,
                    date: raw.date.trim(),
                    category: matchedCat,
                    amount: amt,
                    description: raw.description.trim()
                });
            }

            if (parsedItems.length === 0) {
                throw new Error("No database rows were recognized.");
            }

            // Append to in-memory state
            transactions = [...transactions, ...parsedItems];
            saveState();

            showToast(`Imported ${parsedItems.length} transactions from CSV database!`, "success");
            updateDashboard();

        } catch (err) {
            showToast(`Database Restore Error: ${err.message}`, "error");
        }
    };
    reader.readAsText(file);
    csvImportInput.value = ""; // Reset element
}
