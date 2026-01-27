import { motion } from 'framer-motion';

interface InvitationInfoProps {
  welcomeTitle: string;
  welcomeSubtitle: string;
  description: string;
  location: string;
  date: string;
  extraInfo?: string;
  primaryColor: string;
  secondaryColor: string;
}

export function InvitationInfo({
  welcomeTitle,
  welcomeSubtitle,
  description,
  location,
  date,
  extraInfo,
  primaryColor,
  secondaryColor,
}: InvitationInfoProps) {
  const formatTime = (isoDate: string) => {
    try {
      const date = new Date(isoDate);
      return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className="py-16 px-6 md:px-12 lg:px-24 bg-white dark:bg-gray-900"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Welcome titles */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h2 
            className="text-4xl md:text-5xl font-bold dark:text-white"
            style={{ color: primaryColor }}
          >
            {welcomeTitle}
          </h2>
          <p 
            className="text-xl md:text-2xl font-light dark:text-gray-300"
            style={{ color: secondaryColor }}
          >
            {welcomeSubtitle}
          </p>
        </motion.div>

        {/* Description */}
        {description && (
          <motion.div variants={itemVariants} className="text-center">
            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </motion.div>
        )}

        {/* Info cards */}
        <motion.div 
          variants={containerVariants}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Fecha y hora */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
            style={{ borderColor: `${primaryColor}20` }}
          >
            <div className="flex items-start space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${primaryColor}15` }}
              >
                📅
              </div>
              <div className="flex-1">
                <h3 
                  className="font-semibold text-lg mb-1 dark:text-white"
                  style={{ color: primaryColor }}
                >
                  Fecha y hora
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {new Date(date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {formatTime(date) && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {formatTime(date)}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Ubicación */}
          <motion.div
            variants={itemVariants}
            className="p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800"
            style={{ borderColor: `${secondaryColor}20` }}
          >
            <div className="flex items-start space-x-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${secondaryColor}15` }}
              >
                📍
              </div>
              <div className="flex-1">
                <h3 
                  className="font-semibold text-lg mb-1 dark:text-white"
                  style={{ color: secondaryColor }}
                >
                  Ubicación
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {location}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Extra info */}
        {extraInfo && (
          <motion.div 
            variants={itemVariants}
            className="p-6 rounded-2xl text-center bg-gray-50 dark:bg-gray-800"
            style={{ backgroundColor: `${primaryColor}08` }}
          >
            <p className="text-gray-700 dark:text-gray-300 italic">
              {extraInfo}
            </p>
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
