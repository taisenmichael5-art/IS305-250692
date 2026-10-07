# AT1 Part 2 – Complete Dining Meal Booking Feature

**Student:** Taisen Marainump  
**Student ID:** 20260001  
**Submission:** GitHub  
**Deadline:** Friday, 24 July 2026 at 11:59 PM

## Project Files

- `MealBooking.js` – contains the `MealBooking` class.
- `DiningApp.js` – contains console input, the bookings array, duplicate checking, menu, and tests.
- `package.json` – Node.js project information and run scripts.
- `README.md` – project instructions.

## Run the Application

Open the project folder in VS Code and open the terminal:

```bash
node DiningApp.js
```

or:

```bash
npm start
```

## Application Options

When the program starts:

1. **Create a booking** – manually enter student and meal information.
2. **Run required tests** – demonstrates valid, invalid, and duplicate bookings.
3. **Exit**

## Meal Prices

| Meal | Price |
|---|---:|
| Breakfast | K10.00 |
| Lunch | K15.00 |
| Dinner | K20.00 |

The total is calculated using:

`Total cost = meal price × quantity`

## Requirements Demonstrated

The application demonstrates:

- JavaScript class and objects
- Constructor
- Private fields
- Getters and setters
- `validate()`
- `calculateTotal()`
- `confirmBooking()`
- `cancelBooking()`
- `getSummary()`
- Node.js `readline`
- Error handling with `try...catch`
- JavaScript array storage
- Duplicate booking prevention
- Booking receipts
- Pending status by default

No database, file persistence, local storage, ORM, or external persistence service is used.
