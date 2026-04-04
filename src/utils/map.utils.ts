/**
 * Utilidades para trabajar con URLs de mapas
 */

/**
 * Extrae las coordenadas de una URL de Google Maps
 * Soporta formatos como: ?q=lat,lng o @lat,lng
 */
export function extractCoordinates(url: string): { lat: string; lng: string } | null {
  try {
    // Intentar extraer coordenadas del parámetro q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (qMatch) {
      return { lat: qMatch[1], lng: qMatch[2] };
    }

    // Intentar extraer coordenadas del formato @lat,lng
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      return { lat: atMatch[1], lng: atMatch[2] };
    }

    return null;
  } catch {
    return null;
  }
}

const PLAIN_COORD_RE = /^(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/;

/**
 * Verifica si un string es una URL de mapa o coordenadas lat,lng
 */
export function isMapUrl(location: string): boolean {
  if (
    location.includes('google.com/maps') ||
    location.includes('goo.gl/maps') ||
    location.includes('maps.app.goo.gl')
  ) return true;
  return PLAIN_COORD_RE.test(location.trim());
}

/**
 * Genera URLs para Waze y Google Maps.
 * Soporta URLs de Google Maps (con coordenadas) y formato "lat,lng".
 */
export function generateMapLinks(location: string) {
  // 1. Try extracting from a full Google Maps URL
  const coords = extractCoordinates(location);
  if (coords) {
    return {
      wazeUrl: `https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`,
      googleMapsUrl: `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=17&hl=es`,
      coords,
    };
  }

  // 2. Try plain "lat,lng" format
  const m = location.trim().match(PLAIN_COORD_RE);
  if (m) {
    return {
      wazeUrl: `https://waze.com/ul?ll=${m[1]},${m[2]}&navigate=yes`,
      googleMapsUrl: `https://www.google.com/maps?q=${m[1]},${m[2]}&z=17&hl=es`,
      coords: { lat: m[1], lng: m[2] },
    };
  }

  return null;
}
