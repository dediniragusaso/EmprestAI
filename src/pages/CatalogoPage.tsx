import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EquipmentCard } from '../components/EquipmentCard';
import { SolicitarModal } from '../components/SolicitarModal';
import { Toast } from '../components/Toast';
import { ApiProblem, getEquipment, postLoan, type EquipmentItem } from '../lib/api';
import { formatDate } from '../lib/dates';
import { filterItems, FILTERS, type StatusFilter } from '../lib/situacao';

interface ToastState {
  message: string;
  variant: 'ok' | 'error';
}

// Tela do catálogo (spec 003, R12; layout.md §5.2). A contagem "X de Y" é feita aqui, na tela,
// com os itens carregados (Q11); busca e filtro também.
export function CatalogoPage() {
  const queryClient = useQueryClient();
  const { data, isPending, isError } = useQuery({ queryKey: ['equipment'], queryFn: getEquipment });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('TODOS');
  const [target, setTarget] = useState<EquipmentItem | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const request = useMutation({
    mutationFn: (item: EquipmentItem) => postLoan(item.id),
    onSuccess: (loan) => {
      setTarget(null);
      setToast({
        message: `Empréstimo registrado: ${loan.equipmentName}. Devolver até ${formatDate(loan.dueAt)}.`,
        variant: 'ok',
      });
      void queryClient.invalidateQueries({ queryKey: ['equipment'] });
      void queryClient.invalidateQueries({ queryKey: ['my-loans'] });
    },
    onError: (error) => {
      // Recusa (409) ou falha: mostra o motivo em texto e recarrega o catálogo, porque uma recusa
      // por corrida significa que a tela estava velha (R12).
      setTarget(null);
      setToast({
        message: error instanceof ApiProblem ? error.detail : 'Não foi possível concluir o pedido.',
        variant: 'error',
      });
      void queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const items = data?.items ?? [];
  const visible = useMemo(() => filterItems(items, query, status), [items, query, status]);
  const available = items.filter((i) => i.status === 'DISPONIVEL').length;

  return (
    <main className="mx-auto max-w-[1240px] px-10 pb-16 pt-9">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h1 className="m-0 text-[30px] font-semibold tracking-tight">Catálogo</h1>
          {data && (
            <p className="mt-2 text-[14px] text-fg/55">
              {available} de {items.length} equipamentos disponíveis agora
            </p>
          )}
        </div>
        <input
          className="input w-[260px]"
          type="search"
          placeholder="Buscar por nome ou patrimônio"
          aria-label="Buscar por nome ou patrimônio"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {data?.viewer.overdue && (
        <div className="banner-bad mb-5" role="alert">
          Você tem um empréstimo em atraso. Devolva o item antes de pedir outro equipamento.{' '}
          <Link to="/meus-emprestimos" className="underline">
            Ver meus empréstimos
          </Link>
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filtrar por situação">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="chip"
            aria-pressed={status === f.value}
            onClick={() => setStatus(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isPending && <p className="text-fg/55">Carregando…</p>}
      {isError && <p className="text-danger">Não foi possível carregar o catálogo.</p>}
      {data && visible.length === 0 && (
        <p className="py-10 text-center text-fg/55">Nenhum equipamento encontrado.</p>
      )}
      {data && visible.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(292px,1fr))] gap-4">
          {visible.map((item) => (
            <EquipmentCard
              key={item.id}
              item={item}
              viewer={data.viewer}
              busy={request.isPending}
              onRequest={setTarget}
            />
          ))}
        </div>
      )}

      <footer className="mt-12 text-center text-[12px] text-fg/40">
        Fotos:{' '}
        <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer" className="underline">
          Pixabay
        </a>
      </footer>

      {target && data && (
        <SolicitarModal
          item={target}
          proposedDueAt={data.viewer.proposedDueAt}
          pending={request.isPending}
          onConfirm={() => request.mutate(target)}
          onCancel={() => setTarget(null)}
        />
      )}
      {toast && <Toast message={toast.message} variant={toast.variant} onDone={closeToast} />}
    </main>
  );
}
