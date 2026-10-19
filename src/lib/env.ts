import { z } from 'zod';

const schema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
});

const parsed = schema.safeParse(import.meta.env);
if (!parsed.success) {
  const campos = parsed.error.issues.map((i) => i.path.join('.')).join(', ');
  throw new Error(`Variaveis de ambiente invalidas ou ausentes: ${campos}`);
}

export const env = parsed.data;
