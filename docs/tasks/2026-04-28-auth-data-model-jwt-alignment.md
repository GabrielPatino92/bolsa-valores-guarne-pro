# Task Plan - auth data model and JWT alignment

- **Date**: 2026-04-28
- **Issue**: #15

1. Keep `username` in the auth contract and PostgreSQL model.
2. Add `auth_refresh_tokens` to the bootstrap schema.
3. Update auth schemas, repositories, and service flow.
4. Persist and rotate refresh tokens.
5. Update OpenAPI.
6. Verify with in-memory smoke tests and a real PostgreSQL-backed auth flow.
