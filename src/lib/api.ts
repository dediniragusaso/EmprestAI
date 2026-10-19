import { env } from './env';
import { supabase } from './supabase';

export interface Me {
  id: string;
  email: string | null;
}

// Cliente escrito à mão só nesta fatia (dívida registrada em docs/specs/001-login).
export async function getMe(): Promise<Me> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${env.VITE_API_URL}/me`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Falha ao consultar a API (${res.status}).`);
  return (await res.json()) as Me;
}
