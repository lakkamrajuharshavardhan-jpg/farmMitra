import { z } from 'zod';

export const createFieldSchema = z.object({
  crop_type: z.string().min(1, 'Crop type is required'),
  sowing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Sowing date must be in YYYY-MM-DD format'),
  soil_type: z.string().min(1, 'Soil type is required'),
  location: z.string().min(1, 'Location or district name is required'),
  acreage: z
    .number({ invalid_type_error: 'Acreage must be a number' })
    .positive('Acreage must be greater than 0')
    .or(
      z.string().transform((val, ctx) => {
        const parsed = parseFloat(val);
        if (isNaN(parsed) || parsed <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Acreage must be a positive number',
          });
          return z.NEVER;
        }
        return parsed;
      })
    ),
  latitude: z
    .number()
    .optional()
    .or(z.string().optional().transform((val) => (val ? parseFloat(val) : undefined))),
  longitude: z
    .number()
    .optional()
    .or(z.string().optional().transform((val) => (val ? parseFloat(val) : undefined))),
});

export type CreateFieldInput = z.infer<typeof createFieldSchema>;
