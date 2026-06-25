# Inventory Management Tauri

Monorepo for a inventory management desktop application built with Tauri, React, Fastify, MongoDB, and Redis.

## Packages

- `apps/api`: Fastify backend API with MongoDB and Redis integration
- `apps/desktop`: Tauri desktop client using React and TanStack
- `packages/shared`: Shared types and validation schemas

## Local API Setup

1. Copy `apps/api/.env.example` to `apps/api/.env`.
2. Set `JWT_SECRET`, `MONGODB_URI`, and `REDIS_URL` for your environment.
3. Run `npm run dev:api` from the repo root.

The API loads `apps/api/.env` first and falls back to a workspace root `.env` if present.
