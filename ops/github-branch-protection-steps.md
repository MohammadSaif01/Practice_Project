# GitHub Branch Protection Setup (Step-by-Step)

## Target

Protect default branch (`main`) so untested code cannot be merged.

## Steps

1. Open repository in GitHub.
2. Go to `Settings`.
3. In left menu, open `Branches`.
4. Under `Branch protection rules`, click `Add rule`.
5. Branch name pattern: `main`.

## Enable These Options

- Require a pull request before merging
- Require approvals: `1`
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators
- Restrict force pushes
- Do not allow deletions

## Required Status Checks to Select

- `Backend Build Check`
- `Frontend Build Check`
- `Dockerfile Security Scan`
- `Trigger Render Deploy Hooks`
- `Verify Deployed Services`

## Finalize

1. Click `Create` / `Save changes`.
2. Test by opening a PR with a failing check; merge should be blocked.
