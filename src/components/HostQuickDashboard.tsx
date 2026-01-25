import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from './ui/card';
import { useAuthStore } from '../stores/auth.store';
import { PartyService } from '../services/party.service';
import { motion } from 'framer-motion';
import type { Party } from '../types/party';

/**
 * Dashboard rápido para anfitrión en página de inicio
 */
export const HostQuickDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadParties = async () => {
      try {
        const data = await PartyService.getPartiesByHost(user.id);
        setParties(data.slice(0, 3)); // Mostrar solo las 3 más recientes
      } catch (error) {
        console.error('Error loading parties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadParties();
  }, [user?.id]);

  if (!user || user.role !== 'anfitrion') return null;

  const publishedCount = parties.filter((p) => p.status === 'published').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-text">Tus Fiestas</h2>
          <button
            onClick={() => navigate('/host')}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Ver todas →
          </button>
        </CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-text-muted">Cargando fiestas...</p>
          ) : parties.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-primary/5 rounded-lg p-3">
                  <p className="text-text-muted text-xs">Total</p>
                  <p className="text-2xl font-bold text-text">{parties.length}</p>
                </div>
                <div className="bg-accent/5 rounded-lg p-3">
                  <p className="text-text-muted text-xs">Publicadas</p>
                  <p className="text-2xl font-bold text-text">{publishedCount}</p>
                </div>
                <div className="bg-warning/5 rounded-lg p-3">
                  <p className="text-text-muted text-xs">En Borrador</p>
                  <p className="text-2xl font-bold text-text">{parties.length - publishedCount}</p>
                </div>
              </div>

              <div className="space-y-2">
                {parties.map((party) => (
                  <div
                    key={party.id}
                    className="p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/host/party/${party.party_uuid}?p_uuid=${party.party_uuid}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{party.title}</p>
                        <p className="text-xs text-text-muted">
                          {party.date ? new Date(party.date).toLocaleDateString('es-ES') : 'Sin fecha'}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        party.status === 'published'
                          ? 'bg-accent/20 text-accent'
                          : party.status === 'draft'
                          ? 'bg-warning/20 text-warning'
                          : 'bg-error/20 text-error'
                      }`}>
                        {party.status === 'published' ? 'Publicada' : party.status === 'draft' ? 'Borrador' : 'Archivada'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate('/host/create')}
                className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                + Crear Nueva Fiesta
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-text-muted mb-4">Aún no has creado ninguna fiesta</p>
              <button
                onClick={() => navigate('/host/create')}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Crear Primera Fiesta
              </button>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  );
};
