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
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}40 100%)`,
            }}
          />
        )}
      </motion.div>

      {/* Overlay degradado */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70"
        style={{
          background: `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))`,
        }}
      />

      {/* Contenido */}
      <div className="relative h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Título */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white drop-shadow-2xl">
            {title}
          </h1>

          {/* Fecha */}
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-xl md:text-2xl text-white/90 font-light capitalize"
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
