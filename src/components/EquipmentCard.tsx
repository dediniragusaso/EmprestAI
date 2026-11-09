import type { EquipmentItem, Viewer } from '../lib/api';
import { buttonOf, CATEGORY_LABEL, detailOf, pillOf } from '../lib/situacao';

interface Props {
  item: EquipmentItem;
  viewer: Viewer;
  /** Chamado ao clicar em "Solicitar" (só existe com o botão habilitado). */
  onRequest?: (item: EquipmentItem) => void;
  /** Desabilita o botão enquanto um pedido está em andamento (evita pedido duplo). */
  busy?: boolean;
}

// Card do catálogo (layout.md §5.2): foto 4:3, kicker, nome, patrimônio, pill, detalhe e botão.
export function EquipmentCard({ item, viewer, onRequest, busy }: Props) {
  const pill = pillOf(item);
  const button = buttonOf(item, viewer);

  return (
    <article className="card" aria-label={item.name}>
      {item.imageUrl ? (
        <img className="card-photo" src={item.imageUrl} alt={item.name} width={800} height={600} loading="lazy" />
      ) : (
        <div className="card-photo" role="img" aria-label="Sem foto" />
      )}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="card-kicker">{CATEGORY_LABEL[item.category]}</span>
          <h2 className="card-title">{item.name}</h2>
          <span className="text-[12px] text-fg/45">{item.patrimonio ?? 'TI-—'}</span>
        </div>
        <span className={pill.className}>{pill.label}</span>
      </div>
      <p className="m-0 min-h-[18px] text-[13px] text-fg/62">{detailOf(item)}</p>
      <button
        type="button"
        className={button.className}
        disabled={button.disabled || busy}
        onClick={() => onRequest?.(item)}
      >
        {button.label}
      </button>
    </article>
  );
}
