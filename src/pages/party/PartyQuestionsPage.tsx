import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { QuestionForm } from '../../components/features';
import { SkeletonLoader } from '../../components/ui/skeleton-loader';
import { usePartyQuestionsStore } from '../../stores/party-questions.store';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { toast } from 'sonner';

export const PartyQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAnswer } = usePartyQuestionsStore();
  const { fullParty, loading: partyLoading, error: partyError } = usePartyLoader(p_uuid);

  useEffect(() => {
    if (!p_uuid) {
      navigate('/');
    }
  }, [navigate, p_uuid]);

  const questions = fullParty?.questions || [];

  // Si no hay preguntas, redirigir al home
  useEffect(() => {
    if (!partyLoading && questions.length === 0) {
      navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`);
    }
  }, [partyLoading, questions.length, p_uuid, navigate]);

  const handleSubmitQuestions = async (answers: Record<string, string | string[]>) => {
    setIsSubmitting(true);
    try {
      // Guardar respuestas en el store
      Object.entries(answers).forEach(([questionId, answer]) => {
        const question = questions.find((q) => q.id === questionId);
        if (question) {
          setAnswer(questionId, answer, question.question);
        }
      });
      
      toast.success('Respuestas guardadas');
      navigate(`/party/${p_uuid}/home?p_uuid=${p_uuid}`);
    } catch (err) {
      toast.error('Error al guardar respuestas');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
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
            <h2 className="text-2xl font-bold text-primary">Cuéntanos un poco...</h2>
            <p className="text-text-muted text-sm">
              {questions.length > 0
                ? 'Responde estas preguntas rápidas del anfitrión. Las preguntas sin asterisco son opcionales.'
                : 'No hay preguntas para responder. Continúa al home de la fiesta.'}
            </p>
          </CardHeader>
          
          <CardBody className="space-y-6">
            {partyLoading ? (
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
              <QuestionForm
                questions={questions}
                onSubmit={handleSubmitQuestions}
                onSkip={handleSkip}
                isLoading={isSubmitting}
                allowSkip={true}
              />
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
