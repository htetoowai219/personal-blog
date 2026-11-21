# Pull Request & Commit Templates

Standard formatting for PR bodies, commit messages, and branch naming for `fix-issue`.

---

## 1. Branch Naming Convention

- Bug fixes: `fix/issue-<num>-<short-slug>` (e.g., `fix/issue-42-session-timeout`)
- Features/Enhancements: `feat/issue-<num>-<short-slug>` (e.g., `feat/issue-108-export-csv`)

Keep `<short-slug>` to 2–4 lowercase words separated by hyphens.

---

## 2. Commit Message Structure

Follow Conventional Commits:

```text
<type>(<scope>): <summary in imperative present tense> (Closes #<num>)

[optional body explaining root cause and approach]
```

### Types
- `fix`: Bug fixes.
- `feat`: New features or significant enhancements.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `test`: Adding or correcting tests only.

### Example
```text
fix(auth): prevent token expiration race condition during refresh (Closes #42)

Add mutex lock around token refresh exchange to prevent concurrent requests
from issuing conflicting refresh tokens.
```

---

## 3. Pull Request Body Template

Use the following Markdown template when generating the PR body for `gh pr create`:

```markdown
## Summary
Resolves #<num> by <one-sentence summary of fix/implementation>.

## Root Cause / Technical Context
<!-- For bugs: explain why the issue occurred. For features: describe integration points. -->
<Concise technical explanation>

## Changes Made
- `<file1>`: <What was modified/added>
- `<file2>`: <What was modified/added>

## Verification
Executed local verification suites with zero regressions:
- `<typecheck command>`: Pass
- `<lint command>`: Pass
- `<test command>`: Pass (<N> passing, 0 failing)
- `<build command>`: Pass (if applicable)

Closes #<num>
```

---

## 4. GitHub Issue Auto-Closing Keywords

Always use `Closes #<num>` in the PR body. Supported alternatives:
- `Fixes #<num>`
- `Resolves #<num>`

Do not use manual issue close (`gh issue close`); let GitHub close the issue automatically when the PR is merged into the default branch.
