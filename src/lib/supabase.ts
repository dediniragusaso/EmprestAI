import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Somente sessão (ADR-001 §7): dados nunca vêm do Supabase direto no navegador.
export const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
