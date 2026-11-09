import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getMyLoans, type MyLoan } from '../lib/api';
import { formatDate } from '../lib/dates';

// Cor de estado (ADR-003 §1.3): só "Em dia" e "Em atraso" nesta fatia; "A vencer" não entra (Q9).
const STATE: Record<MyLoan['state'], { label: string; pill: string; color: string }> = {
  EM_DIA: { label: 'Em dia', pill: 'pill pill-ok', color: '#5fcfc4' },
  EM_ATRASO: { label: 'Em atraso', pill: 'pill pill-bad', color: '#e88b8b' },
};

// Tela Meus empréstimos (spec 003, R11; layout.md §5.3). Sem botão "Devolver": a devolução é de
// outra fatia. Datas e estado vêm da API (R8).
export function MeusEmprestimosPage() {
  const { data, isPending, isError } = useQuery({ queryKey: ['my-loans'], queryFn: getMyLoans });
  const items = data?.items ?? [];
  const max = data?.maxLoans ?? 3;

  return (
    <main className="mx-auto max-w-[1000px] px-10 pb-16 pt-9">
      <h1 className="m-0 text-[30px] font-semibold tracking-tight">Meus empréstimos</h1>
      {data && (
        <p className="mb-4 mt-2 text-[14px] text-fg/55">
          {data.openLoans} de {max} itens em seu nome · prazo padrão de 14 dias
        </p>
      )}

      {data && (
        <div className="mb-6 flex gap-2" role="img" aria-label={`${data.openLoans} de ${max} itens em uso`}>
          {Array.from({ length: max }, (_, n) => {
            const loan = items[n];
            const color = loan
              ? loan.state === 'EM_ATRASO'
                ? 'var(--color-danger)'
                : 'var(--color-accent)'
              : 'color-mix(in srgb, var(--color-fg) 12%, transparent)';
            return <span key={n} className="h-[5px] flex-1 rounded-full" style={{ background: color }} />;
          })}
        </div>
      )}

      {isPending && <p className="text-fg/55">Carregando…</p>}
      {isError && <p className="text-danger">Não foi possível carregar seus empréstimos.</p>}

      {data && items.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-[14px] border border-dashed border-divider p-12 text-center">
          <p className="m-0 text-fg/70">Você não tem nenhum item emprestado.</p>
          <Link to="/catalogo" className="btn btn-primary">
            Ir ao catálogo
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((loan) => {
            const st = STATE[loan.state];
            return (
              <li
                key={loan.id}
                className="flex items-center gap-5 rounded-[8px] bg-surface px-5 py-[18px]"
                style={{ borderLeft: `3px solid ${st.color}` }}
              >
                <div className="flex-[1.4]">
                  <div className="text-[16px] font-semibold">{loan.equipment.name}</div>
                  <div className="text-[12px] text-fg/45">{loan.equipment.patrimonio ?? 'TI-—'}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-fg/45">Retirada</div>
                  <div>{formatDate(loan.openedOn)}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-fg/45">Devolver até</div>
                  <div style={{ color: st.color }}>{formatDate(loan.dueAt)}</div>
                </div>
                <div className="flex-[0.9]">
                  <span className={st.pill}>{st.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ul className="m-0 mt-8 flex list-none flex-wrap gap-x-8 gap-y-2 p-0 text-[12.5px] text-fg/55">
        <li>Máximo de {max} itens por pessoa</li>
        <li>Prazo padrão de 14 dias</li>
        <li>Quem tem item em atraso não pode pedir outro</li>
      </ul>
    </main>
  );
}
