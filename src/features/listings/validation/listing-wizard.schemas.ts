import { z } from 'zod';

type TFn = (key: string) => string;

function msg(t: TFn, key: string, fallback: string) {
  const v = t(key);
  return v && v !== key ? v : fallback;
}

export function createWizardBasicStepSchema(t: TFn) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, { message: msg(t, 'listing.form.title_required', 'Title is required') }),
    categoryId: z.coerce.number().optional(),
    brand: z.string().optional(),
    model: z.string().optional(),
    condition: z.string().optional(),
    authenticity: z.string().optional(),
    sku: z.string().optional(),
  });
}

export function createWizardDescriptionStepSchema() {
  return z.object({
    description: z.string().optional(),
  });
}

const specRowSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const sourceRowSchema = z.object({
  label: z.string(),
  url: z.string(),
  type: z.string(),
});

export function createWizardSpecsStepSchema() {
  return z.object({
    specs: z.array(specRowSchema),
  });
}

export function createWizardSourcesStepSchema() {
  return z.object({
    sources: z.array(sourceRowSchema),
  });
}
