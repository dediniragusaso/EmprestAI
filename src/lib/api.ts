import { env } from './env';
import { supabase } from './supabase';

// Cliente escrito à mão (dívida registrada em docs/specs/001-login e 003-solicitar-emprestimo, Q5):
// os tipos abaixo repetem o contrato da API (spec 003, R2, R6, R7 e R10).

export interface Me {
  id: string;
  email: string | null;
}

export type EquipmentStatus = 'DISPONIVEL' | 'EMPRESTADO' | 'MANUTENCAO';
export type EquipmentCategory = 'NOTEBOOK' | 'MONITOR' | 'CABO' | 'CAMERA' | 'ACESSORIO';

export interface EquipmentItem {
  id: string;
  patrimonio: string | null;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  imageUrl: string | null;
  /** Só em item EMPRESTADO. Nunca traz o nome de quem está com o item (Q3). */
  loan: { dueAt: string; isMine: boolean } | null;
}

/** O que a tela precisa para habilitar ou desabilitar os botões. Datas vêm do servidor (R8). */
export interface Viewer {
  openLoans: number;
  maxLoans: number;
  overdue: boolean;
  today: string;
  proposedDueAt: string;
}

export interface Catalog {
  items: EquipmentItem[];
  viewer: Viewer;
}

export interface CreatedLoan {
  id: string;
  equipmentId: string;
  equipmentName: string;
  patrimonio: string | null;
  openedAt: string;
  dueAt: string;
}

export interface MyLoan {
  id: string;
  equipment: {
    id: string;
    name: string;
    patrimonio: string | null;
    category: EquipmentCategory;
    imageUrl: string | null;
  };
  openedAt: string;
  /** Data civil da retirada (YYYY-MM-DD), do servidor. */
  openedOn: string;
  dueAt: string;
  state: 'EM_DIA' | 'EM_ATRASO';
}

export interface MyLoans {
  items: MyLoan[];
  openLoans: number;
  maxLoans: number;
}

/** Erro da API em Problem Details (RFC 9457): `code` estável e `detail` em texto para mostrar na tela. */
export class ApiProblem extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    readonly detail: string,
  ) {
    super(detail);
    this.name = 'ApiProblem';
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${env.VITE_API_URL}${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    let code: string | undefined;
    let detail = `Falha ao consultar a API (${res.status}).`;
    try {
      const body = (await res.json()) as { code?: unknown; detail?: unknown };
      if (typeof body.code === 'string') code = body.code;
      if (typeof body.detail === 'string') detail = body.detail;
    } catch {
      // corpo que não é JSON: fica a mensagem genérica
    }
    throw new ApiProblem(res.status, code, detail);
  }
  return (await res.json()) as T;
}

export function getMe(): Promise<Me> {
  return request<Me>('/me');
}

const PAGE_SIZE = 100;

/** O catálogo inteiro: percorre as páginas por cursor (Q11); busca e contagem são feitas na tela. */
export async function getEquipment(): Promise<Catalog> {
  const items: EquipmentItem[] = [];
  let viewer: Viewer | undefined;
  let cursor: string | null = null;
  do {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) query.set('cursor', cursor);
    const page: { items: EquipmentItem[]; nextCursor: string | null; viewer: Viewer } = await request(
      `/equipment?${query.toString()}`,
    );
    items.push(...page.items);
    viewer ??= page.viewer;
    cursor = page.nextCursor;
  } while (cursor);
  return { items, viewer: viewer! };
}

export function postLoan(equipmentId: string): Promise<CreatedLoan> {
  return request<CreatedLoan>('/loans', { method: 'POST', body: JSON.stringify({ equipmentId }) });
}

export async function getMyLoans(): Promise<MyLoans> {
  const items: MyLoan[] = [];
  let openLoans = 0;
  let maxLoans = 3;
  let cursor: string | null = null;
  do {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) query.set('cursor', cursor);
    const page: { items: MyLoan[]; nextCursor: string | null; openLoans: number; maxLoans: number } =
      await request(`/loans/mine?${query.toString()}`);
    items.push(...page.items);
    openLoans = page.openLoans;
    maxLoans = page.maxLoans;
    cursor = page.nextCursor;
  } while (cursor);
  return { items, openLoans, maxLoans };
}
