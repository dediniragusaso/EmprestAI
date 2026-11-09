import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { SessionProvider } from './auth/session';
import { AppShell } from './components/AppShell';
import './index.css';
import { CatalogoPage } from './pages/CatalogoPage';
import { LoginPage } from './pages/LoginPage';
import { MeusEmprestimosPage } from './pages/MeusEmprestimosPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/catalogo" replace /> },
          { path: '/catalogo', element: <CatalogoPage /> },
          { path: '/meus-emprestimos', element: <MeusEmprestimosPage /> },
        ],
      },
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RouterProvider router={router} />
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>,
);
