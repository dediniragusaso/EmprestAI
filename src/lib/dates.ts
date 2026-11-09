// "Hoje", atraso, prazo e retirada vêm do servidor (spec 003, R8): aqui só se formata a data civil
// que a API devolveu (YYYY-MM-DD) para DD/MM/AAAA. Sem relógio do navegador e sem conversão de fuso.
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
