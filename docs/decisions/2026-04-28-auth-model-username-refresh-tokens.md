# Decision - auth keeps username and persists refresh tokens

- **Date**: 2026-04-28
- **Context**: issue #15

## Decision

The auth model keeps `username` as a required field and introduces a persisted `auth_refresh_tokens` table with refresh-token rotation.

## Why

1. The existing domain schema already treats `username` as a first-class identifier.
2. Removing `username` would weaken future profile, ranking, and competition features.
3. Stateless refresh tokens are too weak for revocation, logout, and session audit.
