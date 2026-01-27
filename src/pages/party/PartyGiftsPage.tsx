import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { GiftSelector } from '../../components/features';
import { SkeletonLoader } from '../../components/ui/skeleton-loader';
import { usePartyGiftsStore, useSelectedGift } from '../../stores/party-gifts.store';
import type { Gift } from '../../types/party';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import { PartyService } from '../../services/party.service';
import { usePartyQuestionsStore } from '../../stores/party-questions.store';
import { useAuthStore } from '../../stores/auth.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { toast } from 'sonner';

const mockGifts: Gift[] = [
  {
    id: 'g1',
    name: 'Pañitos húmedos x6',
    description: 'Para bebé',
    category: 'niño',
    maxQuantity: 6,
    remainingQuantity: 2,
  },
  {
    id: 'g2',
    name: 'Set de mantas',
    description: 'Mantas suaves',
    category: 'unisex',
    maxQuantity: 3,
    remainingQuantity: 0,
  },
];

export const PartyGiftsPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const setGifts = usePartyGiftsStore((s) => s.setGifts);
  const selectGift = usePartyGiftsStore((s) => s.selectGift);
  const updateGift = usePartyGiftsStore((s) => s.updateGift);
  const clearSelection = usePartyGiftsStore((s) => s.clearSelection);
  const gifts = usePartyGiftsStore((s) => s.gifts);
  const selectedGift = useSelectedGift();
  const selectedGiftId = selectedGift?.id;
  const answers = usePartyQuestionsStore((s) => s.answers);
  const { user } = useAuthStore();
  const { fullParty, loading: partyLoading, error: partyError } = usePartyLoader(p_uuid);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSelectedGift, setHasSelectedGift] = useState(false);
  const [existingGiftName, setExistingGiftName] = useState<string>('');
  const [loadingAssistance, setLoadingAssistance] = useState(true);
  const submittedRef = useRef(false);

  // Cargar regalo previamente seleccionado
  useEffect(() => {
    const loadExistingGift = async () => {
      if (!user?.id || !p_uuid || partyLoading) return;

      try {
        setLoadingAssistance(true);
        const assistance = await PartyAssistanceService.getAssistanceByGuest(p_uuid, user.id);
        
        if (assistance && assistance.selectedGiftId && assistance.selectedGiftId !== '') {
          setHasSelectedGift(true);
          setExistingGiftName(assistance.selectedGiftNameSnapshot || 'Tu regalo seleccionado');
          // Marcar el regalo como seleccionado en el store
          selectGift(assistance.selectedGiftId);
          toast.info('Ya tienes un regalo seleccionado anteriormente');
        }
      } catch (error) {
        console.error('Error loading existing gift:', error);
      } finally {
        setLoadingAssistance(false);
      }
    };

    loadExistingGift();
  }, [user?.id, p_uuid, partyLoading, selectGift]);

  useEffect(() => {
    if (!p_uuid) {
      navigate('/');
      return;
    }

    if (fullParty) {
      const giftsFromParty = (fullParty.giftList || []).map((g) => ({
        ...g,
        isAvailable: g.remainingQuantity > 0,
        isSelected: selectedGiftId === g.id,
      }));

      if (giftsFromParty.length > 0) {
        setGifts(giftsFromParty as any);
      } else if (gifts.length === 0) {
        setGifts(mockGifts.map(g => ({ ...g, isAvailable: g.remainingQuantity > 0, isSelected: false })) as any);
      }
    } else if (gifts.length === 0 && !partyLoading) {
      setGifts(mockGifts.map(g => ({ ...g, isAvailable: g.remainingQuantity > 0, isSelected: false })) as any);
    }
  }, [fullParty, gifts.length, navigate, p_uuid, partyLoading, selectedGiftId]);

  const handleSelectGift = (giftId: string) => {
    if (hasSelectedGift) {
      toast.warning('Ya tienes un regalo seleccionado. No puedes cambiar tu elección.');
      return;
    }
    selectGift(giftId);
  };

  const handleConfirm = async () => {
    // Prevenir si ya tiene un regalo seleccionado
    if (hasSelectedGift) {
      toast.warning('Ya has confirmado tu regalo anteriormente.');
      return;
    }

    // Prevenir doble envío
    if (submittedRef.current) return;

    if (!selectedGift) {
      toast.info('Elige un regalo antes de confirmar');
      return;
    }
    submittedRef.current = true;

    setSubmitting(true);
    setSubmitError(null);
    const guestId = user?.id || 'guest-temp';
    try {
      // Guardar la asistencia
      await PartyAssistanceService.submitAssistance(
        p_uuid,
        guestId,
        selectedGift.id,
        selectedGift.name,
        answers,
        1
      );

      // Actualizar cantidad disponible en backend
      await PartyService.decrementGiftQuantity(p_uuid, selectedGift.id);

      // Actualizar disponibilidad local de forma optimista (será sincronizado por listener)
      const nextRemaining = Math.max((selectedGift.remainingQuantity || 0) - 1, 0);
      updateGift(selectedGift.id, {
        remainingQuantity: nextRemaining,
      });
      
      // Marcar como que ya tiene un regalo seleccionado
      setHasSelectedGift(true);
      setExistingGiftName(selectedGift.name);
      
      clearSelection();

      toast.success('¡Regalo confirmado exitosamente! No podrás cambiar tu elección.');

      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`);
      }, 2000);
    } catch (err) {
      submittedRef.current = false; // Permitir reintentos en caso de error
      setSubmitError('No pudimos confirmar tu asistencia. Intenta nuevamente.');
      toast.error('No pudimos confirmar tu asistencia. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-primary">
              {hasSelectedGift ? 'Tu Regalo Seleccionado' : 'Elige un regalo para la fiesta'}
            </h2>
            <p className="text-text-muted text-sm">
              {hasSelectedGift
                ? 'Ya has seleccionado tu regalo. No es posible cambiarlo.'
                : 'Selecciona un regalo de la lista disponible para confirmar tu asistencia.'}
            </p>
          </CardHeader>

          <CardBody className="space-y-6">
            {loadingAssistance || partyLoading ? (
              <SkeletonLoader type="card" count={3} />
            ) : hasSelectedGift ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-success/10 border-2 border-success rounded-lg p-6 text-center"
              >
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-xl font-bold text-success mb-2">¡Regalo Confirmado!</h3>
                <p className="text-lg font-semibold text-text mb-4">{existingGiftName}</p>
                <p className="text-sm text-text-muted mb-6">
                  Tu regalo ha sido apartado exitosamente. Puedes ver los detalles de la fiesta en la página principal.
                </p>
                <Button
                  onClick={() => navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`)}
                  variant="primary"
                  className="mx-auto"
                >
                  Ir al Home de la Fiesta
                </Button>
              </motion.div>
            ) : partyError ? (
              <div className="bg-error/10 border border-error text-error p-4 rounded-md">
                <p className="font-semibold">Error al cargar regalos</p>
                <p className="text-sm mt-1">{partyError}</p>
              </div>
            ) : gifts.length > 0 ? (
              <>
                {fullParty?.questions?.length && answers.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-primary/5 border border-primary/30 text-primary p-4 rounded-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="font-semibold">Responde las preguntas primero</p>
                        <p className="text-sm text-text-muted">
                          Tienes preguntas pendientes. Responde para que el anfitrión conozca tus preferencias.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/party/${p_uuid}/questions?p_uuid=${p_uuid}`)}
                      >
                        Responder ahora
                      </Button>
                    </div>
                  </motion.div>
                ) : null}

                {submitError && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-error/10 border border-error text-error p-4 rounded-md"
                  >
                    {submitError}
                  </motion.div>
                )}

                {selectedGift && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary p-4 rounded-lg"
                  >
                    <p className="font-semibold text-primary">
                      Seleccionaste: <span>{selectedGift.name}</span>
                    </p>
                  </motion.div>
                )}

                <GiftSelector
                  gifts={gifts}
                  onSelect={handleSelectGift}
                  selectedGiftId={selectedGift?.id}
                  isLoading={submitting}
                  groupByCategory={true}
                />
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-muted mb-4">Aún no hay regalos cargados en esta fiesta</p>
              </div>
            )}
          </CardBody>

          {/* Botones de acción */}
          {gifts.length > 0 && !hasSelectedGift && (
            <div className="border-t border-border p-6 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => {
                clearSelection();
                navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`);
              }}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                disabled={!selectedGift || submitting || partyLoading}
                isLoading={submitting}
              >
                {submitting ? 'Confirmando...' : 'Confirmar asistencia'}
              </Button>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
