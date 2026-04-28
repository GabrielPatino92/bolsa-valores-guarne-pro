import { createAuthService } from './service.js';
import { loginSchema, refreshSchema, registerSchema } from './schemas.js';
import { createJwtService } from '../../infra/security/jwt.js';
import { passwordHasher } from '../../infra/security/password-hasher.js';

function buildRequestMeta(request) {
  return {
    ipAddress: request.ip ?? null,
    userAgent: request.headers['user-agent'] ?? null
  };
}

export async function authRoutes(app) {
  const jwtService = createJwtService({ fastify: app, env: app.config });
  const authService = createAuthService({
    userRepository: app.userRepository,
    refreshTokenRepository: app.refreshTokenRepository,
    hashPassword: passwordHasher.hash,
    verifyPassword: passwordHasher.verify,
    issueAccessToken: (user) => jwtService.issueAccessToken(user),
    issueRefreshToken: (user) => jwtService.issueRefreshToken(user),
    verifyRefreshToken: (refreshToken) =>
      jwtService.verifyRefreshToken(refreshToken)
  });

  app.post('/register', async (request, reply) => {
    const payload = registerSchema.parse(request.body ?? {});
    const result = await authService.register(payload, buildRequestMeta(request));
    return reply.code(201).send(result);
  });

  app.post('/login', async (request) => {
    const payload = loginSchema.parse(request.body ?? {});
    return authService.login(payload, buildRequestMeta(request));
  });

  app.post('/refresh', async (request) => {
    const payload = refreshSchema.parse(request.body ?? {});
    return authService.refresh(payload, buildRequestMeta(request));
  });
}
