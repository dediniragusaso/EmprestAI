# Handoff — schema Prisma, migration init e seed (2026-10-19)

Fatia: sem spec própria — dívida de processo (aprovação da modelagem veio por mensagem do operador, sem `docs/specs/`). Não atende `CA-xx` de `001-login`; prepara o banco das fatias 002+.
Commit (back): ver `git log` de `EmprestAI--Back`, assunto "feat(back): schema Prisma, migration init e seed".

Checks:
- `npm run build` (back): `tsc -p tsconfig.build.json` sem erro.
- `npm test` (back): `Tests: 4 passed, 4 total`.
- `prisma migrate reset --force` (banco LOCAL 127.0.0.1:54322): `Database reset successful`, seed executado.
- Lint: não existe script `lint` no back (declarado, não pulado). Front: não tocado.

## Onde parei
`back/prisma/` tem `schema.prisma`, a migration `20261019123948_init` (tabelas + SQL bruto do Apêndice B + RLS + policy `deny_all`) e `seed.ts` (tenant `suporte_ti`, idempotente). Aplicado e verificado só no banco local. O Supabase remoto continua sem tabelas. Nenhum código da API usa o Prisma ainda.

## Decisões não óbvias
- `timestamptz` em vez de `Timestamp(6)` do rascunho (a convenção do doc manda `timestamptz`).
- Policy explícita `deny_all` por tabela porque `rules/migration.md` exige; o doc previa RLS sem policy. A API usa o role dono e ignora RLS.
- FK/trigger de `auth.users` dentro de `DO ... IF to_regclass('auth.users')` porque o banco sombra do Prisma não tem schema `auth`.
- Prisma fixado em 6.x (7 exige `prisma.config.ts` e remove `url` do schema).
- `postinstall: prisma generate` para a Vercel ter o client no build.

## O que tentei e não funcionou
- `prisma migrate dev` trava em ambiente não interativo; usar `migrate deploy` para aplicar.
- `prisma migrate reset` exige `PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION` com o texto exato do consentimento do operador.

## Próximo passo exato
Aplicar a migration no Supabase remoto: `DATABASE_URL`/`DIRECT_URL` do remoto no `back/.env` e `npx prisma migrate deploy` (nunca `reset`/`dev`), depois criar `memberships` do primeiro usuário. Em seguida, spec `002-catalogo`.

## Arquivos relevantes
`back/prisma/schema.prisma` · `back/prisma/migrations/20261019123948_init/migration.sql` · `back/prisma/seed.ts` · `back/package.json` · `docs/modelagem-banco.md` (raiz)
