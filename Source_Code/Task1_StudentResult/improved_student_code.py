import csv
import math
import os

# Global dictionary to store student records loaded from CSV
student_records = {}

# File path to the CSV file (dynamically resolved relative to this script's directory)
DATASET_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "student-data.csv")

def calculate_grade(percentage):
    """Utility function to calculate letter grade based on percentage."""
    if percentage >= 85:
        return 'A'
    elif percentage >= 70:
        return 'B'
    elif percentage >= 55:
        return 'C'
    elif percentage >= 40:
        return 'D'
    else:
        return 'F'

def load_data_from_csv():
    """Loads student records from the CSV file and calculates totals, percentages, and grades."""
    if not os.path.exists(DATASET_PATH):
        print(f"[Error] Dataset file '{DATASET_PATH}' not found in the current directory.")
        print("Please ensure the CSV file is placed in the same folder.")
        return False
    
    try:
        with open(DATASET_PATH, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                # G1, G2, and G3 are typically on a 0-20 scale in the Kaggle dataset
                roll_no = row['roll_no'].strip()
                name = row['name'].strip()
                g1 = float(row['G1'])
                g2 = float(row['G2'])
                g3 = float(row['G3'])
                
                # Percentage calculation based on maximum possible marks (60 points total)
                total_obtained = g1 + g2 + g3
                percentage = (total_obtained / 60.0) * 100.0
                grade = calculate_grade(percentage)
                
                # Load remaining Kaggle attributes as metadata for advanced search
                student_records[roll_no] = {
                    'name': name,
                    'school': row.get('school', 'N/A').strip(),
                    'sex': row.get('sex', 'N/A').strip(),
                    'age': int(row.get('age', 0)),
                    'studytime': int(row.get('studytime', 0)),
                    'absences': int(row.get('absences', 0)),
                    'G1': g1,
                    'G2': g2,
                    'G3': g3,
                    'total': total_obtained,
                    'percentage': percentage,
                    'grade': grade
                }
        print(f"[Success] Successfully loaded {len(student_records)} student records from {DATASET_PATH}.")
        return True
    except Exception as e:
        print(f"[Error] Failed to read CSV file. Details: {e}")
        return False

def add_new_student_manually():
    """Manually adds a student record and appends it to the CSV file to persist data."""
    print("\n--- Add New Student ---")
    roll_no = input("Enter Roll Number (e.g. 111): ").strip()
    if roll_no in student_records:
        print("[Warning] A student with this roll number already exists.")
        return
        
    name = input("Enter Full Name: ").strip()
    school = input("Enter School (GP/MS): ").strip().upper()
    sex = input("Enter Sex (F/M): ").strip().upper()
    
    try:
        age = int(input("Enter Age: "))
        studytime = int(input("Enter Weekly Study Time (1 to 4 hours scale): "))
        absences = int(input("Enter Number of Absences: "))
        g1 = float(input("Enter G1 Marks (0-20): "))
        g2 = float(input("Enter G2 Marks (0-20): "))
        g3 = float(input("Enter G3 Marks (0-20): "))
        
        if not (0 <= g1 <= 20 and 0 <= g2 <= 20 and 0 <= g3 <= 20):
            print("[Error] Marks must be between 0 and 20.")
            return
    except ValueError:
        print("[Error] Invalid numeric input. Please enter valid numbers.")
        return
        
    # Append to CSV
    try:
        file_exists = os.path.exists(DATASET_PATH)
        with open(DATASET_PATH, mode='a', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            # Write headers if file doesn't exist
            if not file_exists:
                writer.writerow(['roll_no','name','school','sex','age','studytime','failures','absences','G1','G2','G3'])
            writer.writerow([roll_no, name, school, sex, age, studytime, 0, absences, g1, g2, g3])
            
        print("[Success] Student record successfully saved to database.")
        # Reload to update the in-memory dictionary
        load_data_from_csv()
    except Exception as e:
        print(f"[Error] Could not save student to CSV: {e}")

def display_topper_details():
    """Finds and displays the student with the highest total percentage."""
    if not student_records:
        print("[Info] No student records loaded.")
        return
        
    topper_roll = max(student_records, key=lambda r: student_records[r]['percentage'])
    topper = student_records[topper_roll]
    
    print("\n================ TOPPER DETAILS ================")
    print(f" Roll Number: {topper_roll}")
    print(f" Student Name: {topper['name']}")
    print(f" School     : {topper['school']} | Age: {topper['age']} | Sex: {topper['sex']}")
    print(f" G1 Marks   : {topper['G1']}/20")
    print(f" G2 Marks   : {topper['G2']}/20")
    print(f" G3 Marks   : {topper['G3']}/20")
    print(f" Percentage : {topper['percentage']:.2f}%")
    print(f" Grade      : {topper['grade']}")
    print("================================================")

def search_by_roll_number():
    """Allows searching for a student by their unique Roll Number."""
    if not student_records:
        print("[Info] No student records loaded.")
        return
        
    roll_no = input("\nEnter Roll Number to Search: ").strip()
    if roll_no in student_records:
        s = student_records[roll_no]
        print(f"\nRecord Found for Roll Number '{roll_no}':")
        print(f"----------------------------------------")
        print(f" Name        : {s['name']}")
        print(f" School      : {s['school']} | Age: {s['age']}")
        print(f" Study Time  : {s['studytime']} hrs/week | Absences: {s['absences']}")
        print(f" Grade G1/G2 : {s['G1']}/20 , {s['G2']}/20")
        print(f" Final Grade : {s['G3']}/20 (G3)")
        print(f" Percentage  : {s['percentage']:.2f}%")
        print(f" Letter Grade: {s['grade']}")
        print(f"----------------------------------------")
    else:
        print(f"[Info] No student found with Roll Number '{roll_no}'.")

# =====================================================================
# CUSTOM FEATURE 1: Advanced Statistical Analysis & Grade Distribution
# =====================================================================
def run_statistical_dashboard():
    """
    Calculates detailed metrics (Mean, Median, Standard Deviation) 
    for G3 (final marks) and prints a simple text-based bar chart.
    """
    if not student_records:
        print("[Info] No student data to analyze.")
        return
        
    g3_scores = [s['G3'] for s in student_records.values()]
    num_students = len(g3_scores)
    
    # Calculate Mean
    mean_g3 = sum(g3_scores) / num_students
    
    # Calculate Median
    sorted_scores = sorted(g3_scores)
    if num_students % 2 == 1:
        median_g3 = sorted_scores[num_students // 2]
    else:
        median_g3 = (sorted_scores[(num_students // 2) - 1] + sorted_scores[num_students // 2]) / 2.0
        
    # Calculate Standard Deviation
    variance = sum((x - mean_g3) ** 2 for x in g3_scores) / num_students
    std_dev = math.sqrt(variance)
    
    # Calculate Grade Distribution Count
    grade_counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0}
    for s in student_records.values():
        grade_counts[s['grade']] += 1
        
    print("\n================ ANALYTICS DASHBOARD ================")
    print(f" Total Students Analyzed  : {num_students}")
    print(f" Mean Score (G3)         : {mean_g3:.2f} / 20")
    print(f" Median Score (G3)       : {median_g3:.2f} / 20")
    print(f" Highest Score (G3)      : {max(g3_scores):.2f} / 20")
    print(f" Lowest Score (G3)       : {min(g3_scores):.2f} / 20")
    print(f" Standard Deviation      : {std_dev:.2f}")
    print("\n--- Grade Distribution Chart ---")
    
    # Render ASCII Bar Chart for grade distribution
    for grade, count in grade_counts.items():
        bar = "*" * count
        percentage = (count / num_students) * 100
        print(f" Grade {grade} | {count:3d} ({percentage:5.1f}%) | {bar}")
    print("=====================================================")

# =====================================================================
# CUSTOM FEATURE 2: Filter and CSV Data Exporter
# =====================================================================
def export_filtered_data():
    """
    Filters student records by a specified minimum grade or percentage,
    displays them, and exports the matching subset to a new CSV file.
    """
    if not student_records:
        print("[Info] No student data to export.")
        return
        
    print("\n--- Export Filtered Student Data ---")
    print("Select filtering method:")
    print("1. Filter by Letter Grade (A, B, C, D, F)")
    print("2. Filter by Minimum Percentage threshold")
    
    choice = input("Enter choice (1-2): ").strip()
    filtered_list = []
    
    if choice == '1':
        target_grade = input("Enter Grade to filter (e.g. A): ").strip().upper()
        if target_grade not in ['A', 'B', 'C', 'D', 'F']:
            print("[Error] Invalid Grade choice.")
            return
        filtered_list = [(roll, s) for roll, s in student_records.items() if s['grade'] == target_grade]
        filter_desc = f"Grade_{target_grade}"
    elif choice == '2':
        try:
            min_percentage = float(input("Enter minimum percentage (0-100): "))
            if not (0 <= min_percentage <= 100):
                print("[Error] Percentage must be between 0 and 100.")
                return
            filtered_list = [(roll, s) for roll, s in student_records.items() if s['percentage'] >= min_percentage]
            filter_desc = f"Pct_Above_{int(min_percentage)}"
        except ValueError:
            print("[Error] Invalid percentage value.")
            return
    else:
        print("[Error] Invalid option selected.")
        return
        
    if not filtered_list:
        print("[Info] No student records match the filter criteria.")
        return
        
    print(f"\nFound {len(filtered_list)} matching student records:")
    print(f"{'Roll No':<8}{'Name':<20}{'G3 Score':<10}{'Percentage':<12}{'Grade':<5}")
    print("-" * 55)
    for roll, s in filtered_list:
        print(f"{roll:<8}{s['name']:<20}{s['G3']:<10.1f}{s['percentage']:<12.2f}{s['grade']:<5}")
        
    confirm = input("\nDo you want to export these results to a CSV file? (y/n): ").strip().lower()
    if confirm == 'y':
        export_filename = f"filtered_students_{filter_desc}.csv"
        try:
            with open(export_filename, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.writer(file)
                # Write header row
                writer.writerow(['Roll No', 'Name', 'School', 'Sex', 'Age', 'Study Time', 'Absences', 'G1', 'G2', 'G3', 'Percentage', 'Grade'])
                # Write data rows
                for roll, s in filtered_list:
                    writer.writerow([
                        roll, s['name'], s['school'], s['sex'], s['age'], 
                        s['studytime'], s['absences'], s['G1'], s['G2'], 
                        s['G3'], f"{s['percentage']:.2f}", s['grade']
                    ])
            print(f"[Success] Data exported successfully to '{export_filename}'.")
        except Exception as e:
            print(f"[Error] Failed to write to file: {e}")

def main():
    # Initial data load
    print("Initializing Student Result Management System...")
    load_data_from_csv()
    
    while True:
        print("\n================== MAIN MENU ==================")
        print(" 1. Display Topper Details")
        print(" 2. Search Student by Roll Number")
        print(" 3. Add New Student Manually")
        print(" 4. View Statistics & Distribution Chart (Custom)")
        print(" 5. Filter and Export Student Subset (Custom)")
        print(" 6. Reload Data from CSV File")
        print(" 7. Exit")
        print("===============================================")
        choice = input("Enter your choice (1-7): ").strip()
        
        if choice == '1':
            display_topper_details()
        elif choice == '2':
            search_by_roll_number()
        elif choice == '3':
            add_new_student_manually()
        elif choice == '4':
            run_statistical_dashboard()
        elif choice == '5':
            export_filtered_data()
        elif choice == '6':
            load_data_from_csv()
        elif choice == '7':
            print("\nExiting Student Result Management System. Goodbye!")
            break
        else:
            print("[Warning] Invalid menu option selected. Please choose between 1 and 7.")

if __name__ == '__main__':
    main()
