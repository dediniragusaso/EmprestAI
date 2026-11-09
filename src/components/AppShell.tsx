import { useQuery } from '@tanstack/react-query';
import { NavLink, Outlet } from 'react-router-dom';
import { getMe } from '../lib/api';
import { supabase } from '../lib/supabase';

// Barra do topo do layout.md §6: marca, abas Catálogo e Meus empréstimos, e-mail e "Sair".
// Etiqueta de papel e avatar ficam fora desta fatia (spec 003, R13).
export function AppShell() {
  const { data } = useQuery({ queryKey: ['me'], queryFn: getMe });

  return (
    <div>
      <header className="nav">
        <div className="flex items-center gap-8">
          <div className="brand">
            <span className="brand-mark" aria-hidden />
            <span>
              EMPREST<span className="text-accent">.AI</span>
            </span>
          </div>
          <nav className="flex" aria-label="Principal">
            <NavLink to="/catalogo" className="nav-tab">
              Catálogo
            </NavLink>
            <NavLink to="/meus-emprestimos" className="nav-tab">
              Meus empréstimos
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-[13.5px]">
          <span className="text-fg/70">{data?.email ?? ''}</span>
          <button type="button" className="btn btn-ghost" onClick={() => void supabase.auth.signOut()}>
            Sair
          </button>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
