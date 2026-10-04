# Lab 2 Part 1 – Student Class and Constructor

**Student:** Taisen Marainump  
**Student ID:** 20260001  
**Unit:** IS305 Object-Oriented Programming

This project extends the existing Lab 1 Dining Meal Booking application by adding a `Student` class.

## Files

- `Student.js` – Student class with private fields, constructor, getters, setters, `getFullName()` and `displayInfo()`.
- `MealBooking.js` – existing Lab 1 MealBooking class.
- `DiningApp.js` – asks for student information, creates a Student object, and displays it.
- `README.md` – project instructions.

## Run

Open the folder in VS Code and run:

```bash
node DiningApp.js
```

Example input:

```text
Enter student ID: DWU2026001
Enter first name: Maria
Enter last name: Kila
```

Expected output:

```text
========================================
             STUDENT DETAILS
========================================
Student ID:   DWU2026001
Student Name: Maria Kila
========================================
```

## GitHub files required for the checkpoint

Commit and push:

- `Student.js`
- `MealBooking.js`
- `DiningApp.js`

Example commit:

```bash
git add Student.js MealBooking.js DiningApp.js
git commit -m "Add Student class for Lab 2"
git push
```
