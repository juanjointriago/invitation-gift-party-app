import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStaticInvitation } from '../../hooks/useStaticInvitation';
import { InvitationCover } from '../../components/invitation/InvitationCover';
import { InvitationInfo } from '../../components/invitation/InvitationInfo';
import { InvitationGallery } from '../../components/invitation/InvitationGallery';
import { InvitationGiftPreview } from '../../components/invitation/InvitationGiftPreview';
import { ThemeToggle } from '../../components/ui';

export function PublicInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uuid_invitation = searchParams.get('uuid_invitation');

  const { data: invitation, loading, error } = useStaticInvitation(uuid_invitation);

  // Estado de carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-full h-full border-4 border-purple-500 border-t-transparent rounded-full"
            />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300">Cargando invitación...</p>
        </motion.div>
      </div>
    );
  }

  // Estado de error
  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-950 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center space-y-6"
        >
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center text-4xl">
            ⚠️
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Invitación no disponible
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error || 'Esta invitación no existe o ha sido eliminada.'}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-xl font-semibold transition-colors"
          >
            Volver al inicio
          </button>
        </motion.div>
      </div>
    );
  }

  // Redirigir al landing de la fiesta
  const handleConfirmAttendance = () => {
    navigate(`/party/${invitation.party_uuid}?p_uuid=${invitation.party_uuid}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Theme Toggle - Posición fija en la esquina superior derecha */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Portada */}
      <InvitationCover
        coverImageUrl={invitation.themeConfig.coverImageUrl}
        title={invitation.title}
        date={invitation.date}
        primaryColor={invitation.themeConfig.primaryColor}
      />

      {/* Información principal */}
      <InvitationInfo
        welcomeTitle={invitation.themeConfig.customTexts.welcomeTitle}
        welcomeSubtitle={invitation.themeConfig.customTexts.welcomeSubtitle}
        description={invitation.description}
        location={invitation.location}
        date={invitation.date}
        extraInfo={invitation.themeConfig.customTexts.extraInfo}
        primaryColor={invitation.themeConfig.primaryColor}
        secondaryColor={invitation.themeConfig.secondaryColor}
      />

      {/* Galería */}
      {invitation.themeConfig.homeGalleryImages.length > 0 && (
        <InvitationGallery
          images={invitation.themeConfig.homeGalleryImages}
          primaryColor={invitation.themeConfig.primaryColor}
        />
      )}

      {/* Preview de regalos */}
      {invitation.giftList.length > 0 && (
        <InvitationGiftPreview
          gifts={invitation.giftList}
          categories={invitation.categories}
          categoryIcons={invitation.themeConfig.giftCategoryIcons}
          primaryColor={invitation.themeConfig.primaryColor}
          accentColor={invitation.themeConfig.accentColor}
        />
      )}

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-950">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center space-y-8"
        >
          <div className="space-y-4">
            <h2 
              className="text-3xl md:text-4xl font-bold dark:text-white"
              style={{ color: invitation.themeConfig.primaryColor }}
            >
              ¡Te esperamos!
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Confirma tu asistencia y elige el regalo perfecto
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirmAttendance}
            className="px-8 py-4 text-lg font-semibold text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{
              backgroundColor: invitation.themeConfig.primaryColor,
            }}
          >
            🎁 Confirmar asistencia y elegir regalo
          </motion.button>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Te llevaremos a la página de confirmación
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Organizado por <span className="font-semibold">{invitation.hostName}</span>
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Invitación creada con <span className="text-purple-600 dark:text-purple-400">Purple Party</span> 💜
          </p>
        </div>
      </footer>
    </div>
  );
}
