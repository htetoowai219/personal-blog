---
name: dockerize
description: Generates multi-stage Dockerfiles, .dockerignore, Compose with healthchecks, non-root users, and zero-localhost container networking. Do NOT use for Kubernetes/Helm, CI pipelines, or app business logic.
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

# Dockerize (Production & Dev Containers)

Generates clean multi-stage Dockerfiles, `.dockerignore`, `compose.yml`, and `.env.docker.example` tailored to the repository.

---

## 1. Targeted Discovery Gate (Strict Read Allowlist)

Before asking questions, inspect the repository cheaply using `glob` and `grep`:
- **Allowed reads:** Root and 1-level-deep manifests (`package.json`, `go.mod`, `pyproject.toml`, `Cargo.toml`), build configs (`tsconfig.json`, `vite.config.*`, `next.config.*`), `.env.example`, existing `Dockerfile*`/`*compose*.yml`, and `grep` matches for DB/cache/port env vars (`PORT`, `MONGO`, `DATABASE_URL`, `POSTGRES`, `REDIS`, `AMQP`).
- **Forbidden reads:** Presentational UI components, business controllers, tests, seed scripts, docs, and lockfiles.
- **Detect:** All runnable services (backend, frontend, worker), package manager (`npm`/`pnpm`/`bun`/`yarn`), stateful dependencies (MongoDB, PostgreSQL, Redis, etc.), and existing Docker files.

---

## 2. Interactive Grill (Native Picker First, 1 Compact Batch)

Print a 2-line detection summary:
```text
Services: <detected services> | Deps: <detected DB/cache> | Existing Docker: <none/found>
Ready to configure containerization.
```

**Interactive Tool First:** Call runtime question tool (`ask_question` in Antigravity, `question` in OpenCode, `AskUserQuestion` in Claude Code, `request_user_input` in Codex; plain text fallback ONLY if unavailable).

Ask ONLY relevant atomic questions (`<= 16` char headers, 2–4 options, recommended first):
1. `Docker Scope`:
   - `Full stack Compose (Recommended)` — Containerize app service(s) + stateful dependencies.
   - `Infra-only Compose` — Containerize ONLY DB/Redis/broker so apps run natively on host.
   - `Dockerfile only` — Single service production Dockerfile + `.dockerignore`, no Compose.
2. `Target Mode` *(skip if `Infra-only Compose`)*:
   - `Production (Recommended)` — Multi-stage compiled images, minimal runtime footprint.
   - `Local Dev` — Bind mounts + hot reload for active development.
   - `Both (Prod + Dev override)` — `compose.yml` for prod + `compose.dev.yml` for hot reload.
3. `Host Ports` *(skip if `Dockerfile only`)*:
   - `Env-overridable (Recommended)` — Map `${SERVICE_PORT:-default}:internal` so host conflicts resolve via `.env`.
   - `Fixed defaults` — Standard `6379:6379`, `5432:5432`, etc.
   - `Internal only (no host DB ports)` — Expose only app/web entry ports; keep DB/Redis strictly internal.
4. `Frontend Mode` *(ask ONLY if frontend exists AND `Full stack Compose` chosen)*:
   - `Prod container (Recommended)` — Nginx static bundle (Vite) or standalone Node server (Next.js).
   - `Keep frontend on host` — Containerize backend + infra only.
   - `Dev container` — Vite/Next dev server inside Docker.

Wait for answers before loading reference files or writing Docker files.

---

## 3. Lazy-Load Adapter Rule (Zero-Adapter Fallback)

- Load ONLY matching adapters from the Routing Table below. NEVER load unused adapters.
- **Zero-Adapter Fallback:** For runtimes without an adapter (Go, Python/FastAPI, Rust), apply universal hardening rules directly using idiomatic multi-stage patterns (e.g. Go `golang:1.xx-alpine` -> `distroless`/`alpine`, Python `python:3.xx-slim` with non-root user).

---

## 4. Non-Negotiable Container Engineering Rules

Enforce every rule that applies to the selected mode:
- **Container Networking (Zero `localhost` Bugs):** Inside Compose, service-to-service URLs MUST reference Compose service names (`redis://redis:6379`, `mongodb://mongo:27017/app`, `postgresql://user:pass@postgres:5432/app`). Never leave `localhost` or `127.0.0.1` in container env templates; keep host-side vs container-side `.env.docker.example` crystal clear.
- **Healthchecks & Startup Order:** Every stateful service (DB, Redis, broker) MUST declare a working `healthcheck`, and every dependent app service MUST use `depends_on: { <service>: { condition: service_healthy } }`.
- **Image Security & Size:**
  - Always create a strict `.dockerignore` per build context (`node_modules`, `.git`, `.env*`, `dist`, `.next`, `coverage`, `*.log`, `README.md`).
  - Pin major/minor base tags (`node:22-alpine`, `postgres:16-alpine`, `redis:7-alpine`)—never bare `:latest`.
  - Production images MUST use multi-stage builds, run as non-root `USER`, copy lockfiles before source for optimal layer caching, and use exec-form `CMD ["...", "..."]` (never shell-form `CMD npm start` which swallows `SIGTERM`).
  - **Secret Hygiene:** Never `COPY .env` into any image layer; pass runtime secrets via `env_file` or environment variables only.
- **Persistence & Clean Topology:** Use named Docker volumes for database/cache persistence, place all services on an explicit user-defined bridge network, and never overwrite existing real `.env` files (write `.env.docker.example` instead).
- **Linux Host Compatibility:** Avoid Docker-Desktop-only assumptions (`host.docker.internal` without explicit `extra_hosts: ["host.docker.internal:host-gateway"]`).

---

## 5. Verify & Compact Report

1. If `docker` CLI is installed, run `docker compose config --quiet` (or `docker compose -f ... config --quiet`) to validate YAML syntax and variable interpolation. Do NOT pull huge images or run full builds unless the user asks.
2. Print a compact handoff summary:
   - **Files Created/Updated:** Bullet list of paths.
   - **Service Table:** `Service | Internal Port | Host Port (Env Var) | Healthcheck`.
   - **Exact 3-Line Commands:**
     ```bash
     cp .env.docker.example .env.docker
     docker compose --env-file .env.docker up --build -d
     docker compose down -v
     ```

---

## 6. Lazy-Load Reference Routing Table

> [!IMPORTANT]
> **Token Optimization:** Load ONLY matching adapters. Never load unneeded reference files.

| Stack Component | Reference File | Purpose |
|---|---|---|
| **Node/TS Backend** | [Node/TS Adapter](references/node-ts.md) | Multi-stage Dockerfile, lockfile pruning, non-root user, ESM/CJS entrypoints. |
| **Vite/Next Frontend** | [Frontend Adapter](references/frontend-spa.md) | Nginx static runner, Next.js standalone output, build-time ARG vs runtime ENV. |
| **DB / Redis / Broker** | [Data Services](references/data-services.md) | Pinned images, named volume paths, env-overridable ports, verified healthchecks. |
