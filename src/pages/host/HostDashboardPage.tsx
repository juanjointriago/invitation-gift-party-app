import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../../stores/auth.store';
import { PartyService } from '../../services/party.service';
import type { Party } from '../../types/party';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export const HostDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadParties = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await PartyService.getPartiesByHost(user.id);
        setParties(data);
      } catch (err) {
        setError('Error cargando fiestas. Intenta de nuevo.');
        toast.error('Error cargando fiestas');
      } finally {
        setLoading(false);
      }
    };

    loadParties();
  }, [user?.id]);

  const handleCreateParty = () => {
    navigate('/host/party/new');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-text">Mis fiestas</h1>
          <p className="text-text-muted">Crea y administra tus fiestas.</p>
        </div>
        <Button onClick={handleCreateParty}>+ Nueva fiesta</Button>
      </motion.div>

      {error && <div className="bg-error/10 border border-error text-error p-4 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-text-muted">Cargando fiestas...</p>
        </div>
      ) : parties.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-text-muted mb-4">Aún no tienes fiestas creadas.</p>
            <Button onClick={handleCreateParty}>Crear mi primera fiesta</Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parties.map((party) => (
            <motion.div
              key={party.party_uuid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <h3 className="text-lg font-bold text-text line-clamp-2">{party.title}</h3>
                  <p className={`text-xs font-medium ${party.status === 'published' ? 'text-primary' : party.status === 'draft' ? 'text-warning' : 'text-text-muted'}`}>
                    {party.status === 'published' ? '✓ Publicada' : party.status === 'draft' ? '✎ Borrador' : 'Archivada'}
                  </p>
                </CardHeader>
                <CardBody className="flex-1 space-y-2">
                  <p className="text-text-muted text-sm line-clamp-2">{party.description}</p>
                  <p className="text-xs text-text-muted">
                    Fecha: {new Date(party.date).toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-xs text-text-muted">
                    {party.giftList?.length || 0} regalos · {party.questions?.length || 0} preguntas
                  </p>
                </CardBody>
                <div className="border-t border-border pt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/host/party/${party.party_uuid}?p_uuid=${party.party_uuid}`)}
                    fullWidth
                  >
                    Ver detalles
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/host/party/${party.party_uuid}/editor?p_uuid=${party.party_uuid}`)}
                    fullWidth
                  >
                    Editar
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
