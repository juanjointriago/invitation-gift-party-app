import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { HostQuickDashboard } from '../components/HostQuickDashboard';
import { motion } from 'framer-motion';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 dark:from-gray-900 dark:to-purple-950/30">
      {/* Hero */}
      <section className="container-app py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold text-primary mb-4">
            Bienvenido a PartyGifts
          </h1>
          <p className="text-xl text-text-muted mb-8 max-w-2xl mx-auto">
            Gestiona tus fiestas, coordina regalos con tus invitados y celebra de forma más organizada
          </p>
        </motion.div>

        {!isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4 justify-center"
          >
            <Button
              size="lg"
              onClick={() => navigate('/auth/login')}
            >
              Iniciar Sesión
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth/register')}
            >
              Registrarse
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4 justify-center"
          >
            {user?.role === 'anfitrion' && (
              <Button
                size="lg"
                onClick={() => navigate('/host')}
              >
                Mis Fiestas
              </Button>
            )}
            {user?.role === 'administrator' && (
              <Button
                size="lg"
                onClick={() => navigate('/admin/dashboard')}
              >
                Panel de Admin
              </Button>
            )}
          </motion.div>
        )}
      </section>

      {/* Dashboard rápido para anfitriones */}
      {isAuthenticated && user?.role === 'anfitrion' && (
        <section className="container-app py-12 max-w-4xl mx-auto">
          <HostQuickDashboard />
        </section>
      )}

      {/* Features */}
      {!isAuthenticated && (
        <section className="container-app py-16">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">
            ¿Cómo funciona?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="text-center p-8">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-text mb-2">Crea tu Fiesta</h3>
                <p className="text-text-muted">
                  Define la fecha, lugar, tema y personaliza tu invitación
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card className="text-center p-8">
                <div className="text-4xl mb-4">🎁</div>
                <h3 className="text-xl font-bold text-text mb-2">Configura Regalos</h3>
                <p className="text-text-muted">
                  Añade los regalos que deseas recibir con cantidades limitadas
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="text-center p-8">
                <div className="text-4xl mb-4">📤</div>
                <h3 className="text-xl font-bold text-text mb-2">Invita y Celebra</h3>
                <p className="text-text-muted">
                  Comparte el enlace y tus invitados confirmarán asistencia
                </p>
              </Card>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};
