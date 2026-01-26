# Sistema de Invitaciones Públicas Estáticas

## ✅ IMPLEMENTACIÓN COMPLETA

**Estado:** 🟢 Funcional y listo para usar  
**Fecha:** 25 de enero de 2026  
**Stack:** React + TypeScript + Vite + Firebase Storage + Framer Motion  

---

## 🚀 Quick Start

1. **Configura Firebase Storage Rules** (ver sección más abajo)
2. **Publica una fiesta** desde el panel del anfitrión
3. **Ve al editor** de la fiesta (`/host/party/{uuid}/editor`)
4. **Genera la invitación pública** (botón morado que aparece)
5. **Copia y comparte** el enlace generado

---

## 📋 Descripción

Sistema completo de invitaciones públicas que NO requiere autenticación para visualizar. Los datos se almacenan como JSON estático en Firebase Storage.

## 🎯 Características implementadas

✅ Generación de JSON estático con todos los datos de la fiesta  
✅ Upload automático a Firebase Storage  
✅ URL pública única por invitación (UUID)  
✅ Página pública responsive con animaciones (Framer Motion)  
✅ Preview de regalos por categoría  
✅ Galería de imágenes con lightbox  
✅ Integración con panel del anfitrión  
✅ Botón "Copiar enlace" con feedback visual  
✅ Regeneración de invitación (actualizar datos)  

## 🗂️ Estructura de archivos

```
src/
├── types/
│   └── invitation.types.ts           # Interfaces TypeScript
├── services/
│   ├── invitationGenerator.service.ts # Genera y sube JSON a Storage
│   └── invitationLoader.service.ts    # Carga JSON desde Storage
├── hooks/
│   └── useStaticInvitation.ts         # Hook para cargar invitación
├── components/
│   ├── PublicInvitationActions.tsx    # Botones en panel del anfitrión
│   └── invitation/
│       ├── InvitationCover.tsx        # Portada con parallax
│       ├── InvitationInfo.tsx         # Fecha, lugar, descripción
│       ├── InvitationGallery.tsx      # Galería de imágenes
│       └── InvitationGiftPreview.tsx  # Preview de regalos
├── pages/
│   └── public/
│       └── PublicInvitation.tsx       # Página pública principal
└── routes/
    └── routes.config.tsx              # Rutas (incluye /public-invitation)
```

## ⚙️ Configuración requerida

### 1. Firebase Storage Rules

Ve a Firebase Console → Storage → Rules y aplica:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Invitaciones públicas - solo lectura pública
    match /invitations/{invitationId} {
      allow read: if true;  // Público
      allow write: if request.auth != null;  // Solo usuarios autenticados
    }
    
    // Resto de archivos
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2. Verificar que Storage esté habilitado

✅ Ya está configurado en `src/db/initialize.ts`

## 🚀 Cómo usar

### Para el anfitrión:

1. **Publica tu fiesta** (cambia status a "published")
2. Ve al **editor de fiesta** (`/host/party/{uuid}/editor`)
3. Aparecerá una sección "**Invitación Pública**"
4. Haz clic en "**Generar invitación pública**"
5. Copia el enlace generado
6. Compártelo por WhatsApp, redes sociales, etc.

### Para regenerar (después de actualizar datos):

1. Haz tus cambios en el editor de fiesta
2. Guarda los cambios
3. Haz clic en "**Regenerar**" en la sección de invitación pública
4. El JSON se actualiza automáticamente

## 🔗 Flujo de usuario

```
Usuario recibe link en WhatsApp
         ↓
https://purple-party-invitation.web.app/public-invitation?uuid_invitation={uuid}
         ↓
Página pública se carga (SIN autenticación)
         ↓
Ve toda la información: portada, fecha, lugar, galería, regalos
         ↓
Hace clic en "Confirmar asistencia y elegir regalo"
         ↓
Redirige a /party/{party_uuid}/landing (aquí SÍ requiere login)
```

## 🎨 Diseño

- **Mobile-first**: Optimizado para celulares
- **Animaciones**: Framer Motion (parallax, fade-in, stagger)
- **Responsive**: 1 columna en móvil, 2-3 en desktop
- **Colores**: Usa `themeConfig` de cada fiesta
- **Lightbox**: Galería de imágenes expandible

## 📊 Datos incluidos en el JSON

El JSON generado contiene:

- ✅ `uuid_invitation` (identificador único del archivo)
- ✅ `party_uuid` (ID de Firestore para redirección)
- ✅ Título, descripción, fecha, ubicación
- ✅ Nombre del anfitrión
- ✅ `themeConfig` completo (colores, imágenes, textos)
- ✅ Lista completa de preguntas
- ✅ Lista completa de regalos con cantidades
- ✅ Categorías de regalos
- ✅ URL pública completa
- ✅ Timestamp de generación

## 🔒 Seguridad

- ✅ UUID aleatorio (difícil de adivinar)
- ✅ Solo lectura pública en Storage
- ✅ Escritura solo para usuarios autenticados
- ✅ NO expone datos sensibles (emails, etc.)
- ✅ Para confirmar asistencia SÍ requiere login

## 🐛 Manejo de errores

- ❌ **Invitación no encontrada** → Mensaje amigable
- ❌ **JSON corrupto** → Mensaje de contactar al anfitrión
- ❌ **Error de red** → Opción de reintentar

## 📱 Compartir en WhatsApp

**Limitación:** Como es una SPA, WhatsApp mostrará meta tags genéricos del `index.html`, NO específicos por fiesta.

**Solución futura:** Implementar Firebase Functions para SSR o usar un servicio de preview dinámico.

**Por ahora:** El mensaje al compartir debe incluir contexto:
```
¡Te invito a mi fiesta! 🎉
[Nombre de la fiesta]
Confirma tu asistencia aquí:
[link público]
```

## 🧪 Testing

### Probar en desarrollo:

1. Publica una fiesta de prueba
2. Genera la invitación pública
3. Abre el link en una ventana de incógnito (simula usuario sin sesión)
4. Verifica que TODO se vea sin necesidad de login
5. Haz clic en el CTA y verifica que redirige al landing con auth

### Probar regeneración:

1. Cambia el título de la fiesta
2. Guarda
3. Regenera la invitación
4. Abre el link público (refresca si es la misma ventana)
5. Verifica que el título se actualizó

## 🎯 Próximas mejoras (opcional)

- [ ] Generar imagen OG personalizada por fiesta
- [ ] Contador de visitas al link público
- [ ] QR code descargable de la invitación
- [ ] Exportar invitación como PDF
- [ ] Modo offline (PWA con cache del JSON)

## 📞 Soporte

Si encuentras errores:
1. Revisa la consola del navegador
2. Verifica las reglas de Storage en Firebase
3. Confirma que la fiesta está en status "published"
4. Verifica que el usuario que genera está autenticado

---

**Creado con 💜 Purple Party**
