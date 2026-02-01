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

/**
 * Verifica si un string es una URL de mapa
 */
export function isMapUrl(location: string): boolean {
  return (
    location.includes('google.com/maps') ||
    location.includes('goo.gl/maps') ||
    location.includes('maps.app.goo.gl')
  );
}

/**
 * Genera URLs para Waze y Google Maps
 */
export function generateMapLinks(location: string) {
  const coords = extractCoordinates(location);

  if (coords) {
    // Waze: https://waze.com/ul?ll=lat,lng&navigate=yes
    const wazeUrl = `https://waze.com/ul?ll=${coords.lat},${coords.lng}&navigate=yes`;

    // Google Maps: https://www.google.com/maps?q=lat,lng
    const googleMapsUrl = `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=17&hl=es`;

    return { wazeUrl, googleMapsUrl, coords };
  }

  return null;
}
