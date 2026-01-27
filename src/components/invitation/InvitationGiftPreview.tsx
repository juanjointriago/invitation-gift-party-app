import { motion } from 'framer-motion';
import type { InvitationGift } from '../../types/invitation.types';

interface InvitationGiftPreviewProps {
  gifts: InvitationGift[];
  categories: string[];
  categoryIcons: { [key: string]: string };
  primaryColor: string;
  accentColor: string;
}

export function InvitationGiftPreview({
  gifts,
  categories,
  categoryIcons,
  primaryColor,
  accentColor,
}: InvitationGiftPreviewProps) {
  if (!gifts || gifts.length === 0) {
    return null;
  }

  // Agrupar regalos por categoría
  const giftsByCategory = categories.reduce((acc, category) => {
    acc[category] = gifts.filter((gift) => gift.category === category);
    return acc;
  }, {} as Record<string, InvitationGift[]>);

  // Calcular totales por categoría
  const categoryStats = categories.map((category) => {
    const categoryGifts = giftsByCategory[category] || [];
    const total = categoryGifts.length;
    const available = categoryGifts.reduce(
      (sum, gift) => sum + gift.remainingQuantity,
      0
    );
    return { category, total, available };
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section 
      className="py-16 px-6 md:px-12 lg:px-24 bg-gray-50 dark:bg-gray-800"
      style={{ backgroundColor: `${primaryColor}05` }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 
            className="text-3xl md:text-4xl font-bold mb-4 dark:text-white"
            style={{ color: primaryColor }}
          >
            🎁 Lista de regalos
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Ayúdanos a hacer realidad estos regalos. Confirma tu asistencia para elegir el tuyo.
          </p>
        </motion.div>

        {/* Grid de categorías */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {categoryStats.map(({ category, total, available }) => {
            const icon = categoryIcons[category] || '🎁';
            const percentage = total > 0 ? (available / total) * 100 : 0;

            return (
              <motion.div
                key={category}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border-2 dark:border-gray-700 transition-shadow hover:shadow-xl"
                style={{ borderColor: `${accentColor}30` }}
              >
                {/* Icono */}
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 mx-auto"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  {icon}
                </div>

                {/* Nombre de categoría */}
                <h3 
                  className="text-xl font-semibold text-center mb-3 capitalize dark:text-white"
                  style={{ color: primaryColor }}
                >
                  {category}
                </h3>

                {/* Estadísticas */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Disponibles:</span>
                    <span className="font-semibold">{available} de {total}</span>
                  </div>

                  {/* Barra de progreso */}
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                </div>

                {/* Estado */}
                {available === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-3">
                    ✓ Completado
                  </p>
                ) : (
                  <p 
                    className="text-sm font-medium text-center mt-3"
                    style={{ color: accentColor }}
                  >
                    ¡Aún disponibles!
                  </p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Nota informativa */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            💡 Podrás ver y elegir regalos específicos después de confirmar tu asistencia
          </p>
        </motion.div>
      </div>
    </section>
  );
}
