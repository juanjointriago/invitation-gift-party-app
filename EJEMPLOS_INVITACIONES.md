# 🎯 Ejemplos de Uso - Invitaciones Públicas

## 📝 Ejemplo 1: Generar invitación desde código

```typescript
import { generateStaticInvitation } from './services/invitationGenerator.service';

// Cuando el anfitrión publica la fiesta
const handlePublishParty = async (partyId: string) => {
  // 1. Actualizar status a "published"
  await updateParty(partyId, { status: 'published' });
  
  // 2. Generar invitación pública
  const result = await generateStaticInvitation(partyId);
  
  if (result.success) {
    console.log('URL pública:', result.publicUrl);
    console.log('UUID invitación:', result.uuid_invitation);
    
    // Opcional: Guardar en Firestore para referencia
    await updateParty(partyId, {
      publicInvitation: {
        uuid: result.uuid_invitation,
        url: result.publicUrl,
        generatedAt: new Date(),
      }
    });
  }
};
```

## 🔄 Ejemplo 2: Regenerar invitación

```typescript
import { regenerateStaticInvitation } from './services/invitationGenerator.service';

// Cuando el anfitrión actualiza datos y quiere refrescar la invitación
const handleUpdateAndRegenerate = async (partyId: string, newData: Partial<Party>) => {
  // 1. Guardar cambios
  await updateParty(partyId, newData);
  
  // 2. Regenerar invitación (sobrescribe la anterior)
  const result = await regenerateStaticInvitation(partyId);
  
  if (result.success) {
    toast.success('Invitación actualizada');
  }
};
```

## 📱 Ejemplo 3: Compartir en WhatsApp

```typescript
const handleShareWhatsApp = (invitationUrl: string, partyTitle: string) => {
  const message = encodeURIComponent(
    `🎉 ¡Estás invitado a mi fiesta!\n\n` +
    `${partyTitle}\n\n` +
    `Confirma tu asistencia aquí:\n${invitationUrl}`
  );
  
  const whatsappUrl = `https://wa.me/?text=${message}`;
  window.open(whatsappUrl, '_blank');
};
```

## 🔗 Ejemplo 4: Copiar link al clipboard

```typescript
const handleCopyLink = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    toast.success('¡Enlace copiado!');
  } catch (error) {
    // Fallback para navegadores que no soportan clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    toast.success('¡Enlace copiado!');
  }
};
```

## 🎨 Ejemplo 5: Personalizar tema en invitación

```typescript
// El JSON generado incluye themeConfig completo
const invitation: StaticInvitation = {
  uuid_invitation: "abc-123",
  party_uuid: "xyz-789",
  title: "Cumpleaños de María",
  themeConfig: {
    primaryColor: "#9333EA",      // Púrpura
    secondaryColor: "#EC4899",    // Rosa
    accentColor: "#F59E0B",       // Ámbar
    backgroundColor: "#FFFFFF",
    coverImageUrl: "https://...",
    homeGalleryImages: [
      "https://image1.jpg",
      "https://image2.jpg",
    ],
    customTexts: {
      welcomeTitle: "¡Celebremos juntos!",
      welcomeSubtitle: "Los 15 años de María",
      extraInfo: "Dress code: Elegante casual",
    }
  },
  // ... más campos
};
```

## 🔍 Ejemplo 6: Cargar invitación en componente

```typescript
import { useStaticInvitation } from './hooks/useStaticInvitation';
import { useSearchParams } from 'react-router-dom';

function MyPublicInvitation() {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get('uuid_invitation');
  
  const { data, loading, error } = useStaticInvitation(uuid);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;
  
  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      {/* ... más contenido */}
    </div>
  );
}
```

## 📊 Ejemplo 7: Estructura del JSON generado

```json
{
  "uuid_invitation": "550e8400-e29b-41d4-a716-446655440000",
  "party_uuid": "abc123xyz",
  "title": "Fiesta de cumpleaños de María",
  "description": "Una celebración especial para mis 15 años",
  "date": "2026-02-15T19:00:00.000Z",
  "location": "Salón de eventos El Jardín, Calle 123",
  "hostName": "María González",
  "themeConfig": {
    "primaryColor": "#9333EA",
    "secondaryColor": "#EC4899",
    "accentColor": "#F59E0B",
    "backgroundColor": "#FFFFFF",
    "coverImageUrl": "https://storage.googleapis.com/...",
    "homeGalleryImages": [
      "https://storage.googleapis.com/image1.jpg",
      "https://storage.googleapis.com/image2.jpg"
    ],
    "giftCategoryIcons": {
      "niña": "👧",
      "niño": "👦",
      "default": "🎁"
    },
    "customTexts": {
      "welcomeTitle": "¡Celebremos juntos mis 15 años!",
      "welcomeSubtitle": "Te espero con mucho cariño",
      "extraInfo": "Dress code: Elegante casual"
    }
  },
  "questions": [
    {
      "id": "q1",
      "question": "¿Confirmas tu asistencia?",
      "type": "single-choice",
      "options": ["Sí, asistiré", "No podré asistir"],
      "required": true
    }
  ],
  "giftList": [
    {
      "id": "gift1",
      "name": "Juego de sábanas",
      "description": "Color blanco o crema",
      "category": "default",
      "maxQuantity": 1,
      "remainingQuantity": 1
    }
  ],
  "categories": ["default", "niña", "niño"],
  "invitationUrl": "https://purple-party-invitation.web.app/public-invitation?uuid_invitation=550e8400-e29b-41d4-a716-446655440000",
  "generatedAt": "2026-01-25T10:30:00.000Z",
  "version": "1.0"
}
```

## 🧪 Ejemplo 8: Test manual

```bash
# 1. Inicia el servidor de desarrollo
npm run dev

# 2. Publica una fiesta de prueba desde el panel

# 3. Genera la invitación pública

# 4. Copia la URL generada (ej: /public-invitation?uuid_invitation=abc123)

# 5. Abre en incógnito para simular usuario sin sesión
# Chrome: Cmd+Shift+N (Mac) o Ctrl+Shift+N (Windows)

# 6. Pega la URL y verifica:
#    ✓ Portada se muestra correctamente
#    ✓ Colores del tema aplicados
#    ✓ Galería de imágenes funciona
#    ✓ Preview de regalos visible
#    ✓ Botón CTA redirige al landing
```

## 🚀 Ejemplo 9: Deploy a producción

```bash
# 1. Construir la aplicación
npm run build

# 2. Desplegar reglas de Storage
firebase deploy --only storage

# 3. Desplegar el hosting
firebase deploy --only hosting

# 4. Verificar en producción
# Abre: https://purple-party-invitation.web.app/public-invitation?uuid_invitation=test
```

## 📋 Ejemplo 10: Verificar que Storage funciona

```typescript
// En la consola del navegador (Dev Tools)

// 1. Verificar que Storage está inicializado
import { storage } from './db/initialize';
console.log(storage);  // Debe mostrar el objeto Storage

// 2. Probar subida manual (desde código autenticado)
import { ref, uploadString } from 'firebase/storage';

const testRef = ref(storage, 'invitations/test.json');
const testData = JSON.stringify({ test: 'Hello World' });

await uploadString(testRef, testData, 'raw', {
  contentType: 'application/json'
});

console.log('✅ Test subido correctamente');

// 3. Probar descarga pública (desde cualquier navegador)
const url = await getDownloadURL(testRef);
const response = await fetch(url);
const data = await response.json();
console.log(data);  // { test: 'Hello World' }
```

---

## ✅ Checklist de testing

Antes de considerar la feature completa, verifica:

- [ ] La invitación se genera correctamente
- [ ] El JSON se sube a Storage sin errores
- [ ] La URL pública funciona sin autenticación
- [ ] Los colores del tema se aplican correctamente
- [ ] La galería de imágenes funciona
- [ ] El botón de copiar funciona
- [ ] La regeneración actualiza el JSON
- [ ] El CTA redirige al landing correcto
- [ ] Responsive en móvil, tablet y desktop
- [ ] Las animaciones son suaves y no causan lag
- [ ] Los errores se manejan correctamente (404, etc.)

---

**¡Listo para usar! 🎉**
