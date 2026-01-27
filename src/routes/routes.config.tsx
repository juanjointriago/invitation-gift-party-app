import React, { lazy, Suspense } from 'react';
import type { RouteObject } from 'react-router-dom';

// Layouts
import {
  MainLayout,
  AuthLayout,
  PartyGuestLayout,
  HostDashboardLayout,
  AdminDashboardLayout,
} from '../components/layout';

import { ProtectedRoute } from './ProtectedRoute';

// Lazy-loaded pages
const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const LoginPage = lazy(() => import('../pages/auth/login').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/register').then((m) => ({ default: m.RegisterPage })));
const ResetPasswordPage = lazy(() => import('../pages/auth/reset-password').then((m) => ({ default: m.ResetPasswordPage })));
const PartyLandingPage = lazy(() => import('../pages/party/PartyLandingPage').then((m) => ({ default: m.PartyLandingPage })));
const PartyQuestionsPage = lazy(() => import('../pages/party/PartyQuestionsPage').then((m) => ({ default: m.PartyQuestionsPage })));
const PartyHomePage = lazy(() => import('../pages/party/PartyHomePage').then((m) => ({ default: m.PartyHomePage })));
const PartyGiftsPage = lazy(() => import('../pages/party/PartyGiftsPage').then((m) => ({ default: m.PartyGiftsPage })));
const HostDashboardPage = lazy(() => import('../pages/host/HostDashboardPage').then((m) => ({ default: m.HostDashboardPage })));
const PartyDetailPage = lazy(() => import('../pages/host/PartyDetailPage').then((m) => ({ default: m.PartyDetailPage })));
const PartyEditorPage = lazy(() => import('../pages/host/PartyEditorPage').then((m) => ({ default: m.PartyEditorPage })));
const CreatePartyPage = lazy(() => import('../pages/host/CreatePartyPage').then((m) => ({ default: m.CreatePartyPage })));
const PartyResponsesPage = lazy(() => import('../pages/host/PartyResponsesPage').then((m) => ({ default: m.PartyResponsesPage })));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminPartiesPage = lazy(() => import('../pages/admin/AdminPartiesPage').then((m) => ({ default: m.AdminPartiesPage })));
const AdminUsersPage = lazy(() => import('../pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const ProfilePage = lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const PublicInvitation = lazy(() => import('../pages/public/PublicInvitation').then((m) => ({ default: m.PublicInvitation })));

const fallback = (
  <div className="py-10 text-center text-sm text-text-muted">Cargando…</div>
);

const withSuspense = (element: React.ReactNode) => (
  <Suspense fallback={fallback}>{element}</Suspense>
);

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
        element: withSuspense(<LoginPage />),
      },
      {
        path: 'register',
        element: withSuspense(<RegisterPage />),
      },
      {
        path: 'reset-password',
        element: withSuspense(<ResetPasswordPage />),
      },
    ],
  },

  // Ruta pública de invitación (sin autenticación requerida)
  {
    path: '/public-invitation',
    element: withSuspense(<PublicInvitation />),
  },

  // Rutas de invitado (party)
  {
    path: '/party/:partyUuid',
    element: <PartyGuestLayout />,
    children: [
      {
        index: true,
        element: withSuspense(<PartyLandingPage />),
      },
      {
        path: 'questions',
        element: withSuspense(<PartyQuestionsPage />),
      },
      {
        path: 'home',
        element: withSuspense(<PartyHomePage />),
      },
      {
        path: 'gifts',
        element: withSuspense(<PartyGiftsPage />),
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
            {withSuspense(<HostDashboardPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'party/:partyUuid',
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            {withSuspense(<PartyDetailPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'party/:partyUuid/editor',
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            {withSuspense(<PartyEditorPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'party/:partyUuid/responses',
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            {withSuspense(<PartyResponsesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'create',
        element: (
          <ProtectedRoute requiredRoles={['anfitrion']}>
            {withSuspense(<CreatePartyPage />)}
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
            {withSuspense(<AdminDashboardPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'parties',
        element: (
          <ProtectedRoute requiredRoles={['administrator']}>
            {withSuspense(<AdminPartiesPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRoles={['administrator']}>
            {withSuspense(<AdminUsersPage />)}
          </ProtectedRoute>
        ),
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
        element: withSuspense(<HomePage />),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            {withSuspense(<ProfilePage />)}
          </ProtectedRoute>
        ),
      },
    ],
  },

  // 404
  {
    path: '*',
    element: withSuspense(<NotFoundPage />),
  },
];
