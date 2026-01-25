import type { RouteObject } from 'react-router-dom';

// Layouts
import {
  MainLayout,
  AuthLayout,
  PartyGuestLayout,
  HostDashboardLayout,
  AdminDashboardLayout,
} from '../components/layout';

// Pages
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { LoginPage } from '../pages/auth/login';
import { RegisterPage } from '../pages/auth/register';
import { ResetPasswordPage } from '../pages/auth/reset-password';
import { PartyLandingPage } from '../pages/party/PartyLandingPage';
import { PartyQuestionsPage } from '../pages/party/PartyQuestionsPage';
import { PartyHomePage } from '../pages/party/PartyHomePage';
import { PartyGiftsPage } from '../pages/party/PartyGiftsPage';
import { HostDashboardPage } from '../pages/host/HostDashboardPage';
import { PartyDetailPage } from '../pages/host/PartyDetailPage';
import { PartyEditorPage } from '../pages/host/PartyEditorPage';
import { CreatePartyPage } from '../pages/host/CreatePartyPage';
import { PartyResponsesPage } from '../pages/host/PartyResponsesPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { ProfilePage } from '../pages/ProfilePage';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Rutas de la aplicación
 * Estructura:
 * - Rutas de auth (sin protección)
 * - Rutas de invitado (con p_uuid query param)
 * - Rutas de anfitrión (requiere role 'anfitrion')
 * - Rutas de admin (requiere role 'administrator')
 */

export const routeConfig: RouteObject[] = [
  // Rutas de autenticación
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },

  // Rutas de invitado (party)
  {
    path: '/party/:partyUuid',
    element: <PartyGuestLayout />,
    children: [
      {
        index: true,
        element: <PartyLandingPage />,
      },
      {
        path: 'questions',
        element: <PartyQuestionsPage />,
      },
      {
        path: 'home',
        element: <PartyHomePage />,
      },
      {
        path: 'gifts',
        element: <PartyGiftsPage />,
      },
    ],
  },

  // Rutas de anfitrión
  {
    path: '/host',
    element: <HostDashboardLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            <HostDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'party/:partyUuid',
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            <PartyDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'party/:partyUuid/editor',
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            <PartyEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'party/:partyUuid/responses',
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            <PartyResponsesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'create',
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            <CreatePartyPage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Rutas de admin
  {
    path: '/admin',
    element: <AdminDashboardLayout />,
    children: [
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute requiredRoles={['administrator']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'parties',
        // element: <AdminPartiesPage />,
      },
      {
        path: 'users',
        // element: <AdminUsersPage />,
      },
      {
        path: 'party/:partyUuid',
        // element: <AdminPartyDetailPage />,
      },
    ],
  },

  // Rutas públicas
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
