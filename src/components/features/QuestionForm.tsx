import React from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardBody } from '../ui/card';
import type { Question } from '../../types/party';

interface QuestionFormProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string | string[]>) => void;
  onSkip?: () => void;
  isLoading?: boolean;
  allowSkip?: boolean;
  initialAnswers?: Record<string, string | string[]>;
  isReadOnly?: boolean;
}

// Generar esquema Zod dinámicamente basado en preguntas
const generateQuestionSchema = (questions: Question[]) => {
  const shape: Record<string, any> = {};

  questions.forEach((q) => {
    if (q.type === 'text') {
      shape[q.id] = q.required
        ? z.string().min(1, 'Campo requerido')
        : z.string().optional();
    } else if (q.type === 'single-choice') {
      shape[q.id] = q.required
        ? z.string().min(1, 'Debes seleccionar una opción')
        : z.string().optional();
    } else if (q.type === 'multi-choice') {
      shape[q.id] = q.required
        ? z.array(z.string()).min(1, 'Debes seleccionar al menos una opción')
        : z.array(z.string()).optional();
    }
  });

  return z.object(shape);
};

export const QuestionForm: React.FC<QuestionFormProps> = ({
  questions,
  onSubmit,
  onSkip,
  isLoading = false,
  allowSkip = true,
  initialAnswers = {},
  isReadOnly = false,
}) => {
  const schema = generateQuestionSchema(questions);
  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: initialAnswers as FormValues,
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit(data as Record<string, string | string[]>);
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-8">
          <p className="text-text-muted mb-4">No hay preguntas para responder</p>
          <Button onClick={onSkip} variant="primary">
            Continuar
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
      >
        {questions.map((question) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-text">
                {question.question}
                {question.required && <span className="text-error ml-1">*</span>}
              </label>

              {question.type === 'text' && (
                <Textarea
                  placeholder="Escribe tu respuesta aquí..."
                  error={errors[question.id as keyof FormValues]?.message}
                  disabled={isReadOnly}
                  {...register(question.id)}
                />
              )}

              {question.type === 'single-choice' && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 border border-border rounded-lg transition-colors ${
                        isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        disabled={isReadOnly}
                        value={option}
                        {...register(question.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-text">{option}</span>
                    </label>
                  ))}
                  {errors[question.id as keyof FormValues] && (
                    <p className="text-error text-sm">
                      {errors[question.id as keyof FormValues]?.message}
                    </p>
                  )}
                </div>
              )}

              {question.type === 'multi-choice' && (
                <div className="space-y-2">
                  {question.options?.map((option) => (
                    <label
                      key={option}
                      className={`flex items-center gap-3 p-3 border border-border rounded-lg transition-colors ${
                        isReadOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={option}
                        disabled={isReadOnly}
                        {...register(question.id)}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="text-text">{option}</span>
                    </label>
                  ))}
                  {errors[question.id as keyof FormValues] && (
                    <p className="text-error text-sm">
                      {errors[question.id as keyof FormValues]?.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex gap-3 mt-8 pt-6 border-t border-border">
        {allowSkip && onSkip && !isReadOnly && (
          <Button
            type="button"
            variant="ghost"
            onClick={onSkip}
            disabled={isLoading}
          >
            Saltar
          </Button>
        )}
        {!isReadOnly && (
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading}
            fullWidth={!allowSkip}
          >
            Enviar respuestas
          </Button>
        )}
      </div>
    </form>
  );
};
