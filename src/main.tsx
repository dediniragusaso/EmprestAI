import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { SessionProvider } from './auth/session';
import './index.css';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { element: <RequireAuth />, children: [{ path: '/', element: <HomePage /> }] },
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
