# VS Code, GitHub and Moodle submission

Taisen Marainump | 250692

This is the **integrated final version**, based on your supplied Lab 2 Part 2 source.
Use this version for Lab 3; the earlier generic Lab3-Extension and unintegrated Part 1 kits are
historical drafts, not the final submission. Keep earlier lab folders and commits for progression.

## 1. Extract and run

Extract IS305_250692_Lab3_Complete.zip into Downloads. Open the extracted
IS305_250692_Lab3_Complete folder in VS Code. It contains DiningApp.js directly.

From PowerShell:

```powershell
cd "C:\Users\ID250692\Downloads\IS305_250692_Lab3_Complete"
npm test
npm run demo:part1
npm run demo:part2
npm start
```

If extraction produced an extra nested folder, open the inner folder containing package.json.
No dependency installation is needed.

## 2. Copy the complete source into the existing IS305 repository

The previously recorded repository is C:\Users\ID250692\Downloads\IS305-250692.
Check that it remains your current clone. The following stages this extended source as a
Lab 3 milestone alongside the earlier lab folders, without altering their submitted snapshots:

```powershell
New-Item -ItemType Directory -Path "C:\Users\ID250692\Downloads\IS305-250692\IS305_250692_Lab3_Complete" -Force
Copy-Item -Path "C:\Users\ID250692\Downloads\IS305_250692_Lab3_Complete\*" -Destination "C:\Users\ID250692\Downloads\IS305-250692\IS305_250692_Lab3_Complete" -Recurse -Force
```

This folder is the extension of the same supplied Student/MealBooking application, not another
unrelated application. It includes all modified source files for a self-contained Moodle ZIP.

## 3. Verify and push

```powershell
cd "C:\Users\ID250692\Downloads\IS305-250692"
npm --prefix IS305_250692_Lab3_Complete test
git status
git remote -v
git add IS305_250692_Lab3_Complete
git diff --cached --stat
git commit -m "Complete Lab 3 credit accounts and Student booking payments"
git push -u origin HEAD
```

The origin remote should already point to your IS305 repository. Do not run git init or add a
second origin in this existing clone. If the local repository moved, substitute its actual path.
After pushing, open GitHub, select the branch you pushed and verify that Student.js,
MealBooking.js, DiningApp.js and all three account files appear in the final folder.

If Git says “nothing to commit”, check that the files are already committed and then run git push.
If the push is rejected because the remote has new commits, first ensure your working tree is
clean. On a branch with the correct upstream configured, use git pull --rebase, resolve any
reported conflicts and then git push. Do not use force push to bypass the error.

## 4. Moodle submission

Upload the supplied IS305_250692_Lab3_Complete.zip, which contains the actual integrated
source, README and test evidence. Include the GitHub repository URL and point the assessor
to the IS305_250692_Lab3_Complete folder on the branch you pushed. The actual username
and Moodle submission URL were not supplied and are not invented here.

Check the final deadline's calendar date in Moodle. The Part 2 brief specifies 11:59 PM on
that displayed date. The detailed Part 1 checkpoint states 10:00 PM.

If you change the source after downloading, rerun npm test and create a fresh ZIP of the final
source folder so the Moodle ZIP and GitHub commit show the same version.

GitHub command reference:
https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
