# Auth data model and JWT alignment

- **Date**: 2026-04-28
- **Issue**: #15
- **Status**: approved

## Problem

The new Fastify auth scaffold worked in memory but did not match the real PostgreSQL schema because `users.username` was required and refresh tokens were not persisted.

## Decisions

- `username` remains an explicit and required domain field.
- registration requires `email`, `username`, `fullName`, and `password`.
- login stays on `email + password`.
- refresh tokens are persisted and rotated through `auth_refresh_tokens`.
- OpenAPI, database bootstrap, and backend code must describe the same contract.

## Acceptance criteria

- [x] Register request includes `username`.
- [x] User responses include `username`.
- [x] Refresh tokens are persisted in PostgreSQL.
- [x] Refresh flow revokes the previous refresh token and issues a new one.
- [x] `/auth/register`, `/auth/login`, `/auth/refresh`, and `/users/me` work against the real database.
