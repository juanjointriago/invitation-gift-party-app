import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { usePartyLoader } from '../../hooks/usePartyLoader';
import { PartyAssistanceService } from '../../services/party-assistance.service';
import type { PartyAssistanceGift, Question } from '../../types/party';
import { motion } from 'framer-motion';
import { BarChart3, Download } from 'lucide-react';

export const PartyResponsesPage: React.FC = () => {
  const navigate = useNavigate();
  const { partyUuid } = useParams();
  const [searchParams] = useSearchParams();
  const p_uuid = searchParams.get('p_uuid') || partyUuid || '';

  const { fullParty } = usePartyLoader(p_uuid);
  const [assistances, setAssistances] = useState<PartyAssistanceGift[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!p_uuid) return;

    const loadAssistances = async () => {
      setLoading(true);
      try {
        const data = await PartyAssistanceService.getAssistancesByParty(p_uuid);
        setAssistances(data);
      } catch (error) {
        console.error('Error loading assistances:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAssistances();
  }, [p_uuid]);

  const getResponsesForQuestion = (question: Question) => {
    const responses: Record<string, number> = {};
    let totalResponses = 0;

    assistances.forEach((a) => {
      if (a.answersToQuestions) {
        const answer = a.answersToQuestions.find((ans: any) => ans.questionId === question.id);
        if (answer) {
          totalResponses++;
          if (Array.isArray(answer.answer)) {
            answer.answer.forEach((opt: string) => {
              responses[opt] = (responses[opt] || 0) + 1;
            });
          } else {
            const key = answer.answer || 'Sin respuesta';
            responses[key] = (responses[key] || 0) + 1;
          }
        }
      }
    });

    return { responses, totalResponses };
  };

  const handleExportCSV = () => {
    if (!fullParty) return;

    // Preparar headers
    const headers = ['Invitado', 'Regalo Seleccionado', 'Fecha', ...(fullParty.questions?.map((q) => q.question) || [])];

    // Preparar rows
    const rows = assistances.map((a) => {
      const rowData: string[] = [
        a.guest_user_id,
        a.selectedGiftNameSnapshot,
        new Date(a.createdAt || 0).toLocaleDateString('es-ES'),
      ];

      fullParty.questions?.forEach((q) => {
        const answer = a.answersToQuestions?.find((ans: any) => ans.questionId === q.id);
        if (answer) {
          if (Array.isArray(answer.answer)) {
            rowData.push(answer.answer.join(', '));
          } else {
            rowData.push(answer.answer);
          }
        } else {
          rowData.push('');
        }
      });

      return rowData;
    });

    // Crear CSV
    const csv = [
      headers.map((h) => `"${h}"`).join(','),
      ...rows.map((r) => r.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${fullParty.title}_respuestas_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <h1 className="text-3xl font-bold text-text">Respuestas de Invitados</h1>
          <p className="text-text-muted mt-2">{fullParty?.title || 'Fiesta'}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportCSV} className="gap-2">
            <Download size={18} />
            Exportar CSV
          </Button>
          <Button onClick={() => navigate(`/host/party/${p_uuid}?p_uuid=${p_uuid}`)}>Volver</Button>
        </div>
      </motion.div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-text-muted">Cargando respuestas...</p>
        </div>
      ) : !fullParty?.questions || fullParty.questions.length === 0 ? (
        <Card>
          <CardBody className="text-center py-8">
            <p className="text-text-muted">Esta fiesta no tiene preguntas configuradas</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {fullParty.questions.map((question) => {
            const { responses, totalResponses } = getResponsesForQuestion(question);
            const responseArray = Object.entries(responses).sort(([, a], [, b]) => b - a);

            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-text">{question.question}</h2>
                        <p className="text-sm text-text-muted mt-1">
                          Tipo: <span className="font-medium">{question.type === 'text' ? 'Texto libre' : question.type === 'single-choice' ? 'Opción única' : 'Múltiple opción'}</span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        <BarChart3 size={16} />
                        {totalResponses}
                      </span>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {question.type === 'text' ? (
                      <div className="space-y-3">
                        <p className="text-sm text-text-muted mb-4">
                          {totalResponses} respuesta{totalResponses !== 1 ? 's' : ''} recibida{totalResponses !== 1 ? 's' : ''}
                        </p>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {responseArray.map(([response, count]) => (
                            <div key={response} className="p-3 bg-background rounded-lg border border-border">
                              <p className="text-sm text-text italic">"{response}"</p>
                              <p className="text-xs text-text-muted mt-1">{count} persona{count !== 1 ? 's' : ''}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {responseArray.length > 0 ? (
                          responseArray.map(([option, count]) => {
                            const percentage = totalResponses > 0 ? ((count / totalResponses) * 100).toFixed(1) : 0;
                            return (
                              <div key={option}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-medium text-text">{option}</p>
                                  <span className="text-sm font-bold text-primary">
                                    {count} ({percentage}%)
                                  </span>
                                </div>
                                <div className="w-full bg-background rounded-full h-2.5">
                                  <div
                                    className="bg-primary h-2.5 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-text-muted text-sm">Sin respuestas aún</p>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
