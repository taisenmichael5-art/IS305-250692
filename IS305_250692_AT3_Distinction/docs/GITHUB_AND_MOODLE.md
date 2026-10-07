# GitHub and Moodle — Distinction final edition

Extract IS305_250692_AT3_Distinction into Downloads. Open the folder in VS Code; run npm test and the demonstration first. Exit the menu with option 10 before Git commands. If a Git log/diff ends with (END), press q.

## Existing IS305 repository
Your earlier repository path was C:\Users\ID250692\Downloads\IS305-250692. Keep the final Distinction project in its own folder alongside earlier checkpoints. Copy once if the destination does not already exist:
```powershell
Copy-Item -Path "C:\Users\ID250692\Downloads\IS305_250692_AT3_Distinction" -Destination "C:\Users\ID250692\Downloads\IS305-250692" -Recurse
cd "C:\Users\ID250692\Downloads\IS305-250692\IS305_250692_AT3_Distinction"
npm test
cd ..
git status
git remote -v
git add -- IS305_250692_AT3_Distinction
git diff --cached --stat
git commit -m "Complete AT3 Distinction four-file repositories, audit, polymorphism and reports"
git push
```
If the destination already exists, update it carefully rather than creating another nested folder. Inspect the four normal JSON files before committing: only simulated data is allowed. The supplied files start as empty arrays. Source, tests, documentation, evidence and these four data files should be included; practice directories, recovery journal and temporary files are ignored.

If there is no upstream, run git branch --show-current and then git push -u origin YOUR_BRANCH_NAME, replacing the placeholder with the actual branch. If no origin is configured, use your actual repository URL with git remote add origin YOUR_REPOSITORY_URL. Do not type placeholders literally. If the remote has new work, use git pull --rebase, resolve conflicts, rerun tests and push. Avoid force-push. Open GitHub and verify the latest commit and final project folder.

## Moodle
Use this Distinction ZIP as the final integrated source submission: it includes the Pass and Credit foundations, not just extension fragments. Provide the GitHub repository URL and ZIP as required. Confirm the exact Week 14 Friday 11:59 PM date in Moodle. README and the technical report describe all three progressive components. Keep earlier checkpoints as history, but identify IS305_250692_AT3_Distinction as the final edition.
