# Run and push to your existing GitHub repository

Taisen Marainump | Student ID 250692

These instructions use the previously recorded local repository location:
`C:\Users\ID250692\Downloads\IS305-250692`.
If the folder moved, substitute its current path.

## 1. Extract the files

Extract the ZIP. Copy the entire `Lab3-Extension` directory directly into your existing
`IS305-250692` folder. It should sit alongside your earlier lab folders.
Do not copy a second .git directory or replace the earlier Lab 1/2 files.

## 2. Open the repository in Git Bash

```bash
cd /c/Users/ID250692/Downloads/IS305-250692
pwd
git status
git remote -v
git branch --show-current
```

The existing `origin` should point to your IS305 repository. The branch should be non-empty.
If you see “not a git repository”, locate your actual clone; do not run git init over the wrong folder.

## 3. Run the extension tests and demonstrations

```bash
cd Lab3-Extension
node --version
npm test
npm run demo:part1
npm run demo:part2
cd ..
```

Node.js 22+ is supported; this package was tested with Node.js 24.19.0.
No external packages or database setup are needed.

Account tests do not prove your original menu is integrated. Once the actual DiningApp is
extended, also run it using its existing command and test the complete booking flow.

## 4. Commit the account extension

```bash
git add Lab3-Extension
git diff --cached --stat
git commit -m "Add Lab 3 dining account hierarchy and payment helper"
```

This commit contains the extension kit. After final integration, stage the exact original files
that changed and make a second commit describing the connected booking workflow. Do not
claim the unintegrated kit is the complete assignment.

## 5. Push the current branch

For an existing configured origin, this avoids assuming the branch is named main or master:

```bash
git push -u origin HEAD
```

Complete GitHub sign-in if prompted. Then check:

```bash
git status
git log -1 --oneline
```

Open your existing GitHub repository and select the branch you pushed. Verify that the
Lab3-Extension directory contains the JavaScript files and README, not just a ZIP.

## If Git reports a missing author identity

Set your name and your actual GitHub email locally for this repository, then retry the commit:

```bash
git config user.name "Taisen Marainump"
git config user.email "YOUR_ACTUAL_GITHUB_EMAIL"
```

Replace the placeholder with your actual GitHub email or account's verified no-reply email.

## If origin is missing

Use the actual URL copied from your existing GitHub repository's Code button:

```bash
git remote add origin https://github.com/YOUR_USERNAME/IS305-250692.git
git push -u origin HEAD
```

Replace YOUR_USERNAME; the actual username/URL was not supplied. Only run the remote-add
command if `git remote -v` shows no origin. Do not add a second origin or point this code at
another course's repository.

## If the push is rejected because the remote branch has newer commits

First confirm your changes are committed and `git status` is clean. If the current branch
tracks its corresponding origin branch:

```bash
git pull --rebase
git push
```

If conflicts occur, resolve the named files, then use `git add <resolved-files>` and
`git rebase --continue`; use `git rebase --abort` if you need to return to the pre-rebase state.
Do not use force push to bypass rejection. If there is no upstream yet, first inspect the
remote branch names with `git branch -r` and use the matching branch rather than guessing.

## GitHub documentation

GitHub. Adding locally hosted code to GitHub.
https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github

GitHub. Pushing commits to a remote repository.
https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository
