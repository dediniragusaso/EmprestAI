import { useEffect } from 'react';
import type { EquipmentItem } from '../lib/api';
import { formatDate } from '../lib/dates';

interface Props {
  item: EquipmentItem;
  /** "Devolver até" que a API calculou (hoje + 14, do servidor, R8). */
  proposedDueAt: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Modal de solicitação (ADR-003 §5.6): 420px, resumo com duas linhas, Cancelar + confirmação.
// Clique fora fecha; clique dentro não propaga. Fecha com Esc, salvo durante o envio.
export function SolicitarModal({ item, proposedDueAt, pending, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, onCancel]);

  return (
    <div className="dialog-backdrop" onClick={() => !pending && onCancel()}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="solicitar-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="solicitar-titulo" className="dialog-title">
          Solicitar empréstimo
        </h2>
        <p className="dialog-body">Confirme o pedido. O item fica em seu nome até a devolução.</p>
        <div className="dialog-summary">
          <div className="flex justify-between gap-4">
            <span className="text-fg/55">Equipamento</span>
            <span className="text-accent-300">{item.name}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-fg/55">Devolver até</span>
            <span className="text-accent-300">{formatDate(proposedDueAt)}</span>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" disabled={pending} onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" disabled={pending} onClick={onConfirm}>
            {pending ? 'Enviando…' : 'Confirmar pedido'}
          </button>
        </div>
      </div>
    </div>
  );
}
