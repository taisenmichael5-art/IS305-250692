# Required JSON files
users.json, serviceRequests.json, requestHistory.json and auditLog.json initially contain empty arrays. Distinction uses these files and automatically saves approved changes. Use simulated records only. Do not store passwords, executable JavaScript or confidential information. Tests use separate temporary directories and never change these normal files.

Run `node CampusServiceApp.js --seed-demo --data-dir=data/practice` for an isolated demonstration. Practice folders and recovery/temporary files are ignored by Git. The four required normal JSON files are included in this ZIP and may be committed with simulated data. Review their contents before a commit.

A .pending-save.json journal briefly holds previous plain-data file contents during a four-file save. It is removed after completion. If a save is interrupted, the next storage operation restores the prior dataset before proceeding. This supports one running application process; concurrent writers are not supported.
