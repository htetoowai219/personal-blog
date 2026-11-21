---
name: fix-issue
description: "Resolves GitHub issues end-to-end: fetches context, inspects codebase, resolves ambiguity via interactive gate, implements fix on a dedicated branch, verifies locally, and opens a PR upon explicit approval. Do NOT use for untracked repos, direct default branch commits, or unapproved PR creation."
license: MIT
compatibility: Designed for Agent Skills-compatible tools (Claude Code, Cursor, Codex, Gemini CLI, OpenCode)
metadata:
  source: custom
  author: "how"
  version: "1.0.0"
allowed-tools:
  - read_file
  - run_command
  - edit_file
  - write_file
  - ask_question
---

# Fix Issue (Interactive GitHub Issue Resolver)

Resolves GitHub issues end-to-end via an interactive, gated workflow: intake, read-only exploration, approach disambiguation, isolated branch fix, verification, and user-approved PR creation.

---

## When to Use This Skill
- Resolving a bug or feature request tracked in a GitHub issue in the current repository.
- Investigating issue comments and reproducer steps directly via `gh` CLI.
- Implementing an isolated fix on a dedicated branch with full local verification and PR opening.

## When NOT to Use This Skill
- Ad-hoc local code edits without a tracking GitHub issue.
- Committing or pushing directly to `main`, `master`, or the repository default branch.
- Automated PR merging or closing issues without user review.

---

## Phase 1: Preflight & Issue Intake

1. **Environment & Tree Check:**
   - Run `git status` and `gh auth status`.
   - **Auth Gate:** If `gh` is unauthenticated or not found, STOP immediately:
     *"GitHub CLI (`gh`) is not installed or unauthenticated. Run `gh auth login` to continue."*
   - **Dirty Tree Gate:** If working tree has uncommitted changes, STOP and prompt the user via runtime interactive question tool to stash (`git stash`), commit, or abort before touching branches.
2. **Determine Target Issue:**
   - If issue number or URL was supplied: run `gh issue view <number> --comments`.
   - If no issue specified: run `gh issue list --limit 15` and prompt user to select target issue.
3. Read the issue title, description, labels, and all comments to capture symptoms, reproduction steps, or requested behavior.

---

## Phase 2: Read-Only Codebase Exploration

1. **Inspect Before Editing:**
   - Locate relevant code paths, configs, tests, and architectural patterns using `glob` and `grep`.
   - Inspect recent related commits via `git log -n 5 --oneline -- <relevant-files>`.
   - Check existing test setups (`package.json`, `Makefile`, pytest/cargo configs, etc.).
2. **Identify Technical Root Cause:**
   - For bugs: isolate the exact failure mechanism (failing condition, race, missing validation, wrong assumptions).
   - For enhancements/features: identify exact integration entrypoints, DTO/schema contracts, and routing.
3. **Strict Invariant:** Do NOT modify, stage, or delete any files during Phase 2.

---

## Phase 3: Ambiguity & Approach Gate

1. **Evaluate Ambiguity & Trade-offs:**
   - Check if issue requirements, edge cases, or acceptance criteria are underspecified.
   - Check if multiple viable architectural approaches exist (e.g. quick targeted patch vs. broader refactor, API contract shape, schema migrations).
2. **Disambiguation Gate (Mandatory Stop if Ambiguous):**
   - If ambiguous or trade-offs exist: **STOP immediately**.
   - Call runtime question tool (`ask_question` in Antigravity, `question` in OpenCode, `AskUserQuestion` in Claude Code, `request_user_input` in Codex; plain text fallback ONLY if unavailable).
   - Present:
     - Clear description of the ambiguity or trade-off.
     - 2–3 concise options (1–2 lines each) with pros/cons and a marked `(Recommended)` option.
   - Wait for explicit user decision before modifying code.
3. **Unambiguous Fast-Path:**
   - If the fix is clear, minimal, and unambiguous: state a 2–3 line execution plan and proceed directly to Phase 4.

---

## Phase 4: Branch, Implement & Verify

1. **Branch Creation:**
   - Detect repository default branch:
     ```bash
     gh repo view --json defaultBranchRef -q .defaultBranchRef.name
     ```
   - Fetch latest remote changes and checkout clean default branch:
     ```bash
     git fetch origin <default-branch> && git checkout <default-branch> && git pull origin <default-branch>
     ```
   - Create dedicated descriptive branch:
     - Bug fix: `git checkout -b fix/issue-<num>-<short-slug>`
     - Feature: `git checkout -b feat/issue-<num>-<short-slug>`
2. **Minimal & Idiomatic Implementation:**
   - Apply minimal, targeted fix matching existing codebase conventions.
   - Avoid unrelated refactoring or style drift.
   - Add regression test (for bugs) or unit/integration test coverage (for features).
3. **Local Verification:**
   - Run workspace verification suite (typecheck, linter, tests, build—whichever exist):
     - Node: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`
     - Python: `pytest`, `ruff check`, `mypy`
     - Go: `go test ./...`, `go vet ./...`
     - Rust: `cargo test`, `cargo check`
   - Fix all regressions before proceeding. Never advance with failing tests or broken builds.

---

## Phase 5: Pre-PR Report & Approval Gate (Mandatory Stop)

Before committing, pushing, or creating a PR, **STOP** and present a structured sign-off report:

```text
================================================================================
FIX VERIFICATION REPORT: Issue #<num>
================================================================================
1. Root Cause / Implementation Summary:
   <What caused the issue and how it was resolved>

2. Files Changed:
   <Concise list of modified/added files and role of each>
   git diff --stat summary:
   <output of git diff --stat>

3. Verification Results:
   - <Typecheck command>: Passed
   - <Lint command>: Passed
   - <Test suite command>: Passed (<N> tests passed)
   - <Build command>: Passed

4. Proposed PR Details:
   - Branch: <branch-name>
   - Commit Message: <type>(<scope>): <summary> (Closes #<num>)
   - PR Title: <title>
   - PR Body:
     ## Summary
     <1-2 sentences>
     ## Changes Made
     - <file>: <change>
     ## Verification
     <results>
     Closes #<num>
================================================================================
```

Ask the user:
> *"Approve to commit, push, and open this PR? (Or tell me what to adjust first.)"*

**Strict Gate:** Do NOT commit, push, or run `gh pr create` until the user provides explicit written approval. If adjustments are requested, apply changes, re-verify, and re-present Phase 5.

---

## Phase 6: Commit, Push & Open PR

Only after explicit user approval:
1. **Clean Commit:**
   - Stage relevant files: `git add <files>`.
   - Commit using Conventional Commits: `git commit -m "<type>(<scope>): <message> (Closes #<num>)"`.
2. **Push Branch:**
   ```bash
   git push -u origin <branch-name>
   ```
3. **Open Pull Request:**
   - Run `gh pr create` with structured title, body, and `--draft` if requested:
     ```bash
     gh pr create --title "<PR Title>" --body "<PR Body>"
     ```
   - See [PR Template & Formatting Guide](references/pr-template.md) for full body structure.
4. Print created PR URL and finish.

---

## Hard Guardrails

- **NEVER** commit or push directly to `main`, `master`, or the repository default branch.
- **NEVER** force-push (`--force` or `--force-with-lease`) unless explicitly requested by the user.
- **NEVER** execute `gh pr merge` — merging is strictly the repository owner's responsibility.
- **NEVER** manually close an issue with `gh issue close`. Always rely on `Closes #<num>` in the PR body.
- **NEVER** push to remote or open a PR without passing the Phase 5 interactive approval gate.
- **CLI Dependency:** Use `gh` CLI directly via `run_command`; do not assume GitHub MCP tools exist.

---

## References

For PR markdown layouts, commit conventions, and issue-closing keywords, see:
- [PR Template & Formatting Guide](references/pr-template.md)
