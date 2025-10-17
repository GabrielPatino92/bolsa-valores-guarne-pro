import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserProvider } from './user-provider.entity';

export enum ProviderName {
  BINANCE = 'binance',
  OKX = 'okx',
  COINBASE = 'coinbase',
  GATEIO = 'gateio',
  IBKR = 'ibkr',
  ETORO = 'etoro',
  XTB = 'xtb',
  PEPPERSTONE = 'pepperstone',
  THINKORSWIM = 'thinkorswim',
  TRADINGVIEW = 'tradingview',
  METATRADER4 = 'metatrader4',
  METATRADER5 = 'metatrader5',
}

export enum ProviderType {
  CRYPTO = 'crypto',
  STOCKS = 'stocks',
  FOREX = 'forex',
  SOCIAL_TRADING = 'social_trading',
  CHARTING = 'charting',
  MULTI = 'multi',
}

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ProviderName,
    unique: true,
  })
  name: ProviderName;

  @Column({
    type: 'enum',
    enum: ProviderType,
  })
  type: ProviderType;

  @Column({ name: 'display_name', length: 100 })
  displayName: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'supports_testnet', default: false })
  supportsTestnet: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => UserProvider, (userProvider) => userProvider.provider)
  userProviders: UserProvider[];
}
