# 📊 Student Result Management System

## 📖 Project Overview
This repository contains a **high‑fidelity, glass‑morphic web dashboard** that visualises student exam results. The application runs completely in the browser – no server, no database, no installation required. Users can upload a CSV file containing student data, view real‑time statistics, filter/search records, and export the filtered data back to CSV.

## ✨ Features
- **CSV Upload & Parsing** – client‑side parsing with validation.
- **Statistical Metrics** – mean, median, standard deviation, and automatic identification of the class topper.
- **Dynamic Filtering & Search** – by roll number, name, grade, or custom percentage threshold.
- **Interactive Visualisations** – bar‑chart grade distribution, KPI cards, and responsive tables.
- **Add New Student** – inline registration form with strict input validation.
- **Export Functionality** – download the current view as a CSV file.
- **Premium UI** – dark glass‑morphism theme with smooth micro‑animations and full responsiveness.

## 🛠️ Technologies Used
- **HTML5** – semantic markup and accessible structure.
- **Vanilla CSS3** – custom glass‑morphism styling, CSS variables for theming, and Flex/Grid layouts.
- **JavaScript ES6** – module‑free script, `FileReader`, `localStorage`, and modern array methods.
- **Google Fonts – Inter** – clean, modern typography.

## 🚀 Installation Guide
1. **Clone or download** this repository.
2. Open the folder and locate `Source_Code/Task1_StudentResult/index.html`.
3. Double‑click `index.html` (or open it in any modern browser: Chrome, Edge, Firefox, Safari).
4. No additional dependencies or build steps are required.

## 👩‍💻 Usage Instructions
1. **Upload Data** – click **“Upload CSV”** and select a file with the following header columns:
   ```csv
   roll_no,name,maths,physics,chemistry,english,school
   ```
2. **Explore Statistics** – KPI cards display total students, average score, median, standard deviation, and the class topper.
3. **Filter & Search** – use the search box, grade dropdown, or slider to narrow results instantly.
4. **Add a Student** – fill the registration form at the bottom; validation ensures scores are within `0‑20`.
5. **Export** – click **“Export CSV”** to download the currently filtered data.

## 📈 Future Scope
- **Backend Integration** – persist data on a server (Node.js/Express) with a real database.
- **Authentication** – role‑based access for teachers and administrators.
- **Advanced Visualisations** – integrate charting libraries (Chart.js, D3.js) for richer graphs.
- **Multi‑Class Support** – handle multiple class cohorts and comparative analytics.
- **Accessibility Enhancements** – ARIA landmarks, keyboard navigation, and screen‑reader friendly labels.

---
*This README was generated with AI assistance. Prompts, model, and temperature details are recorded in `Prompt_Log/prompt_history.md`.*
