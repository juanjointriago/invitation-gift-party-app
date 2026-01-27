import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardBody } from './ui/card';
import { generateStaticInvitation, regenerateStaticInvitation, getExistingInvitation } from '../services/invitationGenerator.service';
import { toast } from 'sonner';

interface PublicInvitationActionsProps {
  party_uuid: string;
  partyStatus: 'draft' | 'published' | 'archived';
}

export function PublicInvitationActions({ party_uuid, partyStatus }: PublicInvitationActionsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [invitationUrl, setInvitationUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Cargar invitación existente al montar
  useEffect(() => {
    const loadExisting = async () => {
      if (partyStatus !== 'published') {
        setIsLoading(false);
        return;
      }

      try {
        const existing = await getExistingInvitation(party_uuid);
        if (existing && existing.success) {
          setInvitationUrl(existing.publicUrl);
        }
      } catch (error) {
        console.error('Error cargando invitación existente:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExisting();
  }, [party_uuid, partyStatus]);

  // Solo mostrar si está publicada
  if (partyStatus !== 'published') {
    return null;
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateStaticInvitation(party_uuid, false);
      
      if (result.success) {
        setInvitationUrl(result.publicUrl);
        toast.success('¡Invitación lista!', {
          description: 'Ya puedes compartir el enlace público',
        });
      } else {
        toast.error('Error al generar invitación', {
          description: result.error || 'Intenta nuevamente',
        });
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await regenerateStaticInvitation(party_uuid);
      
      if (result.success) {
        setInvitationUrl(result.publicUrl);
        toast.success('¡Invitación regenerada!', {
          description: 'Los cambios se reflejarán en el enlace público',
        });
      } else {
        toast.error('Error al regenerar invitación', {
          description: result.error || 'Intenta nuevamente',
        });
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!invitationUrl) return;

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopied(true);
      toast.success('¡Enlace copiado!', {
        description: 'Compártelo en WhatsApp, redes sociales o donde quieras',
      });
      
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast.error('Error al copiar', {
        description: 'Intenta seleccionar y copiar manualmente',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardBody className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-2xl flex-shrink-0">
              🔗
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-purple-900 mb-1">
                Invitación Pública
              </h3>
              <p className="text-sm text-purple-700">
                {invitationUrl 
                  ? 'Tu enlace público está listo para compartir'
                  : 'Genera un enlace público para compartir tu invitación sin que los invitados necesiten crear cuenta'}
              </p>
            </div>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          )}

          {/* URL de invitación */}
          {!isLoading && invitationUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-lg p-4 border border-purple-200"
            >
              <p className="text-xs text-gray-600 mb-2 font-semibold">
                Tu enlace público:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitationUrl}
                  className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopyLink}
                  className={`transition-colors ${
                    copied ? 'bg-green-500 hover:bg-green-600' : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                >
                  {copied ? '✓ Copiado' : '📋 Copiar'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Botones de acción */}
          {!isLoading && (
            <div className="flex flex-col sm:flex-row gap-3">
              {!invitationUrl ? (
                <Button
                  type="button"
                  onClick={handleGenerate}
                  isLoading={isGenerating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGenerating ? 'Generando...' : '✨ Generar invitación pública'}
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    📋 Copiar enlace
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRegenerate}
                    isLoading={isGenerating}
                    className="flex-1 border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    {isGenerating ? 'Regenerando...' : '🔄 Actualizar'}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Info adicional */}
          <div className="bg-purple-100 rounded-lg p-3 text-xs text-purple-800">
            <p className="font-semibold mb-1">💡 ¿Cómo funciona?</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Se crea un enlace público único para tu fiesta</li>
              <li>Los invitados pueden ver toda la información sin registrarse</li>
              <li>Para confirmar asistencia y elegir regalos, sí necesitarán autenticarse</li>
              <li>Si actualizas la fiesta, regenera la invitación para reflejar los cambios</li>
            </ul>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}
