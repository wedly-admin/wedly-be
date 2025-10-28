import { z } from 'zod';

export const CurrencyEnum    = z.enum(['RSD', 'EUR', 'USD']);
export const ItemStatusEnum  = z.enum(['TODO', 'IN_PROGRESS', 'DONE']);
export const GuestSideEnum   = z.enum(['BRIDE', 'GROOM', 'BOTH', 'OTHER']);
export const GuestStatusEnum = z.enum(['PENDING', 'COMING', 'NOT_COMING']);

