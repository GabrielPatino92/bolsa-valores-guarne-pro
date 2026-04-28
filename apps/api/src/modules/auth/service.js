import { createHash } from 'node:crypto';
import { conflictError, unauthorizedError } from '../../shared/errors/app-error.js';

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function assertUserIsActive(user) {
  if (user && user.isActive === false) {
    throw unauthorizedError('User account is disabled');
  }
}

export function createAuthService({
  userRepository,
  refreshTokenRepository,
  hashPassword,
  verifyPassword,
  issueAccessToken,
  issueRefreshToken,
  verifyRefreshToken
}) {
  async function persistRefreshToken({ user, requestMeta }) {
    const refresh = await issueRefreshToken(user);
    const storedToken = await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refresh.token),
      expiresAt: refresh.expiresAt,
      userAgent: requestMeta.userAgent,
      ipAddress: requestMeta.ipAddress
    });

    return {
      refreshToken: refresh.token,
      refreshTokenRecord: storedToken
    };
  }

  async function buildAuthResponse({ user, requestMeta }) {
    const accessToken = await issueAccessToken(user);
    const { refreshToken } = await persistRefreshToken({ user, requestMeta });

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken,
      tokenType: 'Bearer'
    };
  }

  return {
    async register(payload, requestMeta) {
      const existingEmail = await userRepository.findByEmail(payload.email);

      if (existingEmail) {
        throw conflictError('A user with that email already exists');
      }

      const existingUsername = await userRepository.findByUsername(payload.username);

      if (existingUsername) {
        throw conflictError('A user with that username already exists');
      }

      const passwordHash = await hashPassword(payload.password);
      const user = await userRepository.create({
        email: payload.email,
        username: payload.username,
        fullName: payload.fullName,
        passwordHash
      });

      return buildAuthResponse({ user, requestMeta });
    },

    async login(payload, requestMeta) {
      const user = await userRepository.findByEmail(payload.email);

      if (!user) {
        throw unauthorizedError('Invalid email or password');
      }

      assertUserIsActive(user);

      const passwordMatches = await verifyPassword(
        payload.password,
        user.passwordHash
      );

      if (!passwordMatches) {
        throw unauthorizedError('Invalid email or password');
      }

      return buildAuthResponse({ user, requestMeta });
    },

    async refresh(payload, requestMeta) {
      const claims = await verifyRefreshToken(payload.refreshToken);
      const storedToken = await refreshTokenRepository.findByTokenHash(
        hashToken(payload.refreshToken)
      );

      if (!storedToken) {
        throw unauthorizedError('Refresh token is no longer valid');
      }

      if (storedToken.revokedAt) {
        throw unauthorizedError('Refresh token has already been revoked');
      }

      if (new Date(storedToken.expiresAt).getTime() <= Date.now()) {
        throw unauthorizedError('Refresh token has expired');
      }

      if (storedToken.userId !== claims.sub) {
        throw unauthorizedError('Refresh token does not match the authenticated user');
      }

      const user = await userRepository.findById(claims.sub);

      if (!user) {
        throw unauthorizedError('Refresh token is no longer valid');
      }

      assertUserIsActive(user);

      const accessToken = await issueAccessToken(user);
      const nextRefresh = await persistRefreshToken({ user, requestMeta });
      await refreshTokenRepository.revoke({
        id: storedToken.id,
        replacedByTokenId: nextRefresh.refreshTokenRecord.id
      });

      return {
        user: sanitizeUser(user),
        accessToken,
        refreshToken: nextRefresh.refreshToken,
        tokenType: 'Bearer'
      };
    }
  };
}
