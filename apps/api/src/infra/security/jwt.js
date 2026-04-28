import { randomUUID } from 'node:crypto';

function buildClaims(user) {
  return {
    sub: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName
  };
}

function computeExpiration(duration) {
  const match = /^(\d+)([smhd])$/i.exec(duration.trim());

  if (!match) {
    throw new Error(`Unsupported JWT duration format: ${duration}`);
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const factors = {
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000
  };

  return new Date(Date.now() + amount * factors[unit]).toISOString();
}

export function createJwtService({ fastify, env }) {
  return {
    issueAccessToken(user) {
      return fastify.jwt.sign(buildClaims(user), {
        expiresIn: env.jwtExpiresIn
      });
    },
    issueRefreshToken(user) {
      const token = fastify.jwt.sign(
        {
          ...buildClaims(user),
          refreshId: randomUUID()
        },
        {
          expiresIn: env.jwtRefreshExpiresIn,
          key: env.jwtRefreshSecret
        }
      );

      return {
        token,
        expiresAt: computeExpiration(env.jwtRefreshExpiresIn)
      };
    },
    verifyRefreshToken(refreshToken) {
      return fastify.jwt.verify(refreshToken, {
        key: env.jwtRefreshSecret
      });
    }
  };
}
