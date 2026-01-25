import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import type { AnswerToQuestion } from '../types/party';
import type { LoadingState } from '../types/common';

interface PartyQuestionsState extends LoadingState {
  // Respuestas del invitado actual
  answers: AnswerToQuestion[];
  
  // Acciones
  setAnswer: (questionId: string, answer: string | string[], questionText: string) => void;
  getAnswer: (questionId: string) => string | string[] | undefined;
  clearAnswers: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const createPartyQuestionsStore: StateCreator<PartyQuestionsState> = (set, get) => ({
  // Initial state
  answers: [],
  loading: false,
  error: null,

  // Actions
  setAnswer: (questionId: string, answer: string | string[], questionText: string) => {
    set((state) => {
      const existingIndex = state.answers.findIndex((a) => a.questionId === questionId);
      
      if (existingIndex >= 0) {
        // Actualizar respuesta existente
        const updated = [...state.answers];
        updated[existingIndex] = {
          ...updated[existingIndex],
          answer,
        };
        return { answers: updated };
      } else {
        // Agregar nueva respuesta
        return {
          answers: [
            ...state.answers,
            {
              questionId,
              questionTextSnapshot: questionText,
              answer,
            },
          ],
        };
      }
    });
  },

  getAnswer: (questionId: string) => {
    const state = get();
    const found = state.answers.find((a) => a.questionId === questionId);
    return found?.answer;
  },

  clearAnswers: () => {
    set({ answers: [] });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
});

export const usePartyQuestionsStore = create<PartyQuestionsState>()(
  devtools(createPartyQuestionsStore, { name: 'PartyQuestionsStore' })
);
