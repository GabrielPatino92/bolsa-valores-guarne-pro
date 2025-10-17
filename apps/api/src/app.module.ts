import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';
import { Provider } from './entities/provider.entity';
import { UserProvider } from './entities/user-provider.entity';

// Detectar la raíz del monorepo buscando hacia arriba desde el directorio actual
function findMonorepoRoot(): string {
  let currentDir = __dirname;

  // Intentar encontrar la raíz del monorepo (donde está pnpm-workspace.yaml)
  while (currentDir !== resolve(currentDir, '..')) {
    if (existsSync(join(currentDir, 'pnpm-workspace.yaml')) ||
        existsSync(join(currentDir, '.env.local'))) {
      return currentDir;
    }
    currentDir = resolve(currentDir, '..');
  }

  // Si no se encuentra, usar process.cwd()
  return process.cwd();
}

const monorepoRoot = findMonorepoRoot();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(monorepoRoot, '.env.local'),
        join(monorepoRoot, '.env'),
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'guarne_dev',
      password: 'guarne_dev_pass_2024',
      database: 'guarne_trading',
      entities: [User, Provider, UserProvider],
      autoLoadEntities: true,
      synchronize: false,
      logging: process.env.NODE_ENV === 'development',
    }),

    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ScheduleModule.forRoot(),
    PrometheusModule.register({
      path: '/api/v1/metrics',
      defaultMetrics: { enabled: true },
    }),
    AuthModule,
  ],
})
export class AppModule {}
