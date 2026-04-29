import { z } from 'zod';
import { PROVIDER_NAMES } from '../../integrations/providers/registry.js';

const providerSchema = z.enum(PROVIDER_NAMES);
const marketDataSymbolSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[A-Za-z0-9]+$/)
  .transform((value) => value.toUpperCase());
const marketDataTimeframeSchema = z.string().trim().min(1);

export const marketDataSymbolsQuerySchema = z.object({
  provider: providerSchema
});

export const marketDataCandlesQuerySchema = z
  .object({
    provider: providerSchema,
    symbol: marketDataSymbolSchema,
    timeframe: marketDataTimeframeSchema,
    limit: z.coerce.number().int().min(1).max(1000).default(500),
    startTime: z.coerce.number().int().positive().optional(),
    endTime: z.coerce.number().int().positive().optional()
  })
  .superRefine((value, context) => {
    if (
      value.startTime !== undefined &&
      value.endTime !== undefined &&
      value.endTime < value.startTime
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['endTime'],
        message: 'endTime must be greater than or equal to startTime'
      });
    }
  });

export const marketDataStreamQuerySchema = z.object({
  provider: providerSchema,
  symbol: marketDataSymbolSchema,
  timeframe: marketDataTimeframeSchema
});
