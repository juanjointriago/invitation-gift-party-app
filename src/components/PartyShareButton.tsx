import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

interface PartyShareButtonProps {
  partyUuid: string;
  partyTitle?: string;
}

/**
 * Botón para compartir invitación de fiesta
 * Permite copiar enlace, compartir en redes, etc.
 */
export const PartyShareButton: React.FC<PartyShareButtonProps> = ({ partyUuid, partyTitle = 'Fiesta' }) => {
  const [copied, setCopied] = useState(false);

  const partyUrl = `${window.location.origin}/party/${partyUuid}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(partyUrl);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  const handleShareWhatsApp = () => {
    const message = `¡Te invito a mi fiesta ${partyTitle}! Entra aquí: ${partyUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleShareFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(partyUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const handleShareEmail = () => {
    const subject = `Estás invitado a mi fiesta: ${partyTitle}`;
    const body = `¡Hola! Te invito a mi fiesta ${partyTitle}. Ingresa aquí para ver los detalles y elegir tu regalo:\n\n${partyUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <span>📤</span> Compartir
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? '✓ Copiado' : 'Copiar enlace'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareWhatsApp}>
          Compartir en WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareFacebook}>
          Compartir en Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShareEmail}>
          Enviar por Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
