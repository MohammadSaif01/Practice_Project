# Branch Protection Checklist

Use this checklist on your default branch (`main`) in GitHub settings.

## Required Settings

- Require a pull request before merging
- Require at least 1 approving review
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Include administrators
- Restrict force pushes
- Do not allow deletions

## Suggested Required Status Checks

- `Backend Build Check`
- `Frontend Build Check`
- `Dockerfile Security Scan`
- `Trigger Render Deploy Hooks`
- `Verify Deployed Services`

## Recommended Repo Rules

- Enable secret scanning alerts
- Enable Dependabot alerts
- Enable Dependabot security updates
- Enable private vulnerability reporting
