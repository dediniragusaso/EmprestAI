import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { z } from 'zod';
import { useSession } from '../auth/session';
import { supabase } from '../lib/supabase';

const schema = z.object({
  email: z.string().min(1, 'Informe o e-mail.').email('E-mail inválido.'),
  password: z.string().min(1, 'Informe a senha.'),
});
type Values = z.infer<typeof schema>;

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden />
      <span>
        EMPREST<span className="text-accent">.AI</span>
      </span>
    </div>
  );
}

const STATS = [
  ['3', 'itens por pessoa'],
  ['14', 'dias de prazo'],
  ['0', 'linhas para preencher'],
] as const;

export function LoginPage() {
  const { session, loading } = useSession();
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  if (!loading && session) return <Navigate to="/" replace />;

  async function onSubmit(values: Values) {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) setAuthError('E-mail ou senha incorretos.');
  }

  return (
    <main className="login-grid">
      <section className="login-left">
        <div className="login-glow" aria-hidden />
        <div className="relative z-10">
          <Brand />
        </div>
        <div className="relative z-10 flex flex-col gap-4">
          <h1 className="login-title">
            Equipamentos de TI,
            <br />
            sem planilha.
          </h1>
          <p className="login-lead">
            Peça, acompanhe e devolva notebooks, monitores, cabos e câmeras em um só lugar.
          </p>
          <div className="login-stats">
            {STATS.map(([n, label]) => (
              <div key={label}>
                <div className="stat-n">{n}</div>
                <div className="stat-l">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-[12px] text-fg/40">Operações · TI interno</p>
      </section>

      <section className="login-right">
        <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <h2 className="text-[26px] font-semibold tracking-tight">Entrar</h2>
          <p className="text-[14px] text-fg/55">Use seu e-mail e senha para acessar.</p>

          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input id="email" type="email" autoComplete="email" className="input" {...register('email')} />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input"
              {...register('password')}
            />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          {authError && (
            <p role="alert" className="field-error">
              {authError}
            </p>
          )}

          <button type="submit" className="btn btn-primary btn-block h-10" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>

          <p className="text-[12.5px] text-fg/45">Cada pessoa vê apenas os próprios empréstimos.</p>
        </form>
      </section>
    </main>
  );
}
