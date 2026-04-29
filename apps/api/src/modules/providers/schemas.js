import { z } from 'zod';
import { PROVIDER_NAMES } from '../../integrations/providers/registry.js';

export const providerNameSchema = z.object({
  providerName: z.enum(PROVIDER_NAMES)
});
