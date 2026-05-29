# Student Result Management Dashboard

## 📚 Project Overview
This is a **high‑fidelity, glass‑morphic web dashboard** that visualizes student exam results. It reads a CSV file of student data, calculates percentages and grades, identifies the top‑scorer, and provides a searchable interface by roll number. The UI is built with **HTML5, vanilla CSS3, and JavaScript ES6** and runs entirely in the browser – no server or installation is required.

## ✨ Features
- **Dynamic CSV parsing** with native `FileReader` and `async/await`.
- **Real‑time calculations** (percentage, grade, class rank).
- **Search by Roll No.** – instant filtering as you type.
- **Responsive glass‑morphism design** with subtle hover animations.
- **Dark/Light mode toggle** (auto‑detects system preference).
- **Client‑side persistence** of the last uploaded CSV using `localStorage`.
- **Accessible** – proper ARIA labels, focus management, and color contrast.

## 🚀 Installation & Usage
1. **Open the dashboard** – double‑click `index.html` located at:
   ```
   Source_Code/Task1_StudentResult/index.html
   ```
   Or open it directly in any modern browser (Chrome, Edge, Firefox, Safari).
2. **Load a CSV** – click the **“Upload CSV”** button and select a file with the following columns (header row required):
   `roll_no, name, maths, physics, chemistry, english, school`
3. **Interact**:
   - The table populates automatically.
   - Use the **search box** to filter rows by roll number.
   - Click the **“Toggle Theme”** button to switch between dark and light modes.

## 🗂️ Project Structure
```
Task1_StudentResult/
├─ index.html        # Main HTML skeleton & UI layout
├─ style.css         # Premium glass‑morphic stylesheet
├─ app.js            # Core logic: CSV parsing, calculations, UI updates
└─ README.md         # You are reading it! 🎉
```

## 🏗️ Architecture
- **HTML** provides the static structure and semantic elements (`<table>`, `<form>`, `<header>`).
- **CSS** applies a glass‑morphic card layout, gradients, and micro‑animations using `transition` and `backdrop-filter`.
- **JavaScript** handles:
  - File input event → parse CSV → convert to objects.
  - Compute `percentage = (sum / maxScore) * 100` and assign grades.
  - Identify the topper (max percentage).
  - Render rows dynamically via `document.createElement`.
  - Search filtering using `Array.filter`.
  - Persist uploaded data in `localStorage` for session resume.

## 🤝 Contributing
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/awesome‑feature`).
3. Make your changes adhering to the existing code style (ES6 modules, BEM naming in CSS).
4. Open a Pull Request with a clear description of the improvement.

## 📜 License
This project is provided for educational purposes. Feel free to adapt, modify, and share it under the **MIT License** (or any license you prefer).

---
*Generated with AI assistance – prompts, model, and temperature details can be found in `Prompt_Log/prompt_history.md`.*
