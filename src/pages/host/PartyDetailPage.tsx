import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { PartyShareButton } from '../../components/PartyShareButton';
import { AssistancesTable } from '../../components/AssistancesTable';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import type { PartyAssistanceGift } from '../../types/party';
import { motion } from 'framer-motion';

export const PartyDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const { fullParty, error: partyError } = usePartyLoader(p_uuid);
  const [assistances, setAssistances] = useState<PartyAssistanceGift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!p_uuid || !fullParty) return;

    const loadAssistances = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await PartyAssistanceService.getAssistancesByParty(p_uuid);
        setAssistances(data);
      } catch (err) {
        setError('Error cargando asistencias. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadAssistances();
  }, [p_uuid, fullParty]);

  const giftCounts: Record<string, number> = {};
  assistances.forEach((a) => {
    giftCounts[a.selectedGiftId] = (giftCounts[a.selectedGiftId] || 0) + 1;
  });

  const topGifts = Object.entries(giftCounts)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-text">{fullParty?.title || 'Fiesta'}</h1>
          <p className="text-text-muted mt-2">
            {assistances.length} confirmadas · {fullParty?.giftList?.length || 0} regalos
          </p>
        </div>
        <div className="flex gap-3">
          <PartyShareButton partyUuid={p_uuid} partyTitle={fullParty?.title} />
          {fullParty?.questions && fullParty.questions.length > 0 && (
            <Button variant="outline" onClick={() => navigate(`/host/party/${p_uuid}/responses?p_uuid=${p_uuid}`)}>
              📊 Ver Respuestas
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate(`/host/party/${p_uuid}/editor?p_uuid=${p_uuid}`)}>
            Editar fiesta
          </Button>
          <Button onClick={() => navigate('/host')}>Volver</Button>
        </div>
      </motion.div>

      {partyError && <div className="bg-error/10 border border-error text-error p-4 rounded-md">{partyError}</div>}
      {error && <div className="bg-error/10 border border-error text-error p-4 rounded-md">{error}</div>}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Resumen de asistencias */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-text">Asistencias</h2>
          </CardHeader>
          <CardBody>
            <div className="text-4xl font-bold text-primary">{assistances.length}</div>
            <p className="text-text-muted text-sm mt-2">invitados confirmados</p>
          </CardBody>
        </Card>

        {/* Regalos más solicitados */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-text">Regalos populares</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {topGifts.length > 0 ? (
              topGifts.map(([giftId, count]) => {
                const gift = fullParty?.giftList?.find((g) => g.id === giftId);
                return (
                  <div key={giftId} className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">{gift?.name || giftId}</p>
                      <p className="text-xs text-text-muted">{count} seleccionados</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-text-muted text-sm">Sin regalos seleccionados aún</p>
            )}
          </CardBody>
        </Card>

        {/* Disponibilidad de regalos */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-bold text-text">Disponibilidad</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {fullParty?.giftList && fullParty.giftList.length > 0 ? (
              fullParty.giftList.slice(0, 3).map((gift) => (
                <div key={gift.id} className="flex justify-between items-center gap-2">
                  <p className="text-sm text-text truncate">{gift.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={gift.remainingQuantity > 0 ? 'text-primary' : 'text-error'}>
                      {gift.remainingQuantity}
                    </span>
                    <span className="text-text-muted text-xs">/ {gift.maxQuantity}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-text-muted text-sm">Sin regalos</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Tabla de asistencias */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-text">Asistencias confirmadas</h2>
        </CardHeader>
        <CardBody>
          <AssistancesTable data={assistances} isLoading={loading} />
        </CardBody>
      </Card>
    </div>
  );
};
