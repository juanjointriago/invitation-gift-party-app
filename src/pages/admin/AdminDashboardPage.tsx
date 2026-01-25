import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { PartyService } from '../../services/party.service';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import type { Party, PartyAssistanceGift } from '../../types/party';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const AdminDashboardPage: React.FC = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [assistances, setAssistances] = useState<PartyAssistanceGift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const partiesData = await PartyService.getAllParties();
        setParties(partiesData);

        // Cargar asistencias de todas las fiestas publicadas
        const allAssistances: PartyAssistanceGift[] = [];
        for (const party of partiesData.filter((p) => p.status === 'published')) {
          const partyAssistances = await PartyAssistanceService.getAssistancesByParty(party.party_uuid);
          allAssistances.push(...partyAssistances);
        }
        setAssistances(allAssistances);
      } catch (err) {
        setError('Error cargando datos. Intenta de nuevo.');
        toast.error('Error cargando datos del admin');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const publishedParties = parties.filter((p) => p.status === 'published');
  const totalGifts = parties.reduce((sum, p) => sum + (p.giftList?.length || 0), 0);
  const totalQuestions = parties.reduce((sum, p) => sum + (p.questions?.length || 0), 0);

  const statusCounts = {
    published: parties.filter((p) => p.status === 'published').length,
    draft: parties.filter((p) => p.status === 'draft').length,
    archived: parties.filter((p) => p.status === 'archived').length,
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-text">Panel de administrador</h1>
        <p className="text-text-muted">Resumen general de fiestas, invitados y estadísticas.</p>
      </motion.div>

      {error && <div className="bg-error/10 border border-error text-error p-4 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-text-muted">Cargando datos...</p>
        </div>
      ) : (
        <>
          {/* Estadísticas principales */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-medium text-text-muted">Total de fiestas</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-4xl font-bold text-primary">{parties.length}</div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-medium text-text-muted">Fiestas publicadas</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-4xl font-bold text-primary">{statusCounts.published}</div>
                  <p className="text-xs text-text-muted mt-2">{assistances.length} asistencias</p>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-medium text-text-muted">Total de regalos</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-4xl font-bold text-primary">{totalGifts}</div>
                </CardBody>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <h3 className="text-sm font-medium text-text-muted">Total de preguntas</h3>
                </CardHeader>
                <CardBody>
                  <div className="text-4xl font-bold text-primary">{totalQuestions}</div>
                </CardBody>
              </Card>
            </motion.div>
          </div>

          {/* Estado de fiestas */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Estado de fiestas</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary/5 rounded-md">
                  <p className="text-3xl font-bold text-primary">{statusCounts.published}</p>
                  <p className="text-sm text-text-muted mt-1">Publicadas</p>
                </div>
                <div className="text-center p-4 bg-warning/5 rounded-md">
                  <p className="text-3xl font-bold text-warning">{statusCounts.draft}</p>
                  <p className="text-sm text-text-muted mt-1">Borradores</p>
                </div>
                <div className="text-center p-4 bg-text-muted/5 rounded-md">
                  <p className="text-3xl font-bold text-text-muted">{statusCounts.archived}</p>
                  <p className="text-sm text-text-muted mt-1">Archivadas</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Últimas fiestas publicadas */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-text">Fiestas recientes</h2>
            </CardHeader>
            <CardBody>
              {publishedParties.length === 0 ? (
                <p className="text-text-muted text-sm">Sin fiestas publicadas</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-border">
                      <tr className="text-text-muted">
                        <th className="text-left py-2 px-4">Título</th>
                        <th className="text-left py-2 px-4">Fecha</th>
                        <th className="text-left py-2 px-4">Regalos</th>
                        <th className="text-left py-2 px-4">Asistencias</th>
                      </tr>
                    </thead>
                    <tbody>
                      {publishedParties.slice(0, 10).map((party) => {
                        const partyAssistances = assistances.filter((a) => a.party_uuid === party.party_uuid)
                          .length;
                        return (
                          <tr key={party.party_uuid} className="border-b border-border hover:bg-background/50">
                            <td className="py-3 px-4 font-medium text-text">{party.title}</td>
                            <td className="py-3 px-4 text-text-muted text-xs">
                              {new Date(party.date).toLocaleDateString('es-ES')}
                            </td>
                            <td className="py-3 px-4 text-text">{party.giftList?.length || 0}</td>
                            <td className="py-3 px-4 text-primary font-medium">{partyAssistances}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
};
