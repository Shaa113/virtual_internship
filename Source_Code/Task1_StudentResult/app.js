/**
 * Core Application Script for Student Result Analytics Dashboard
 * Task 1 - Web Application Migration
 */

// In-Memory Database initialized with baseline Kaggle Sample Data
const KAGGLE_SAMPLE_DATA = [
    { roll_no: "101", name: "Alice Johnson", school: "GP", sex: "F", age: 18, studytime: 2, failures: 0, absences: 6, G1: 12, G2: 13, G3: 15 },
    { roll_no: "102", name: "Bob Smith", school: "GP", sex: "M", age: 17, studytime: 2, failures: 0, absences: 4, G1: 8, G2: 11, G3: 11 },
    { roll_no: "103", name: "Charlie Davis", school: "GP", sex: "M", age: 15, studytime: 3, failures: 0, absences: 10, G1: 15, G2: 14, G3: 15 },
    { roll_no: "104", name: "Diana Martinez", school: "MS", sex: "F", age: 16, studytime: 2, failures: 0, absences: 2, G1: 18, G2: 19, G3: 20 },
    { roll_no: "105", name: "Evan Wilson", school: "GP", sex: "M", age: 16, studytime: 1, failures: 1, absences: 8, G1: 6, G2: 7, G3: 8 },
    { roll_no: "106", name: "Fiona Clark", school: "MS", sex: "F", age: 17, studytime: 4, failures: 0, absences: 0, G1: 14, G2: 15, G3: 16 },
    { roll_no: "107", name: "George Wright", school: "GP", sex: "M", age: 18, studytime: 2, failures: 0, absences: 2, G1: 11, G2: 12, G3: 12 },
    { roll_no: "108", name: "Hannah Lewis", school: "MS", sex: "F", age: 15, studytime: 3, failures: 0, absences: 4, G1: 16, G2: 17, G3: 17 },
    { roll_no: "109", name: "Ian Walker", school: "GP", sex: "M", age: 17, studytime: 1, failures: 2, absences: 12, G1: 5, G2: 5, G3: 4 },
    { roll_no: "110", name: "Julia Hall", school: "MS", sex: "F", age: 16, studytime: 2, failures: 0, absences: 6, G1: 10, G2: 10, G3: 11 }
];

let studentDb = [];
let sortColumn = "roll_no";
let sortAscending = true;

// DOM Elements
const csvFileInput = document.getElementById("csvFileInput");
const btnLoadSample = document.getElementById("btnLoadSample");
const btnExportCSV = document.getElementById("btnExportCSV");
const btnClearFilters = document.getElementById("btnClearFilters");

const filterSearchInput = document.getElementById("filterSearchInput");
const filterGradeSelect = document.getElementById("filterGradeSelect");
const filterPctSlider = document.getElementById("filterPctSlider");
const pctValText = document.getElementById("pctValText");

const kpiTotalStudents = document.getElementById("kpiTotalStudents");
const kpiMeanScore = document.getElementById("kpiMeanScore");
const kpiMedianStd = document.getElementById("kpiMedianStd");
const kpiTopperName = document.getElementById("kpiTopperName");
const kpiTopperScore = document.getElementById("kpiTopperScore");

const studentTableBody = document.getElementById("studentTableBody");
const recordCountText = document.getElementById("recordCountText");
const distributionChart = document.getElementById("distributionChart");
const addStudentForm = document.getElementById("addStudentForm");
const toastContainer = document.getElementById("toastContainer");

// Initialize Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    // Setup actions
    btnLoadSample.addEventListener("click", loadSampleData);
    csvFileInput.addEventListener("change", handleCSVUpload);
    btnExportCSV.addEventListener("click", exportFilteredData);
    
    // Filters listeners
    filterSearchInput.addEventListener("input", applyFilters);
    filterGradeSelect.addEventListener("change", applyFilters);
    filterPctSlider.addEventListener("input", (e) => {
        pctValText.textContent = `${e.target.value}%`;
        applyFilters();
    });
    btnClearFilters.addEventListener("click", resetFilters);
    
    // Form submission
    addStudentForm.addEventListener("submit", handleAddStudent);
    
    // Table Sorting
    document.querySelectorAll("#studentTable th[data-sort]").forEach(th => {
        th.addEventListener("click", () => {
            const col = th.getAttribute("data-sort");
            handleSort(col);
        });
    });

    // Auto-load sample data on startup
    loadSampleData();
});

// Toast System
function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span>${message}</span>
    `;
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(50px)";
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Letter Grade Calculator
function getLetterGrade(pct) {
    if (pct >= 85) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 55) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
}

// Calculate total metrics for a record
function processRecord(raw) {
    const g1 = parseFloat(raw.G1) || 0;
    const g2 = parseFloat(raw.G2) || 0;
    const g3 = parseFloat(raw.G3) || 0;
    const total = g1 + g2 + g3;
    const percentage = (total / 60.0) * 100.0;
    
    return {
        roll_no: raw.roll_no.toString().trim(),
        name: raw.name.trim(),
        school: (raw.school || "GP").trim().toUpperCase(),
        sex: (raw.sex || "F").trim().toUpperCase(),
        age: parseInt(raw.age) || 16,
        studytime: parseInt(raw.studytime) || 2,
        failures: parseInt(raw.failures) || 0,
        absences: parseInt(raw.absences) || 0,
        G1: g1,
        G2: g2,
        G3: g3,
        total: total,
        percentage: percentage,
        grade: getLetterGrade(percentage)
    };
}

// Load Baseline Kaggle Sample Data
function loadSampleData() {
    studentDb = KAGGLE_SAMPLE_DATA.map(processRecord);
    showToast(`Loaded ${studentDb.length} records from Kaggle dataset sample.`, "success");
    applyFilters();
}

// Handle CSV File Upload and client-side parsing
function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(evt) {
        const text = evt.target.result;
        parseCSVText(text);
    };
    reader.readAsText(file);
    csvFileInput.value = ""; // Reset file input
}

function parseCSVText(text) {
    try {
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) throw new Error("File is empty or contains no headers.");
        
        // Simple header parser
        const headers = lines[0].split(",").map(h => h.trim().replace(/^["']|["']$/g, ''));
        const required = ['roll_no', 'name', 'G1', 'G2', 'G3'];
        const missing = required.filter(r => !headers.includes(r));
        
        if (missing.length > 0) {
            throw new Error(`Missing required CSV headers: ${missing.join(", ")}`);
        }
        
        const parsedRecords = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Basic comma split (does not handle nested commas inside quotes, but fine for student names here)
            const cols = line.split(",").map(c => c.trim().replace(/^["']|["']$/g, ''));
            if (cols.length < headers.length) continue;
            
            const rawObj = {};
            headers.forEach((header, index) => {
                rawObj[header] = cols[index];
            });
            
            parsedRecords.push(processRecord(rawObj));
        }
        
        if (parsedRecords.length === 0) {
            throw new Error("No valid data records could be parsed.");
        }
        
        studentDb = parsedRecords;
        showToast(`Successfully uploaded & parsed ${studentDb.length} students!`, "success");
        applyFilters();
        
    } catch (err) {
        showToast(`CSV Load Error: ${err.message}`, "error");
        console.error(err);
    }
}

// Perform statistical dashboard calculations
function calculateStatistics(activeList) {
    if (activeList.length === 0) {
        kpiTotalStudents.textContent = "0";
        kpiMeanScore.innerHTML = `0.00 <span class="kpi-unit">/ 20</span>`;
        kpiMedianStd.textContent = "0.0 | σ 0.00";
        kpiTopperName.textContent = "-";
        kpiTopperScore.textContent = "Highest score: N/A";
        renderEmptyChart();
        return;
    }
    
    const count = activeList.length;
    kpiTotalStudents.textContent = count;
    
    // G3 Scores Analysis
    const g3Scores = activeList.map(s => s.G3);
    
    // Mean calculation
    const mean = g3Scores.reduce((sum, val) => sum + val, 0) / count;
    kpiMeanScore.innerHTML = `${mean.toFixed(2)} <span class="kpi-unit">/ 20</span>`;
    
    // Median calculation
    const sorted = [...g3Scores].sort((a, b) => a - b);
    let median = 0;
    if (count % 2 === 1) {
        median = sorted[Math.floor(count / 2)];
    } else {
        const mid = count / 2;
        median = (sorted[mid - 1] + sorted[mid]) / 2.0;
    }
    
    // Standard Deviation calculation
    const variance = g3Scores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / count;
    const stdDev = Math.sqrt(variance);
    
    kpiMedianStd.textContent = `${median.toFixed(1)} | σ ${stdDev.toFixed(2)}`;
    
    // Topper Calculation (based on percentage total)
    let topper = activeList[0];
    for (let i = 1; i < activeList.length; i++) {
        if (activeList[i].percentage > topper.percentage) {
            topper = activeList[i];
        }
    }
    
    kpiTopperName.textContent = topper.name;
    kpiTopperScore.textContent = `${topper.percentage.toFixed(1)}% (Roll ${topper.roll_no})`;
    
    // Render distributions
    renderDistributionChart(activeList);
}

// Render Grade distribution bars
function renderDistributionChart(activeList) {
    const grades = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    activeList.forEach(s => {
        if (grades[s.grade] !== undefined) grades[s.grade]++;
    });
    
    const total = activeList.length;
    distributionChart.innerHTML = "";
    
    Object.keys(grades).forEach(g => {
        const count = grades[g];
        const pct = total > 0 ? (count / total) * 100 : 0;
        
        const barGroup = document.createElement("div");
        barGroup.className = "chart-bar-group";
        barGroup.innerHTML = `
            <div class="chart-label">Grade ${g}</div>
            <div class="chart-track">
                <div class="chart-fill chart-fill-${g}" style="width: ${pct}%"></div>
            </div>
            <div class="chart-count">${count} <span>(${pct.toFixed(1)}%)</span></div>
        `;
        distributionChart.appendChild(barGroup);
    });
}

function renderEmptyChart() {
    distributionChart.innerHTML = `<div class="chart-empty-state text-muted">No data available. Load a dataset.</div>`;
}

// Register a manual student record addition
function handleAddStudent(e) {
    e.preventDefault();
    
    const roll = document.getElementById("inputRoll").value.trim();
    const name = document.getElementById("inputName").value.trim();
    const school = document.getElementById("selectSchool").value;
    const sex = document.getElementById("selectSex").value;
    const age = parseInt(document.getElementById("inputAge").value) || 16;
    const studytime = parseInt(document.getElementById("inputStudy").value) || 2;
    const absences = parseInt(document.getElementById("inputAbsences").value) || 0;
    const g1 = parseFloat(document.getElementById("inputG1").value) || 0;
    const g2 = parseFloat(document.getElementById("inputG2").value) || 0;
    const g3 = parseFloat(document.getElementById("inputG3").value) || 0;
    
    // Validations
    if (!roll || !name) {
        showToast("Error: Roll number and name are required fields.", "error");
        return;
    }
    
    const exists = studentDb.some(s => s.roll_no === roll);
    if (exists) {
        showToast(`Warning: Roll Number '${roll}' already exists. Use a unique identifier.`, "warning");
        return;
    }
    
    if (g1 < 0 || g1 > 20 || g2 < 0 || g2 > 20 || g3 < 0 || g3 > 20) {
        showToast("Error: Grade marks G1, G2, G3 must be bounded between 0 and 20.", "error");
        return;
    }
    
    const newStudent = processRecord({
        roll_no: roll,
        name: name,
        school: school,
        sex: sex,
        age: age,
        studytime: studytime,
        failures: 0,
        absences: absences,
        G1: g1,
        G2: g2,
        G3: g3
    });
    
    studentDb.push(newStudent);
    showToast(`Successfully registered student record for '${name}'!`, "success");
    addStudentForm.reset();
    applyFilters();
}

// Delete individual student record from state
function deleteRecord(rollNo) {
    const index = studentDb.findIndex(s => s.roll_no === rollNo);
    if (index === -1) return;
    
    const sName = studentDb[index].name;
    studentDb.splice(index, 1);
    showToast(`Deleted student record for '${sName}'`, "info");
    applyFilters();
}

// Search and Filtering Pipeline
function getFilteredRecords() {
    const searchVal = filterSearchInput.value.toLowerCase().trim();
    const gradeVal = filterGradeSelect.value;
    const minPct = parseFloat(filterPctSlider.value) || 0;
    
    return studentDb.filter(s => {
        // Search matches
        const matchesSearch = s.roll_no.toLowerCase().includes(searchVal) || s.name.toLowerCase().includes(searchVal);
        // Grade matches
        const matchesGrade = gradeVal === "ALL" || s.grade === gradeVal;
        // Percentage slider matches
        const matchesPct = s.percentage >= minPct;
        
        return matchesSearch && matchesGrade && matchesPct;
    });
}

function applyFilters() {
    const filtered = getFilteredRecords();
    
    // Sort
    filtered.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        
        // Handle numerical roll values logically
        if (sortColumn === "roll_no") {
            const numA = parseInt(valA) || 0;
            const numB = parseInt(valB) || 0;
            return sortAscending ? numA - numB : numB - numA;
        }
        
        if (typeof valA === "string") {
            return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
            return sortAscending ? valA - valB : valB - valA;
        }
    });
    
    renderTable(filtered);
    calculateStatistics(filtered);
    
    recordCountText.textContent = `Showing ${filtered.length} of ${studentDb.length} records`;
}

function resetFilters() {
    filterSearchInput.value = "";
    filterGradeSelect.value = "ALL";
    filterPctSlider.value = 0;
    pctValText.textContent = "0%";
    showToast("Filters reset successfully.");
    applyFilters();
}

// Render dynamic rows in directory table
function renderTable(list) {
    studentTableBody.innerHTML = "";
    
    if (list.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="11" class="td-empty text-muted">No student records match the active filter criteria.</td>
            </tr>
        `;
        return;
    }
    
    list.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.roll_no}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.school}</td>
            <td>${s.sex}</td>
            <td>${s.age}</td>
            <td>${s.G1}</td>
            <td>${s.G2}</td>
            <td>${s.G3}</td>
            <td>${s.percentage.toFixed(1)}%</td>
            <td><span class="td-grade grade-${s.grade}">${s.grade}</span></td>
            <td>
                <button class="btn-delete" title="Remove student record">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
            </td>
        `;
        
        // Add event listener to delete button
        tr.querySelector(".btn-delete").addEventListener("click", () => {
            deleteRecord(s.roll_no);
        });
        
        studentTableBody.appendChild(tr);
    });
}

// Handles column sorting changes
function handleSort(column) {
    if (sortColumn === column) {
        sortAscending = !sortAscending;
    } else {
        sortColumn = column;
        sortAscending = true;
    }
    
    // Update headers visuals
    document.querySelectorAll("#studentTable th[data-sort]").forEach(th => {
        th.className = "";
        if (th.getAttribute("data-sort") === sortColumn) {
            th.className = sortAscending ? "asc" : "desc";
        }
    });
    
    applyFilters();
}

// Generate and trigger download of filtered CSV
function exportFilteredData() {
    const filtered = getFilteredRecords();
    if (filtered.length === 0) {
        showToast("Error: No data available under active filters to export.", "error");
        return;
    }
    
    try {
        const csvRows = [];
        // Header
        csvRows.push(['roll_no', 'name', 'school', 'sex', 'age', 'studytime', 'absences', 'G1', 'G2', 'G3', 'Percentage', 'Grade'].join(','));
        
        // Content
        filtered.forEach(s => {
            const row = [
                s.roll_no,
                `"${s.name.replace(/"/g, '""')}"`,
                s.school,
                s.sex,
                s.age,
                s.studytime,
                s.absences,
                s.G1,
                s.G2,
                s.G3,
                s.percentage.toFixed(2),
                s.grade
            ];
            csvRows.push(row.join(','));
        });
        
        const csvBlob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const csvUrl = URL.createObjectURL(csvBlob);
        
        const link = document.createElement("a");
        link.setAttribute("href", csvUrl);
        link.setAttribute("download", `filtered_students_${new Date().toISOString().slice(0,10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast(`Exported ${filtered.length} student rows to CSV file successfully!`, "success");
    } catch (e) {
        showToast(`Export failed: ${e.message}`, "error");
    }
}
