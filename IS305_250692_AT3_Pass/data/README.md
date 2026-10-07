# Runtime JSON directory

Distinction mode saves campus-data.json here automatically after successful changes.
Pass/Credit modes do not read or write this data. Runtime JSON files are excluded from Git.
Start with `npm run start:demo-data` to add synthetic demo data only when no saved file exists.
An invalid saved file stops startup with an error and is not overwritten.
