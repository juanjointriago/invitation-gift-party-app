# 🎉 Party Gifts App

Una aplicación moderna para gestionar fiestas, listas de regalos y confirmación de asistencias. Permite a anfitriones crear eventos personalizados y a invitados confirmar asistencia, responder preguntas RSVP y seleccionar regalos de una lista compartida.

## 🚀 Características Principales

- **🎊 Gestión de Fiestas**: Crear, editar y compartir eventos
- **🎁 Listas de Regalos**: Administrar regalos con disponibilidad en tiempo real
- **❓ Preguntas RSVP**: Personalizar preguntas para los invitados
- **📊 Estadísticas**: Reportes y dashboards de asistencias
- **🌙 Modo Oscuro**: Tema claro/oscuro con preferencias persistentes
- **📱 Responsive**: Diseño adaptable a cualquier dispositivo
- **🔒 Autenticación**: Login seguro con Firebase Authentication
- **🔔 Notificaciones**: Sistema de toasts para feedback visual
- **⚡ Real-time**: Sincronización en tiempo real con Firestore

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Vite
- **State Management**: Zustand
- **Estilos**: Tailwind CSS v4
- **Formularios**: React Hook Form + Zod
- **Backend**: Firebase (Auth + Firestore + Storage)
- **UI Components**: Framer Motion, Lucide React, TanStack Table
- **Routing**: React Router DOM v7

## 📋 Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Cuenta de Firebase activa

## ⚙️ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/juanjointriago/invitation-gift-party-app.git
cd invitation-gift-party-app
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```
Edita el archivo `.env` con tus credenciales de Firebase:
```env
VITE_APIKEY=tu_api_key
VITE_AUTHDOMAIN=tu_proyecto.firebaseapp.com
VITE_PROJECTID=tu_proyecto_id
VITE_STORAGEBUCKET=tu_bucket.appspot.com
VITE_MESSAGINGSENDERID=tu_sender_id
VITE_APPID=tu_app_id
VITE_MEASUREMENTID=tu_measurement_id

# Nombres de colecciones (opcional, usa los defaults)
VITE_COLLECTION_USERS=users
VITE_COLLECTION_PARTIES=parties
VITE_COLLECTION_PARTY_ASSISTANCE=partyAssistanceGift
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:5174](http://localhost:5174) en tu navegador.

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev           # Iniciar servidor de desarrollo

# Compilación
npm run build         # Build de producción
npm run preview       # Preview del build
npm run lint          # Ejecutar ESLint
```

## 📁 Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
│   ├── layout/      # Layouts por rol
│   └── ui/          # Componentes UI base
├── pages/           # Páginas de la aplicación
│   ├── auth/        # Registro, login, reset password
│   ├── host/        # Dashboard y editor para anfitriones
│   ├── admin/       # Dashboard de administrador
│   └── party/       # Vistas de invitado
├── services/        # Servicios de API/Firestore
├── stores/          # Estado global (Zustand)
├── types/           # Tipos TypeScript
├── utils/           # Utilidades compartidas
├── db/              # Helpers de Firebase
└── hooks/           # Hooks personalizados
```

## 🔐 Roles de Usuario

### Guest (Invitado)
- Ver detalles de fiesta
- Responder preguntas RSVP
- Seleccionar regalo de la lista
- Confirmar asistencia

### Host (Anfitrión)
- Crear y editar fiestas
- Gestionar preguntas RSVP
- Administrar lista de regalos
- Ver respuestas de invitados
- Exportar datos

### Administrator
- Acceso global a todas las fiestas
- Archivar/eliminar eventos
- Ver métricas del sistema
- Gestionar usuarios

## 🚀 Deployment

### Firebase Hosting
```bash
firebase init hosting
firebase deploy --only hosting
```

### Vercel
```bash
vercel deploy --prod
```

### Netlify
```bash
netlify deploy --prod
```

Ver [TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md) para guía completa de deployment.

## 📚 Documentación

- **[TECHNICAL_DOCUMENTATION.md](TECHNICAL_DOCUMENTATION.md)**: Guía técnica completa para desarrolladores
- **[.env.example](.env.example)**: Template de variables de entorno

## 🎯 Flujos Principales

### Flujo de Invitado
1. Acceder a enlace de fiesta `/party/:uuid`
2. Registrarse o iniciar sesión
3. Responder preguntas RSVP
4. Seleccionar regalo
5. Confirmar asistencia

### Flujo de Anfitrión
1. Crear nueva fiesta
2. Completar información básica
3. Configurar preguntas personalizadas
4. Agregar lista de regalos
5. Publicar y compartir enlace
6. Monitorear respuestas en tiempo real

## 🔗 Integración Firebase

### Autenticación
- Email/Password
- Google Sign-In (próximamente)
- Recuperación de contraseña

### Firestore Collections
- `users`: Perfiles de usuario
- `parties`: Eventos y su configuración
- `partyAssistanceGift`: Respuestas de invitados y regalos seleccionados

## 🌙 Tema y Personalización

La aplicación soporta:
- Modo claro/oscuro con preferencias persistentes
- Colores customizables por fiesta
- Imágenes de portada personalizadas
- Galería de fotos

## 📞 Soporte

Para reportar issues o sugerir features, por favor abre un issue en el [repositorio](https://github.com/juanjointriago/invitation-gift-party-app).

## 📄 Licencia

Este proyecto es de código abierto.

---

**v0.0.1b** | Última actualización: 25 de enero de 2026
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
