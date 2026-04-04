import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface InvitationCoverProps {
  coverImageUrl: string;
  title: string;
  date: string;
  primaryColor: string;
}

export function InvitationCover({ 
  coverImageUrl, 
  title, 
  date,
  primaryColor 
}: InvitationCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Parallax effect
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  // Formatear fecha
  const formatDate = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return isoDate;
    }
  };

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden">
      {/* Imagen de fondo con parallax */}
      <motion.div
        style={{ y, opacity }}
        className="absolute inset-0 w-full h-full"
      >
        {coverImageUrl ? (
          <motion.img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        ) : (
          <motion.div 
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}40 100%)`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </motion.div>

      {/* Overlay degradado - Más oscuro para mejor legibilidad */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-black/80 dark:from-black/70 dark:via-black/80 dark:to-black/90"
      />

      {/* Contenido */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Título - Texto más brillante con mejor sombra */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
            {title}
          </h1>

          {/* Fecha - Mayor contraste */}
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-white font-medium capitalize drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            📅 {formatDate(date)}
          </motion.p>

          {/* Indicador de scroll */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1,
              delay: 1,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 bg-white rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
