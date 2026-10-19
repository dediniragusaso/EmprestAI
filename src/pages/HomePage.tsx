import { useQuery } from '@tanstack/react-query';
import { getMe } from '../lib/api';
import { supabase } from '../lib/supabase';

export function HomePage() {
  const { data, isPending, isError } = useQuery({ queryKey: ['me'], queryFn: getMe });

  return (
    <div>
      <header className="nav">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <span>
            EMPREST<span className="text-accent">.AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-[13.5px]">
          <span className="text-fg/70">{data?.email ?? ''}</span>
          <button type="button" className="btn btn-ghost" onClick={() => void supabase.auth.signOut()}>
            Sair
          </button>
        </div>
      </header>
      <main className="px-10 py-9">
        <h1 className="text-[30px] font-semibold tracking-tight">Olá</h1>
        <p className="mt-2 text-[14px] text-fg/55">
          {isPending && 'Carregando…'}
          {isError && 'Não foi possível consultar a API.'}
          {data && `Sessão ativa como ${data.email ?? data.id}. O catálogo chega na próxima fatia.`}
        </p>
      </main>
    </div>
  );
}
