# Lab 2 Part 2 – Student and Meal Booking Integration

**Student:** Taisen Marainump  
**Student ID:** 20260001  
**Unit:** IS305 Object-Oriented Programming

This project completes the Lab 2 Credit-level extension of the Dining Meal Booking application.

## Core Object Relationship

`Student` owns the student's identity:

- student ID
- first name
- last name

`MealBooking` does **not** copy the student's ID and name. It stores a reference to the actual `Student` object.

This means that when the Student object's first or last name changes, existing MealBooking objects automatically display the updated name.

## Files

- `Student.js`
- `MealBooking.js`
- `DiningApp.js`
- `README.md`
- `package.json`

## Run

```bash
node DiningApp.js
```

Then choose:

- `1` – interactive application
- `2` – run all required assessment tests
- `3` – exit

## Required Features Included

- Student private fields
- Student getters and controlled setters
- `getFullName()`
- `displayInfo()`
- MealBooking stores `#student`
- validation that `student` is a real Student object
- meal validation
- `calculateTotal()`
- `confirmBooking()`
- `cancelBooking()`
- `getSummary()`
- JavaScript booking array
- duplicate booking prevention
- `displayBookingHistory(student, bookingArray)`
- total booking count
- combined booking cost
- controlled first-name and last-name updates
- shared object-reference demonstration
- error handling
- all five required tests

## Meal Prices

| Meal | Price |
|---|---:|
| Breakfast | K10.00 |
| Lunch | K15.00 |
| Dinner | K20.00 |

## Required Test Mode

Choose option `2` after starting the program.

The tests demonstrate:

1. valid Student object;
2. invalid Student information;
3. Student and MealBooking integration;
4. updated Student name appearing in existing bookings;
5. booking history.

A duplicate booking check is also included.

## Storage Restriction

This project uses only JavaScript objects and arrays.

It does **not** use MongoDB, MySQL, Mongoose, SQLite, files, local storage, an ORM, or any other database/persistence service.

## GitHub

From your existing IS305 repository:

```bash
git add Student.js MealBooking.js DiningApp.js README.md package.json
git commit -m "Complete Lab 2 Student and MealBooking integration"
git push
```
