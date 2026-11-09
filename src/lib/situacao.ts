import type { EquipmentCategory, EquipmentItem, Viewer } from './api';
import { formatDate } from './dates';

// Tabela status -> cor e rótulo (o padrão do `Pill` do ADR-003): estado novo é linha nova, não `if`.
// Rótulos de botão e habilitação: ADR-003 §7 e spec 003 (R5, R12). Tudo derivado no render.

export const CATEGORY_LABEL: Record<EquipmentCategory, string> = {
  NOTEBOOK: 'Notebook',
  MONITOR: 'Monitor',
  CABO: 'Cabo',
  CAMERA: 'Câmera',
  ACESSORIO: 'Acessório',
};

const PILL: Record<EquipmentItem['status'], { className: string; label: string }> = {
  DISPONIVEL: { className: 'pill pill-ok', label: 'Disponível' },
  EMPRESTADO: { className: 'pill pill-warn', label: 'Emprestado' },
  MANUTENCAO: { className: 'pill pill-muted', label: 'Em manutenção' },
};

export function pillOf(item: EquipmentItem) {
  return PILL[item.status];
}

/** Linha de detalhe do card (sem nome de pessoa: decisão de privacidade, Q3). */
export function detailOf(item: EquipmentItem): string {
  if (item.status === 'MANUTENCAO') return 'Em manutenção';
  if (item.status === 'EMPRESTADO' && item.loan) {
    const ate = `devolução prevista até ${formatDate(item.loan.dueAt)}`;
    return item.loan.isMine ? `Está com você · ${ate}` : `Emprestado · ${ate}`;
  }
  if (item.status === 'EMPRESTADO') return 'Emprestado';
  return 'Pronto para retirada no balcão';
}

export interface ButtonSpec {
  label: string;
  /** `false` = pode clicar e pedir; `true` = rótulo desabilitado com o motivo. */
  disabled: boolean;
  className: string;
}

/** Rótulo e habilitação do botão do card, por prioridade (ADR-003 §7 regras 4 a 7). */
export function buttonOf(item: EquipmentItem, viewer: Viewer): ButtonSpec {
  const bloqueado = (label: string): ButtonSpec => ({ label, disabled: true, className: 'btn btn-secondary btn-block' });
  if (item.status === 'MANUTENCAO') return bloqueado('Indisponível');
  if (item.status === 'EMPRESTADO') return bloqueado(item.loan?.isMine ? 'Está com você' : 'Emprestado');
  if (viewer.overdue) return bloqueado('Bloqueado por atraso');
  if (viewer.openLoans >= viewer.maxLoans) return bloqueado(`Limite de ${viewer.maxLoans} itens`);
  return { label: 'Solicitar', disabled: false, className: 'btn btn-primary btn-block' };
}

export type StatusFilter = 'TODOS' | EquipmentItem['status'];

export const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'DISPONIVEL', label: 'Disponíveis' },
  { value: 'EMPRESTADO', label: 'Emprestados' },
  { value: 'MANUTENCAO', label: 'Em manutenção' },
];

/** Busca por nome e patrimônio, sem diferenciar maiúscula (layout.md §7 regra 8), mais o chip de situação. */
export function filterItems(items: EquipmentItem[], query: string, status: StatusFilter): EquipmentItem[] {
  const q = query.trim().toLowerCase();
  return items.filter((i) => {
    if (status !== 'TODOS' && i.status !== status) return false;
    if (!q) return true;
    return i.name.toLowerCase().includes(q) || (i.patrimonio ?? '').toLowerCase().includes(q);
  });
}
