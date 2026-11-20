---
name: de-slop
description: Removes AI-generated noise (narration comments, dead code/imports, debug logs, weak type casts, redundant wrappers) strictly within changed files. Do NOT use for feature refactors, bug fixes, or formatting-only Prettier runs.
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

# De-Slop (Diff-Scoped AI Hygiene)

Removes AI-generated boilerplate, narration comments, debug artifacts, and pointless wrappers strictly within targeted changes while strictly maintaining runtime behavior.

---

## 1. Diff-Only Scope Gate (Hard Token Boundary)

Never scan the whole repository. Inspect changed files only:
1. Run `git status --short`, `git diff --name-only`, and `git diff --cached --name-only`.
2. Ignore lockfiles, binaries, markdown docs, and build/generated output (`dist/`, `.next/`, `build/`, migrations) unless explicitly requested.
3. If working tree has uncommitted changes: target ONLY those modified files. Read diff hunks first; read surrounding lines only to verify symbol usage.
4. If working tree is clean and no path was passed: trigger the interactive question tool for target scope before reading files.

---

## 2. Interactive Grill (Native Picker First, Skip If Unambiguous)

Always prefer the runtime's interactive question tool (`ask_question`, `question`, `AskUserQuestion`, `request_user_input`). Fall back to text options only if no tool exists. Keep headers `<= 16` chars, recommended option first:

- `Target Scope` *(ask ONLY if tree is clean or staged vs unstaged is ambiguous)*:
  - `(Recommended) Uncommitted diff`
  - `Branch diff vs main`
  - `Last commit (HEAD~1)`
  - `Specific path`
- `Cleanup Level` *(ask once unless specified in prompt)*:
  - `(Recommended) Safe hygiene` — Strip narration comments, dead code/imports, debug logs, emojis, trivial `as any`.
  - `Structural tidy` — Safe hygiene plus inline single-use pass-through wrappers, flatten redundant `try/catch` rethrows, simplify over-indirection.

---

## 3. Explicit Cut vs. Keep Rules

### CUT (Remove or Simplify)
- **Narration Comments:** Next-line translations (`// Fetch user by ID`, `// Return 200 response`), step dividers (`// Step 1: ...`), ASCII banners (`// ======== ROUTES ========`).
- **Dead Code:** Unused imports, unused variables/parameters, unreachable branches, commented-out old code.
- **Debug Leftovers:** Stray `console.log`, `console.debug`, `print(...)`, `fmt.Println`, temporary test payloads.
- **Weak Type Escapes:** Unnecessary `as any`, `: any`, `@ts-ignore`, blanket `eslint-disable` where proper types or `unknown` narrowing works cleanly.
- **Redundant Error Logic:** `try { return await fn(); } catch (err) { throw err; }` rethrows, defensive null-checks on values already guaranteed non-null.
- **Emoji Clutter:** Decorative emojis inside code comments, error messages, or logs.
- **Pointless Indirection (Structural tidy only):** Single-use 1–2 line pass-through helpers obscuring direct flow, redundant local constant aliases.

### KEEP (Strictly Preserve)
- **Why Comments:** Non-obvious invariants, race condition details, OS/browser/API workarounds, regex intent, context-rich `TODO`/`FIXME`.
- **Intentional Observability:** Production structured loggers (`logger.info`, `logger.error`, Winston/Pino/NestJS `Logger`) and intentional error mapping.
- **Public API Docs:** Established JSDoc/TSDoc/docstrings matching codebase convention for public interfaces.
- **Swallowed Errors (`catch {}`):** Never silently remove or alter. Flag in report for human review.

---

## 4. Zero-Behavior-Change Invariant

- Never alter runtime semantics, HTTP status codes, response payloads, DB queries, public API signatures, or test assertions.
- If removing an unreferenced export, run a fast repo `grep` to ensure no external references exist before deleting.

---

## 5. Verification & Exception-Only Report

1. Detect and execute the workspace verification command (`tsc --noEmit`, linter, or targeted fast tests). Fix any failure immediately; never leave a broken build.
2. Output a concise exception-only report:
   - Summary: `Cleaned N files (removed X comments, Y dead imports/logs, Z type/wrapper fixes). Checks: <typecheck/lint status>.`
   - File breakdown: 1 bullet per modified file summarizing removals.
   - `Flagged for Manual Review`: List ONLY suspicious patterns left untouched (e.g., swallowed errors, complex `any` casts, questionable exports). Omit section if none.
