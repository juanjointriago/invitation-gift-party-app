# 🎉 Party Gifts App

Una aplicación moderna y completa para gestionar fiestas, listas de regalos y confirmación de asistencias. Permite a anfitriones crear eventos personalizados con invitaciones elegantes y a invitados confirmar asistencia, responder preguntas RSVP y seleccionar regalos de una lista compartida en tiempo real.

## 🚀 Características Principales

### Gestión de Eventos
- **🎊 Creación de Fiestas**: Editor completo con información detallada (fecha, hora, ubicación, descripción)
- **📸 Galerías Personalizadas**: Sube imágenes de portada y crea galerías fotográficas
- **🎨 Invitaciones Públicas**: Genera invitaciones elegantes accesibles sin autenticación
- **🔗 Compartir Eventos**: URLs únicas y botones de compartir en redes sociales
- **📍 Mapas Integrados**: Visualización automática de ubicación del evento

### Gestión de Regalos y Asistencias
- **🎁 Listas de Regalos**: Administrar regalos con disponibilidad en tiempo real
- **✅ Confirmación de Asistencia**: Sistema RSVP con seguimiento detallado
- **❓ Preguntas Personalizadas**: Crea cuestionarios personalizados para tus invitados
- **📊 Tabla de Asistencias**: Vista completa con filtros, búsqueda y paginación
- **📈 Dashboard de Estadísticas**: Reportes visuales de confirmaciones y regalos

### Experiencia de Usuario
- **🌙 Modo Oscuro**: Tema claro/oscuro con preferencias persistentes
- **📱 Diseño Responsive**: Perfectamente adaptable a móviles, tablets y escritorio
- **🔔 Sistema de Notificaciones**: Feedback visual con toasts informativos
- **⚡ Sincronización Real-time**: Actualizaciones instantáneas con Firestore
- **🌐 Multiidioma**: Soporte para múltiples idiomas (i18n)
- **🔒 Autenticación Segura**: Firebase Authentication con gestión de perfiles

### Características Administrativas
- **👥 Roles de Usuario**: Sistema de permisos (Guest, Host, Administrator)
- **📋 Panel de Control**: Dashboard específico por rol de usuario
- **🔄 Estado de Sincronización**: Indicador visual del estado de conexión
- **💾 Persistencia de Datos**: Almacenamiento local con sincronización en la nube

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2.0**: Biblioteca JavaScript con las últimas características
- **TypeScript 5.9.3**: Tipado estático para mayor robustez
- **Vite 7.2.4**: Build tool ultrarrápido con HMR
- **React Router DOM v7.13.0**: Enrutamiento declarativo moderno

### Estilos y UI
- **Tailwind CSS v4.1.18**: Framework utility-first para estilos
- **Framer Motion 12.29.0**: Animaciones fluidas y declarativas
- **Lucide React 0.563.0**: Biblioteca de iconos moderna y ligera
- **Sonner 2.0.7**: Sistema de notificaciones toast elegante

### Gestión de Estado y Formularios
- **Zustand 5.0.10**: State management minimalista y potente
- **React Hook Form 7.71.1**: Manejo de formularios performante
- **Zod 4.3.6**: Validación de esquemas TypeScript-first
- **@hookform/resolvers 5.2.2**: Integración de validadores

### Backend y Servicios
- **Firebase 12.8.0**: Suite completa (Auth + Firestore + Storage)
  - Authentication: Sistema de usuarios seguro
  - Firestore: Base de datos NoSQL en tiempo real
  - Storage: Almacenamiento de imágenes y archivos
- **@tanstack/react-table 8.21.3**: Tablas avanzadas con filtros y paginación

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
npm run dev           # Iniciar servidor de desarrollo (puerto 5174)

# Compilación y Build
npm run build         # Compilar TypeScript y generar build de producción
npm run preview       # Previsualizar el build de producción localmente

# Calidad de Código
npm run lint          # Ejecutar ESLint para análisis de código
```

## 📁 Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── features/           # Componentes de características específicas
│   │   ├── GiftSelector.tsx        # Selector de regalos
│   │   └── QuestionForm.tsx        # Formulario de preguntas RSVP
│   ├── invitation/         # Componentes de invitación
│   │   ├── InvitationCover.tsx     # Portada de invitación
│   │   ├── InvitationGallery.tsx   # Galería de fotos
│   │   ├── InvitationGiftPreview.tsx
│   │   └── InvitationInfo.tsx      # Información del evento
│   ├── layout/             # Layouts específicos por rol
│   │   ├── AdminDashboardLayout.tsx
│   │   ├── AuthLayout.tsx
│   │   ├── HostDashboardLayout.tsx
│   │   ├── MainLayout.tsx
│   │   └── PartyGuestLayout.tsx
│   ├── ui/                 # Componentes UI base (shadcn-style)
│   │   ├── accordion.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── GalleryUpload.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── input.tsx
│   │   └── ... (más componentes UI)
│   ├── AssistancesTable.tsx        # Tabla de asistencias
│   ├── ConfirmationDialog.tsx      # Diálogos de confirmación
│   ├── HostQuickDashboard.tsx      # Dashboard rápido del host
│   ├── NotificationCenter.tsx      # Centro de notificaciones
│   ├── PartyShareButton.tsx        # Botón compartir evento
│   ├── PublicInvitationActions.tsx # Acciones públicas
│   └── SyncStatusIndicator.tsx     # Indicador de sincronización
├── pages/                  # Páginas de la aplicación
│   ├── auth/              # Páginas de autenticación
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── host/              # Páginas del anfitrión
│   │   ├── HostDashboardPage.tsx
│   │   ├── PartyEditorPage.tsx
│   │   └── ... (más páginas de host)
│   ├── admin/             # Páginas del administrador
│   │   └── AdminDashboardPage.tsx
│   ├── party/             # Páginas del invitado/evento
│   │   ├── PartyLandingPage.tsx
│   │   ├── PartyGuestPage.tsx
│   │   └── ... (más páginas de party)
│   ├── public/            # Páginas públicas
│   │   └── PublicInvitationPage.tsx
│   ├── HomePage.tsx
│   ├── NotFoundPage.tsx
│   └── ProfilePage.tsx
├── services/              # Servicios y lógica de negocio
│   ├── analytics.service.ts        # Métricas y análisis
│   ├── auth.service.ts             # Autenticación
│   ├── imageUpload.service.ts      # Subida de imágenes
│   ├── invitationGenerator.service.ts
│   ├── invitationLoader.service.ts
│   ├── party-assistance.service.ts # Asistencias
│   ├── party.service.ts            # Gestión de fiestas
│   └── users.service.ts            # Gestión de usuarios
├── stores/                # Estado global (Zustand)
│   ├── auth.store.ts              # Estado de autenticación
│   ├── notification.store.ts      # Notificaciones
│   ├── party-gifts.store.ts       # Regalos de fiesta
│   ├── party-questions.store.ts   # Preguntas RSVP
│   ├── party.store.ts             # Estado de fiestas
│   ├── partyContext.store.ts      # Contexto de fiesta activa
│   ├── router.store.ts            # Estado de navegación
│   ├── theme.store.ts             # Tema claro/oscuro
│   └── users.store.ts             # Estado de usuarios
├── types/                 # Tipos y esquemas TypeScript
│   ├── common.ts
│   ├── invitation.types.ts
│   ├── party-assistance.ts
│   ├── party.schema.ts
│   ├── party.ts
│   └── routes.ts
├── hooks/                 # Hooks personalizados
│   ├── useConfirmation.ts
│   ├── usePartyLoader.ts
│   └── useStaticInvitation.ts
├── i18n/                  # Internacionalización
│   ├── index.ts
│   ├── translations.ts
│   └── useTranslation.ts
├── routes/                # Configuración de rutas
│   ├── ProtectedRoute.tsx
│   └── routes.config.tsx
├── utils/                 # Utilidades compartidas
│   ├── firebase.utils.ts
│   ├── map.utils.ts
│   └── store.utils.ts
├── db/                    # Configuración de Firebase
│   ├── fb.helper.ts
│   └── initialize.ts
├── assets/                # Recursos estáticos
├── App.tsx                # Componente raíz
├── main.tsx              # Entry point
└── index.css             # Estilos globales

docs/                      # Documentación del proyecto
├── DEPLOYMENT_CHECKLIST.md
├── EJEMPLOS_INVITACIONES.md
├── INVITACIONES_PUBLICAS.md
├── REPORTE_RUTAS_Y_NAVEGACION.md
├── TECHNICAL_DOCUMENTATION.md
└── TESTING_CHECKLIST.md
```

## 🔐 Roles de Usuario

La aplicación implementa un sistema de roles completo con permisos específicos:

### 👤 Guest (Invitado)
- Acceder a invitaciones públicas sin autenticación
- Ver detalles completos de la fiesta (fecha, hora, ubicación, galería)
- Responder preguntas RSVP personalizadas
- Seleccionar regalo de la lista disponible
- Confirmar o rechazar asistencia
- Editar respuestas hasta la fecha del evento

### 🎭 Host (Anfitrión)
- Crear y editar fiestas propias
- Subir imágenes de portada y galería
- Gestionar preguntas RSVP personalizadas
- Administrar lista de regalos (agregar, editar, eliminar)
- Ver tabla de asistencias confirmadas
- Dashboard con estadísticas en tiempo real
- Generar URL pública de invitación
- Compartir evento en redes sociales
- Exportar datos de invitados y respuestas

### 🛡️ Administrator
- Acceso global a todas las fiestas del sistema
- Dashboard con métricas generales
- Ver y editar cualquier evento
- Gestionar usuarios y permisos
- Archivar o eliminar eventos
- Acceso a analytics completos
- Administración de configuración del sistema

## 🚀 Deployment

### Preparación para Producción
1. **Variables de Entorno**: Verificar que todas las variables estén configuradas
2. **Build**: Ejecutar `npm run build` para generar la carpeta `dist/`
3. **Testing**: Probar con `npm run preview` antes de desplegar
4. **Firebase Config**: Asegurar reglas de Firestore y Storage

### Firebase Hosting
```bash
# Instalar Firebase CLI (si no está instalado)
npm install -g firebase-tools

# Login en Firebase
firebase login

# Inicializar proyecto (solo primera vez)
firebase init hosting

# Build de producción
npm run build

# Deploy
firebase deploy --only hosting

# Deploy con alias personalizado
firebase deploy --only hosting:production
```

### Vercel (Recomendado para React)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

**Configuración en vercel.json**:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

**Configuración en netlify.toml**:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Consideraciones Importantes
- ✅ Configurar variables de entorno en la plataforma de hosting
- ✅ Habilitar SPA redirects para React Router
- ✅ Configurar dominios personalizados si es necesario
- ✅ Revisar reglas de seguridad de Firebase
- ✅ Monitorear límites de uso de Firebase (Spark/Blaze plan)

Ver [DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md) para guía completa de deployment.

## 📚 Documentación

La carpeta `docs/` contiene documentación técnica detallada:

- **[TECHNICAL_DOCUMENTATION.md](docs/TECHNICAL_DOCUMENTATION.md)**: Arquitectura, componentes, servicios y guía técnica completa para desarrolladores
- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)**: Lista de verificación paso a paso para deployment
- **[INVITACIONES_PUBLICAS.md](docs/INVITACIONES_PUBLICAS.md)**: Documentación sobre el sistema de invitaciones públicas
- **[REPORTE_RUTAS_Y_NAVEGACION.md](docs/REPORTE_RUTAS_Y_NAVEGACION.md)**: Mapa completo de rutas y navegación de la app
- **[EJEMPLOS_INVITACIONES.md](docs/EJEMPLOS_INVITACIONES.md)**: Ejemplos y mejores prácticas para crear invitaciones
- **[TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md)**: Casos de prueba y checklist de QA

### Guías Rápidas
- `.env.example` - Template de variables de entorno
- `firebase.json` - Configuración de Firebase
- `firestore.rules` - Reglas de seguridad de Firestore
- `storage.rules` - Reglas de seguridad de Storage

## 🎯 Flujos Principales

### 🌐 Flujo de Invitado Público (Sin Autenticación)
1. Acceder a URL pública de invitación `/public/invitation/:uuid`
2. Ver invitación con todos los detalles (portada, info, galería, regalos)
3. Opción de registrarse/login para confirmar asistencia
4. Compartir invitación en redes sociales

### ✅ Flujo de Confirmación de Asistencia
1. Invitado accede a URL privada `/party/:uuid` (requiere autenticación)
2. Ver detalles completos del evento
3. Responder cuestionario RSVP personalizado
4. Seleccionar regalo de la lista (actualización en tiempo real)
5. Confirmar o rechazar asistencia
6. Recibir confirmación y notificación

### 🎨 Flujo de Creación de Fiesta (Host)
1. Acceder al dashboard de anfitrión `/host/dashboard`
2. Hacer clic en "Nueva Fiesta" o "Create Party"
3. Completar formulario con información básica:
   - Nombre del evento
   - Fecha y hora
   - Ubicación (con integración de mapas)
   - Descripción detallada
4. Subir imagen de portada
5. Crear galería de fotos (opcional)
6. Configurar preguntas RSVP personalizadas
7. Agregar lista de regalos sugeridos
8. Publicar fiesta
9. Obtener URLs (pública y privada) para compartir
10. Monitorear respuestas en tiempo real desde el dashboard

### 📊 Flujo de Gestión de Asistencias (Host)
1. Acceder a dashboard de la fiesta específica
2. Ver estadísticas rápidas (confirmados, pendientes, regalos)
3. Consultar tabla completa de asistencias con:
   - Filtros por estado (confirmado, rechazado, pendiente)
   - Búsqueda por nombre o email
   - Paginación
   - Ordenamiento por columnas
4. Ver respuestas individuales a preguntas RSVP
5. Exportar datos para reportes externos

## 🔗 Integración Firebase

### Autenticación (Firebase Auth)
- **Email/Password**: Registro y login tradicional
- **Google Sign-In**: Autenticación con cuenta de Google (implementado)
- **Recuperación de contraseña**: Sistema de reset por email
- **Persistencia de sesión**: Mantiene usuarios autenticados
- **Gestión de perfiles**: Actualización de información de usuario

### Firestore Database
La aplicación utiliza las siguientes colecciones principales:

#### `users` Collection
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  role: 'guest' | 'host' | 'admin',
  photoURL?: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `parties` Collection
```typescript
{
  id: string,
  uuid: string,              // URL pública
  name: string,
  date: Timestamp,
  location: string,
  description: string,
  coverImageUrl?: string,
  galleryImages?: string[],
  hostId: string,
  questions: Question[],     // Preguntas RSVP
  gifts: Gift[],            // Lista de regalos
  isPublic: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `partyAssistanceGift` Collection
```typescript
{
  id: string,
  partyId: string,
  userId: string,
  userName: string,
  userEmail: string,
  status: 'confirmed' | 'declined' | 'pending',
  selectedGiftId?: string,
  answers: Answer[],        // Respuestas RSVP
  confirmedAt?: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Firebase Storage
- **Estructura de carpetas**:
  - `/parties/{partyId}/cover/` - Imágenes de portada
  - `/parties/{partyId}/gallery/` - Galería de fotos
  - `/users/{userId}/profile/` - Fotos de perfil
- **Optimización**: Compresión automática de imágenes
- **Seguridad**: Reglas de acceso por rol de usuario

### Reglas de Seguridad
Las reglas se encuentran en:
- `firestore.rules` - Reglas de base de datos
- `storage.rules` - Reglas de almacenamiento

### Real-time Listeners
- Sincronización automática de cambios en fiestas
- Actualización en vivo de disponibilidad de regalos
- Notificaciones instantáneas de nuevas confirmaciones
- Indicador de estado de conexión

## 🌙 Tema y Personalización

La aplicación ofrece múltiples opciones de personalización:

### Temas Globales
- **Modo Claro**: Tema por defecto con colores brillantes
- **Modo Oscuro**: Tema oscuro para reducir fatiga visual
- **Persistencia**: Las preferencias se guardan en localStorage
- **Detección automática**: Respeta preferencias del sistema operativo
- **Transiciones suaves**: Cambio de tema con animaciones fluidas

### Personalización por Evento
- **Colores Personalizados**: Cada fiesta puede tener su paleta de colores
- **Imágenes de Portada**: Sube imágenes personalizadas para cada evento
- **Galería de Fotos**: Comparte múltiples imágenes del evento
- **Branding**: Logo y elementos visuales customizables
- **Responsive Design**: Adaptación perfecta a todos los dispositivos

### Características de Accesibilidad
- Contraste adecuado en ambos temas
- Textos legibles y tamaños apropiados
- Navegación por teclado
- Estados visuales claros para interacciones

## 🧪 Testing y Calidad

### Herramientas de Desarrollo
```bash
# Análisis de código
npm run lint

# Compilación TypeScript (sin generar archivos)
tsc --noEmit

# Build de prueba
npm run build && npm run preview
```

### Checklist de Testing
Consulta [TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md) para:
- ✅ Casos de prueba por funcionalidad
- ✅ Testing de roles y permisos
- ✅ Validación de formularios
- ✅ Flujos completos de usuario
- ✅ Testing de responsive design
- ✅ Verificación de sincronización real-time

### Mejores Prácticas
- TypeScript strict mode activado
- ESLint configurado con reglas de React
- Validación con Zod en todos los formularios
- Error boundaries para manejo de errores
- Logging de errores en producción

## 🔧 Troubleshooting

### Problemas Comunes

**Error: Firebase not initialized**
```bash
# Verificar que las variables de entorno estén configuradas
# Revisar el archivo .env y reiniciar el servidor
npm run dev
```

**Error: Module not found**
```bash
# Limpiar caché y reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

**Build fallando**
```bash
# Verificar errores de TypeScript
tsc --noEmit
# Revisar y corregir errores antes de build
npm run build
```

**Problemas de autenticación**
- Verificar configuración de Firebase en `.env`
- Revisar reglas de Firestore en Firebase Console
- Confirmar que el dominio esté autorizado en Firebase Auth

### Soporte Adicional
Si encuentras un problema no documentado:
1. Revisa la [documentación técnica](docs/TECHNICAL_DOCUMENTATION.md)
2. Busca en los issues del repositorio
3. Crea un nuevo issue con detalles completos

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Seguir las convenciones de TypeScript
- Usar ESLint para mantener calidad de código
- Documentar funciones complejas
- Escribir commits descriptivos

## 📞 Contacto y Soporte

Para reportar issues, sugerir features o hacer preguntas:
- 🐛 **Bugs**: Abre un issue en el [repositorio](https://github.com/juanjointriago/invitation-gift-party-app)
- 💡 **Features**: Crea un feature request con descripción detallada
- 📧 **Contacto**: [Juan Intriago](https://github.com/juanjointriago)

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**v1.0.0** | Actualizado: Febrero 2026 | Desarrollado con ❤️ usando React + TypeScript + Firebase

### Características Destacadas
- ⚡ Build ultrarrápido con Vite 7
- 🎨 Estilos modernos con Tailwind CSS v4
- 🔥 Backend completo con Firebase
- 📱 100% Responsive
- 🌙 Dark mode
- 🔒 Seguro y escalable
