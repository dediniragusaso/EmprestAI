# EMPREST.AI — Front

Vite + React + TypeScript (strict) + Tailwind. Login por Supabase Auth
(e-mail e senha); dados sempre pela API (`VITE_API_URL`).

## Rodar local
1. `cp .env.example .env` e preencha.
2. `npm install` · `npm run dev` → http://localhost:5173
3. A API (`../back`) precisa estar de pé com `CORS_ORIGIN` apontando para este front.

## Variáveis
Ver `.env.example`. Todas também precisam existir no painel da Vercel.
