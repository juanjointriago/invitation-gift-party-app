# 📋 Documentación Técnica - Party Gifts App

## 📑 Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Requisitos Previos](#requisitos-previos)
4. [Configuración Inicial](#configuración-inicial)
5. [Variables de Entorno](#variables-de-entorno)
6. [Estructura de Base de Datos](#estructura-de-base-de-datos)
7. [Flujos de Usuario](#flujos-de-usuario)
8. [Componentes Principales](#componentes-principales)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Descripción General

**Party Gifts App** es una aplicación web full-stack para gestión de fiestas, listas de regalos y confirmación de asistencias. Permite a los anfitriones crear eventos, personalizar preguntas RSVP, gestionar listas de regalos, y a los invitados confirmar asistencia y seleccionar regalos.

### Stack Tecnológico
- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: Tailwind CSS v4
- **State Management**: Zustand
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form + Zod
- **Backend**: Firebase (Auth + Firestore + Storage)
- **UI Components**: Framer Motion, Lucide React, TanStack Table
- **Validación**: Zod Schemas

---

## 🏗️ Arquitectura del Sistema

### Capas de la Aplicación

```
┌─────────────────────────────────────────────────┐
│           PRESENTATION LAYER                     │
│  (React Components + Layouts + Pages)           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│          STATE MANAGEMENT LAYER                  │
│     (Zustand Stores + Context)                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│           BUSINESS LOGIC LAYER                   │
│  (Services + Hooks + Utilities)                  │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              DATA ACCESS LAYER                   │
│  (Firebase Helpers + API Wrappers)              │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                FIREBASE BACKEND                  │
│  (Auth + Firestore + Storage)                   │
└─────────────────────────────────────────────────┘
```

### Roles de Usuario

1. **Guest (Invitado)**: 
   - Ver detalles de fiesta
   - Responder preguntas RSVP
   - Seleccionar regalo
   - Confirmar asistencia

2. **Anfitrión (Host)**:
   - Crear y editar fiestas
   - Gestionar preguntas RSVP
   - Gestionar lista de regalos
   - Ver reportes y estadísticas
   - Exportar datos

3. **Administrator**:
   - Acceso a todas las fiestas
   - Archivar/eliminar fiestas
   - Ver métricas globales
   - Gestión de usuarios

---

## 📋 Requisitos Previos

### Software Requerido
```bash
Node.js >= 18.x
npm >= 9.x
Git >= 2.x
```

### Cuenta de Firebase
- Proyecto de Firebase activo
- Authentication habilitado (Email/Password + Google)
- Firestore Database creado
- Storage bucket configurado

### Herramientas Recomendadas
- VS Code con extensiones:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - Firebase Explorer

---

## ⚙️ Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd invitation-gift-party-app
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Firebase

#### A. Crear Proyecto en Firebase Console
1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto
3. Habilitar Authentication → Email/Password y Google
4. Crear base de datos Firestore en modo producción
5. Configurar Storage
6. Obtener credenciales del proyecto

#### B. Configurar Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Colección de usuarios
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    
    // Colección de fiestas
    match /parties/{partyId} {
      allow read: if true; // Público para invitados
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        (request.auth.uid == resource.data.host_user_id || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'administrator');
    }
    
    // Colección de asistencias
    match /partyAssistanceGift/{assistanceId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.guest_user_id || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'administrator');
    }
  }
}
```

#### C. Configurar Reglas de Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /parties/{partyId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

### 4. Crear Archivo de Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
touch .env
```

---

## 🔐 Variables de Entorno

### Archivo `.env` Completo

```env
# ============================================
# FIREBASE CONFIGURATION
# ============================================
# Obtener de Firebase Console → Project Settings → General
VITE_APIKEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_AUTHDOMAIN=tu-proyecto.firebaseapp.com
VITE_PROJECTID=tu-proyecto
VITE_STORAGEBUCKET=tu-proyecto.appspot.com
VITE_MESSAGINGSENDERID=123456789012
VITE_APPID=1:123456789012:web:abcdef1234567890
VITE_MEASUREMENTID=G-XXXXXXXXXX

# ============================================
# FIRESTORE COLLECTIONS
# ============================================
# Nombres de las colecciones en Firestore
VITE_COLLECTION_USERS=users
VITE_COLLECTION_PARTIES=parties
VITE_COLLECTION_PARTY_ASSISTANCE=partyAssistanceGift
```

### Descripción de Variables

| Variable | Descripción | Ejemplo | Requerido |
|----------|-------------|---------|-----------|
| `VITE_APIKEY` | API Key de Firebase | `AIzaSy...` | ✅ Sí |
| `VITE_AUTHDOMAIN` | Dominio de autenticación | `proyecto.firebaseapp.com` | ✅ Sí |
| `VITE_PROJECTID` | ID del proyecto Firebase | `mi-proyecto-123` | ✅ Sí |
| `VITE_STORAGEBUCKET` | Bucket de almacenamiento | `proyecto.appspot.com` | ✅ Sí |
| `VITE_MESSAGINGSENDERID` | ID del remitente de mensajes | `123456789012` | ✅ Sí |
| `VITE_APPID` | ID de la aplicación | `1:123...` | ✅ Sí |
| `VITE_MEASUREMENTID` | ID de Google Analytics | `G-XXXXXXXXXX` | ⚠️ Opcional |
| `VITE_COLLECTION_USERS` | Nombre colección usuarios | `users` | ✅ Sí |
| `VITE_COLLECTION_PARTIES` | Nombre colección fiestas | `parties` | ✅ Sí |
| `VITE_COLLECTION_PARTY_ASSISTANCE` | Nombre colección asistencias | `partyAssistanceGift` | ✅ Sí |

### ⚠️ IMPORTANTE: Seguridad

1. **NUNCA** commitear el archivo `.env` al repositorio
2. Agregar `.env` al `.gitignore`
3. Crear `.env.example` con valores de ejemplo
4. Rotar las credenciales periódicamente
5. Usar Firebase App Check en producción

---

## 🗄️ Estructura de Base de Datos

### Colección: `users`

```typescript
interface IUser {
  id: string;                    // UID de Firebase Auth
  email: string;                 // Correo del usuario
  name: string;                  // Nombre completo
  lastName: string;              // Apellido
  phone: string;                 // Teléfono
  role: "administrator" | "anfitrion" | "guest";
  avatar?: string;               // URL del avatar
  photoURL?: string;             // URL de foto de perfil
  city: string;                  // Ciudad
  country: string;               // País
  birthDate?: number;            // Timestamp de nacimiento
  isActive: boolean;             // Usuario activo
  createdAt: number;             // Timestamp de creación
  updatedAt?: number;            // Timestamp de última actualización
  lastLogin?: number;            // Timestamp de último login
}
```

**Índices recomendados:**
- `email` (único)
- `role` (para queries por rol)
- `isActive` (para filtrar usuarios activos)

---

### Colección: `parties`

```typescript
interface Party {
  id: string;                    // ID único de la fiesta
  party_uuid: string;            // UUID para URLs públicas
  host_user_id: string;          // ID del anfitrión
  title: string;                 // Título de la fiesta
  description?: string;          // Descripción
  date: number;                  // Timestamp del evento
  location: string;              // Ubicación
  status: "draft" | "published" | "archived";
  
  // Preguntas RSVP
  questions?: Question[];
  
  // Lista de regalos
  giftList?: Gift[];
  
  // Configuración de tema visual
  themeConfig?: ThemeConfig;
  
  // Metadata
  isActive: boolean;
  createdAt: number;
  updatedAt?: number;
}

interface Question {
  id: string;
  question: string;
  type: "single-choice" | "multi-choice" | "text";
  options?: string[];
  required?: boolean;
  order?: number;
}

interface Gift {
  id: string;
  name: string;
  description?: string;
  category?: string;
  maxQuantity: number;
  remainingQuantity: number;
  imageUrl?: string;
  order?: number;
}

interface ThemeConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  coverImageUrl?: string;
  loginBannerUrl?: string;
  homeGalleryImages?: string[];
  giftCategoryIcons?: Record<string, string>;
  customTexts?: {
    welcomeTitle?: string;
    welcomeSubtitle?: string;
    extraInfo?: string;
  };
}
```

**Índices recomendados:**
- `party_uuid` (único, para búsquedas rápidas)
- `host_user_id` (para queries del anfitrión)
- `status` (para filtrar por estado)
- `date` (para ordenar por fecha)
- Compuesto: `host_user_id + status` (para dashboard del host)

---

### Colección: `partyAssistanceGift`

```typescript
interface PartyAssistanceGift {
  id: string;
  party_uuid: string;            // UUID de la fiesta
  guest_user_id: string;         // ID del invitado
  selectedGiftId: string;        // ID del regalo seleccionado
  selectedGiftNameSnapshot: string; // Snapshot del nombre del regalo
  
  // Respuestas a preguntas
  answersToQuestions?: Array<{
    questionId: string;
    answer: string | string[];
  }>;
  
  // Metadata
  isActive: boolean;
  createdAt: number;
  updatedAt?: number;
}
```

**Índices recomendados:**
- `party_uuid` (para queries por fiesta)
- `guest_user_id` (para queries por usuario)
- Compuesto: `party_uuid + guest_user_id` (único, para evitar duplicados)

---

## 👥 Flujos de Usuario

### 1. Flujo de Invitado (Guest)

```
1. Acceder a URL de fiesta → /party/:partyUuid
2. Ver landing page de la fiesta
3. Hacer clic en "Confirmar Asistencia"
4. Si no está autenticado:
   a. Registrarse o iniciar sesión
   b. Redirigir a preguntas RSVP
5. Responder preguntas (si las hay)
6. Ver home de la fiesta
7. Ir a página de regalos
8. Seleccionar un regalo
9. Confirmar selección
10. Ver confirmación de asistencia
```

**Rutas:**
- `/party/:partyUuid` - Landing page
- `/party/:partyUuid/questions` - Preguntas RSVP
- `/party/:partyUuid/home` - Home de la fiesta
- `/party/:partyUuid/gifts` - Lista de regalos

---

### 2. Flujo de Anfitrión (Host)

```
1. Registrarse/Iniciar sesión
2. Dashboard personal → /host
3. Crear nueva fiesta:
   a. Completar información básica
   b. Ir al editor multi-paso
   c. Configurar preguntas RSVP
   d. Agregar lista de regalos
   e. Personalizar tema (opcional)
   f. Publicar fiesta
4. Compartir enlace con invitados
5. Monitorear asistencias y regalos
6. Ver reportes y estadísticas
7. Exportar datos (CSV)
```

**Rutas:**
- `/host` - Dashboard del anfitrión
- `/host/create` - Crear nueva fiesta
- `/host/party/:partyUuid/editor` - Editor de fiesta
- `/host/party/:partyUuid` - Detalles y estadísticas
- `/host/party/:partyUuid/responses` - Respuestas de invitados

---

### 3. Flujo de Administrador

```
1. Iniciar sesión con cuenta de administrador
2. Dashboard global → /admin/dashboard
3. Ver todas las fiestas del sistema
4. Filtrar por estado (activas, borradores, archivadas)
5. Archivar o eliminar fiestas
6. Ver métricas globales
7. Exportar datos globales
```

**Rutas:**
- `/admin/dashboard` - Dashboard global

---

## 🧩 Componentes Principales

### Stores de Estado (Zustand)

#### `auth.store.ts`
- Gestiona autenticación de usuario
- Login, registro, logout
- Persistencia de sesión
- Verificación de roles

#### `party.store.ts`
- Gestión de fiesta actual
- CRUD de fiestas
- Cache de datos

#### `party-questions.store.ts`
- Respuestas a preguntas RSVP
- Validación de respuestas

#### `party-gifts.store.ts`
- Selección de regalos
- Disponibilidad en tiempo real

#### `theme.store.ts`
- Modo claro/oscuro
- Preferencias del usuario
- Persistencia local

#### `notification.store.ts`
- Sistema de notificaciones toast
- Operaciones de sincronización
- Indicadores de progreso

---

### Servicios

#### `auth.service.ts`
```typescript
- login(email, password)
- register(userData)
- logout()
- resetPassword(email)
- checkStatus()
- googleSignUpLogin()
```

#### `party.service.ts`
```typescript
- createParty(partyData)
- updateParty(partyUuid, updates)
- deleteParty(partyUuid)
- archiveParty(partyUuid)
- getPartyByUuid(uuid)
- getPartiesByHost(hostId)
```

#### `party-assistance.service.ts`
```typescript
- createAssistance(data)
- updateAssistance(id, data)
- getAssistancesByParty(partyUuid)
- getAssistanceByUser(partyUuid, userId)
```

---

### Componentes UI

#### Core Components
- `Button` - Botón con variantes
- `Input` - Input con validación
- `Textarea` - Textarea con validación
- `Card` - Contenedor de tarjeta
- `Select` - Select personalizado
- `Dialog` - Modal/Dialog
- `Badge` - Etiquetas de estado
- `Progress` - Barra de progreso
- `Tabs` - Navegación por pestañas

#### Feature Components
- `NotificationCenter` - Toast notifications
- `ConfirmationDialog` - Confirmaciones
- `SyncStatusIndicator` - Indicador de sincronización
- `PartyShareButton` - Botón para compartir
- `AssistancesTable` - Tabla de asistencias
- `HostQuickDashboard` - Dashboard rápido

---

## 🚀 Deployment

### Build de Producción

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con valores de producción

# 3. Build
npm run build

# 4. Preview local (opcional)
npm run preview
```

Resultado: carpeta `dist/` con archivos estáticos optimizados

---

### Opciones de Hosting

#### 1. Firebase Hosting (Recomendado)

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar hosting
firebase init hosting

# Configurar firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}

# Deploy
firebase deploy --only hosting
```

**Ventajas:**
- Integración con Firebase Backend
- CDN global
- SSL automático
- Rollback fácil

---

#### 2. Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

**Configurar `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

#### 3. Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Production
netlify deploy --prod
```

**Configurar `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Variables de Entorno en Producción

#### Firebase Hosting
Usar Firebase Remote Config o `.env` en build time

#### Vercel
```bash
vercel env add VITE_APIKEY production
vercel env add VITE_AUTHDOMAIN production
# ... etc
```

#### Netlify
Dashboard → Site settings → Environment variables

---

## 🔧 Troubleshooting

### Problema: Firebase no se conecta

**Síntomas:**
```
Firebase: Error (auth/invalid-api-key)
```

**Solución:**
1. Verificar que `.env` existe
2. Verificar que todas las variables `VITE_*` están definidas
3. Reiniciar dev server: `npm run dev`
4. Verificar Firebase Console que el proyecto esté activo

---

### Problema: Usuario no puede registrarse

**Síntomas:**
```
Firebase: Error (auth/email-already-in-use)
```

**Solución:**
1. Verificar que Firebase Authentication está habilitado
2. Verificar que Email/Password provider está activado
3. Verificar reglas de Firestore permiten escritura en `users`

---

### Problema: Dark mode no funciona

**Síntomas:**
- Los colores no cambian al activar modo oscuro

**Solución:**
1. Verificar que `theme.store.ts` está inicializado en `App.tsx`
2. Verificar que el HTML tiene clase `.dark` cuando está activo
3. Clear localStorage: `localStorage.clear()`
4. Verificar CSS variables en `index.css`

---

### Problema: Formularios no validan

**Síntomas:**
- Envío de formularios sin validar
- Errores no se muestran

**Solución:**
1. Verificar que `react-hook-form` está instalado
2. Verificar que `zodResolver` está en el useForm
3. Verificar que los campos tienen `{...register('fieldName')}`
4. Verificar que `errors.fieldName?.message` se muestra

---

### Problema: Build falla

**Síntomas:**
```
Error: Failed to build
```

**Solución:**
```bash
# 1. Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# 2. Limpiar cache de Vite
rm -rf dist .vite

# 3. Verificar TypeScript
npm run lint

# 4. Build con verbose
npm run build -- --debug
```

---

### Problema: Permisos de Firestore

**Síntomas:**
```
Insufficient permissions
```

**Solución:**
1. Verificar reglas de Firestore (ver sección de configuración)
2. Verificar que el usuario está autenticado
3. Verificar que el `role` del usuario es correcto
4. Test en modo desarrollo (reglas permisivas):
```javascript
// SOLO PARA DESARROLLO
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## 📞 Soporte y Contacto

### Logs y Debugging

```typescript
// Habilitar logs de Firebase
import { setLogLevel } from 'firebase/firestore';
setLogLevel('debug');

// Logs en servicios
console.debug('[ServiceName]', data);
```

### Métricas de Rendimiento

```bash
# Analizar bundle
npm run build -- --analyze

# Ver tamaño de chunks
du -sh dist/assets/*
```

---

## 📚 Recursos Adicionales

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

---

## 🔄 Actualizaciones y Mantenimiento

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas (con cuidado)
npm update

# Actualizar específica
npm install react@latest
```

### Backup de Base de Datos

```bash
# Exportar Firestore
firebase firestore:export gs://tu-bucket/backups/$(date +%Y%m%d)

# Importar Firestore
firebase firestore:import gs://tu-bucket/backups/20260125
```

---

**Última actualización:** 25 de enero de 2026  
**Versión de la aplicación:** 0.0.0  
**Mantenedor:** Equipo de Desarrollo
