import { randomUUID } from 'node:crypto';

export function createMemoryRefreshTokenRepository(seed = []) {
  const tokens = new Map();

  for (const token of seed) {
    tokens.set(token.id, token);
  }

  return {
    async create({ userId, tokenHash, expiresAt, userAgent = null, ipAddress = null }) {
      const token = {
        id: randomUUID(),
        userId,
        tokenHash,
        expiresAt,
        revokedAt: null,
        replacedByTokenId: null,
        userAgent,
        ipAddress,
        createdAt: new Date().toISOString()
      };
      tokens.set(token.id, token);
      return token;
    },
    async findByTokenHash(tokenHash) {
      return [...tokens.values()].find((token) => token.tokenHash === tokenHash) ?? null;
    },
    async revoke({ id, replacedByTokenId = null }) {
      const token = tokens.get(id) ?? null;

      if (!token) {
        return null;
      }

      token.revokedAt = new Date().toISOString();
      token.replacedByTokenId = replacedByTokenId;
      return token;
    }
  };
}
