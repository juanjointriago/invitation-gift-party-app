# 🚀 Checklist de Deployment - Invitaciones Públicas

## Pre-deployment

### ✅ Verificaciones locales

- [ ] `npm run build` compila sin errores
- [ ] No hay errores de TypeScript
- [ ] Todas las importaciones funcionan correctamente
- [ ] El componente `PublicInvitationActions` aparece en el editor de fiesta
- [ ] La ruta `/public-invitation` está registrada

### ✅ Test en desarrollo

- [ ] Crear una fiesta de prueba
- [ ] Publicar la fiesta (status = "published")
- [ ] Generar invitación pública
- [ ] Verificar que se crea el JSON en Storage
- [ ] Copiar URL y abrir en incógnito
- [ ] Verificar que la página pública carga sin auth
- [ ] Verificar colores del tema
- [ ] Verificar galería de imágenes
- [ ] Verificar preview de regalos
- [ ] Hacer clic en el CTA y verificar redirección
- [ ] Regenerar invitación y verificar actualización

---

## Deployment a Firebase

### 1️⃣ Configurar Firebase Storage Rules

```bash
# Opción A: Desde Firebase Console
# Ve a: https://console.firebase.google.com
# Storage → Rules → Pegar el contenido de storage.rules

# Opción B: Desde CLI
firebase deploy --only storage:rules
```

**Contenido de storage.rules:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /invitations/{invitationId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### 2️⃣ Build y Deploy

```bash
# 1. Limpiar build anterior
rm -rf dist

# 2. Build de producción
npm run build

# 3. Verificar que dist/ se generó correctamente
ls -la dist/

# 4. Deploy de hosting
firebase deploy --only hosting

# 5. Verificar URL de producción
# https://purple-party-invitation.web.app/
```

### 3️⃣ Verificación post-deployment

- [ ] Abrir la URL de producción
- [ ] Login con tu cuenta de anfitrión
- [ ] Ir al editor de una fiesta publicada
- [ ] Generar invitación pública
- [ ] Abrir la URL pública en incógnito
- [ ] Verificar que funciona sin autenticación
- [ ] Verificar que las imágenes cargan correctamente
- [ ] Verificar que los colores se aplican
- [ ] Verificar responsive en móvil (Chrome DevTools)

---

## Troubleshooting

### ❌ Error: "Storage not initialized"

**Solución:**
```typescript
// Verificar en src/db/initialize.ts
import { getStorage } from 'firebase/storage';

const storage = getStorage(app);
export { storage };
```

### ❌ Error: "Permission denied" al subir JSON

**Causa:** Reglas de Storage no configuradas o usuario no autenticado

**Solución:**
1. Verificar que las reglas de Storage permiten write con `request.auth != null`
2. Verificar que el usuario está autenticado al generar la invitación

### ❌ Error: "Invitation not found" (404)

**Causa:** El JSON no se subió correctamente a Storage

**Solución:**
1. Ir a Firebase Console → Storage
2. Verificar que existe la carpeta `invitations/`
3. Verificar que existe el archivo `{uuid}.json`
4. Si no existe, regenerar la invitación

### ❌ La página pública muestra error de CORS

**Causa:** Configuración de CORS en Storage

**Solución:**
```bash
# Crear archivo cors.json
cat > cors.json <<EOF
[
  {
    "origin": ["https://purple-party-invitation.web.app"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
EOF

# Aplicar configuración (requiere gcloud CLI)
gsutil cors set cors.json gs://[tu-proyecto].appspot.com
```

### ❌ Las imágenes no cargan en producción

**Causa:** URLs relativas o incorrectas

**Solución:**
1. Verificar que las URLs de imágenes son absolutas (https://...)
2. Verificar que las imágenes están en Storage o CDN público
3. Verificar reglas de lectura en Storage

### ❌ El botón "Generar invitación" no aparece

**Causa:** La fiesta no está en status "published"

**Solución:**
1. Ir al editor de fiesta
2. Cambiar status a "published"
3. Guardar cambios
4. El botón debe aparecer automáticamente

---

## Monitoring

### Métricas a monitorear

```typescript
// Opcional: Agregar analytics
import { logEvent } from 'firebase/analytics';

// Al generar invitación
logEvent(analytics, 'invitation_generated', {
  party_id: partyId,
  uuid_invitation: result.uuid_invitation,
});

// Al visitar página pública
logEvent(analytics, 'invitation_viewed', {
  uuid_invitation: uuid,
});

// Al hacer clic en CTA
logEvent(analytics, 'invitation_cta_clicked', {
  uuid_invitation: invitation.uuid_invitation,
  party_uuid: invitation.party_uuid,
});
```

### Logs importantes

- ✅ `🎨 Generando invitación estática para party: {uuid}`
- ✅ `✅ Invitación generada exitosamente`
- ✅ `📥 Cargando invitación: {uuid}`
- ✅ `✅ Invitación cargada exitosamente: {title}`
- ❌ `❌ Error generando invitación`
- ❌ `❌ Error cargando invitación`

---

## Rollback Plan

Si algo sale mal en producción:

```bash
# 1. Revertir deployment de hosting
firebase hosting:clone [SOURCE_SITE_ID] [CHANNEL_ID]

# 2. O hacer rollback manual
git checkout [commit-anterior]
npm run build
firebase deploy --only hosting

# 3. Verificar que la versión anterior funciona
```

---

## Next Steps (Opcional)

### Mejoras futuras

- [ ] Implementar Firebase Functions para meta tags dinámicos
- [ ] Agregar generación de QR code
- [ ] Agregar contador de visitas
- [ ] Implementar cache offline (PWA)
- [ ] Agregar exportación a PDF
- [ ] Implementar analytics detallado
- [ ] Agregar preview de WhatsApp con imagen OG personalizada

---

## ✅ Deployment Completado

Una vez verificado todo:

- [ ] La feature está en producción
- [ ] Los anfitriones pueden generar invitaciones
- [ ] Las invitaciones públicas funcionan sin auth
- [ ] El CTA redirige correctamente
- [ ] Responsive funciona en todos los dispositivos
- [ ] No hay errores en la consola
- [ ] Storage rules están configuradas
- [ ] Todo funciona como se esperaba

**🎉 ¡Feature lista y funcionando!**

---

**Creado:** 25 de enero de 2026  
**Stack:** React + TypeScript + Vite + Firebase + Framer Motion  
**Autor:** Purple Party Team 💜
