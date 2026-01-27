import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { QuestionForm } from '../../components/features';
import { SkeletonLoader } from '../../components/ui/skeleton-loader';
import { usePartyQuestionsStore } from '../../stores/party-questions.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { useAuthStore } from '../../stores/auth.store';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import { toast } from 'sonner';

export const PartyQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loadingAssistance, setLoadingAssistance] = useState(true);

  const { setAnswer, clearAnswers, answers } = usePartyQuestionsStore();
  const { user } = useAuthStore();
  const { fullParty, loading: partyLoading, error: partyError } = usePartyLoader(p_uuid);

  useEffect(() => {
    if (!p_uuid) {
      navigate('/');
      return;
    }
    // Limpiar respuestas previas al cambiar de fiesta para evitar fugas de estado
    clearAnswers();
  }, [navigate, p_uuid, clearAnswers]);

  // Cargar respuestas previas si ya respondió
  useEffect(() => {
    const loadPreviousAnswers = async () => {
      if (!user?.id || !p_uuid || partyLoading) return;

      try {
        setLoadingAssistance(true);
        const assistance = await PartyAssistanceService.getAssistanceByGuest(p_uuid, user.id);
        
        if (assistance && assistance.answersToQuestions && assistance.answersToQuestions.length > 0) {
          // Cargar respuestas previas en el store
          assistance.answersToQuestions.forEach((answer) => {
            setAnswer(answer.questionId, answer.answer, answer.questionTextSnapshot || '');
          });
          setHasSubmitted(true);
          toast.info('Tus respuestas anteriores han sido cargadas');
        }
      } catch (error) {
        console.error('Error loading previous answers:', error);
      } finally {
        setLoadingAssistance(false);
      }
    };

    loadPreviousAnswers();
  }, [user?.id, p_uuid, partyLoading, setAnswer]);

  const questions = fullParty?.questions || [];

  const handleSubmitQuestions = async (answersData: Record<string, string | string[]>) => {
    if (!user?.id) {
      toast.error('Debes iniciar sesión para responder');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convertir respuestas a formato AnswerToQuestion
      const answersToQuestions = Object.entries(answersData).map(([questionId, answer]) => {
        const question = questions.find((q) => q.id === questionId);
        return {
          questionId,
          questionTextSnapshot: question?.question || '',
          answer,
        };
      });

      // Guardar respuestas en el store local
      Object.entries(answersData).forEach(([questionId, answer]) => {
        const question = questions.find((q) => q.id === questionId);
        if (question) {
          setAnswer(questionId, answer, question.question);
        }
      });

      // Verificar si ya existe un registro de asistencia
      const existingAssistance = await PartyAssistanceService.getAssistanceByGuest(p_uuid, user.id);

      if (existingAssistance) {
        // Actualizar registro existente con las respuestas
        await PartyAssistanceService.updateAssistanceAnswers(
          p_uuid,
          user.id,
          answersToQuestions
        );
        toast.success('Respuestas actualizadas exitosamente');
      } else {
        // Crear nuevo registro de asistencia con las respuestas
        await PartyAssistanceService.createInitialAssistanceWithAnswers(
          p_uuid,
          user.id,
          answersToQuestions
        );
        toast.success('Respuestas guardadas exitosamente');
      }

      setHasSubmitted(true);
      
      // Redirigir después de un breve delay para que vea el mensaje
      setTimeout(() => {
        navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`);
      }, 1500);
    } catch (err) {
      console.error('Error al guardar respuestas:', err);
      toast.error('Error al guardar respuestas. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast.info('Puedes responder más tarde');
    navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`);
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
              {hasSubmitted ? 'Tus Respuestas' : 'Cuéntanos un poco...'}
            </h2>
            <p className="text-text-muted text-sm">
              {hasSubmitted
                ? 'Ya has respondido estas preguntas anteriormente. Aquí puedes ver tus respuestas.'
                : questions.length > 0
                ? 'Responde estas preguntas rápidas del anfitrión. Las preguntas sin asterisco son opcionales.'
                : 'No hay preguntas para responder. Continúa al home de la fiesta.'}
            </p>
          </CardHeader>
          
          <CardBody className="space-y-6">
            {partyLoading || loadingAssistance ? (
              <SkeletonLoader type="text" height="h-32" count={3} />
            ) : partyError ? (
              <div className="bg-error/10 border border-error text-error p-4 rounded-md">
                <p className="font-semibold">Error al cargar preguntas</p>
                <p className="text-sm mt-1">{partyError}</p>
                <Button size="sm" onClick={() => navigate(`/party/${p_uuid}`)} className="mt-4">
                  Volver
                </Button>
              </div>
            ) : questions.length > 0 ? (
              <>
                <QuestionForm
                  questions={questions}
                  onSubmit={handleSubmitQuestions}
                  onSkip={handleSkip}
                  isLoading={isSubmitting}
                  allowSkip={!hasSubmitted}
                  initialAnswers={answers.reduce((acc, answer) => {
                    acc[answer.questionId] = answer.answer;
                    return acc;
                  }, {} as Record<string, string | string[]>)}
                  isReadOnly={hasSubmitted}
                />
                {hasSubmitted && (
                  <div className="pt-4 border-t border-border">
                    <Button
                      onClick={() => navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`)}
                      fullWidth
                    >
                      Volver al Home
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-muted mb-4">No hay preguntas para responder</p>
                <Button onClick={handleSkip}>Continuar</Button>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};
