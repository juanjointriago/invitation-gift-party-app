import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardBody } from '../ui/card';
import { Button } from '../ui/button';
import type { Gift } from '../../types/party';
import type { AnswerToQuestion } from '../../types/party';

interface GiftSelectorProps {
  gifts: Gift[];
  onSelect: (giftId: string) => void;
  selectedGiftId?: string;
  isLoading?: boolean;
  groupByCategory?: boolean;
  filterByAnswers?: boolean;
  userAnswers?: AnswerToQuestion[];
}

export const GiftSelector: React.FC<GiftSelectorProps> = ({
  gifts,
  onSelect,
  selectedGiftId,
  isLoading = false,
  groupByCategory = true,
  filterByAnswers = false,
  userAnswers = [],
}) => {
  // Filtrar regalos basado en las respuestas del usuario
  const filteredGifts = useMemo(() => {
    if (!filterByAnswers || userAnswers.length === 0) {
      return gifts;
    }

    // Extraer las categorías de las respuestas del usuario
    const userCategories = new Set<string>();
    
    userAnswers.forEach((answer) => {
      // Normalizar la respuesta a minúsculas para comparación
      if (typeof answer.answer === 'string') {
        userCategories.add(answer.answer.toLowerCase().trim());
      } else if (Array.isArray(answer.answer)) {
        answer.answer.forEach((ans) => {
          userCategories.add(ans.toLowerCase().trim());
        });
      }
    });

    // Si no hay categorías en las respuestas, mostrar todos los regalos
    if (userCategories.size === 0) {
      return gifts;
    }

    // Filtrar regalos que coincidan con alguna categoría de las respuestas
    const filtered = gifts.filter((gift) => {
      // Si el regalo no tiene categoría o es "default" o "unisex", siempre mostrarlo
      if (!gift.category || gift.category === 'default' || gift.category === 'unisex') {
        return true;
      }

      // Verificar si la categoría del regalo coincide con alguna respuesta
      const giftCategory = gift.category.toLowerCase().trim();
      return userCategories.has(giftCategory);
    });

    console.log('🎁 Filtrado de regalos:', {
      totalGifts: gifts.length,
      filteredGifts: filtered.length,
      userCategories: Array.from(userCategories),
      filterEnabled: filterByAnswers,
    });

    return filtered;
  }, [gifts, filterByAnswers, userAnswers]);

  // Agrupar regalos por categoría si es necesario
  const groupedGifts = groupByCategory
    ? filteredGifts.reduce(
        (acc, gift) => {
          const category = gift.category || 'default';
          if (!acc[category]) acc[category] = [];
          acc[category].push(gift);
          return acc;
        },
        {} as Record<string, Gift[]>
      )
    : { all: filteredGifts };

  const isGiftAvailable = (gift: Gift) => gift.remainingQuantity > 0;

  // Mensaje si no hay regalos después del filtrado
  if (filteredGifts.length === 0 && filterByAnswers) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🎁</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          No hay regalos disponibles para tu selección
        </h3>
        <p className="text-gray-600">
          Basado en tus respuestas, no encontramos regalos en esta categoría. 
          Por favor, contacta al anfitrión para más opciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedGifts).map(([category, categoryGifts]) => (
        <div key={category}>
          {groupByCategory && category !== 'default' && (
            <h3 className="text-lg font-bold text-text mb-4 capitalize">{category}</h3>
          )}

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.05 }}
          >
            {categoryGifts.map((gift) => {
              const available = isGiftAvailable(gift);
              const isSelected = selectedGiftId === gift.id;

              return (
                <motion.div
                  key={gift.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    onClick={() => {
                      if (available && !isLoading) {
                        onSelect(gift.id);
                      }
                    }}
                    className={`
                      cursor-pointer
                      transition-all
                      duration-300
                      transform
                      hover:shadow-lg
                      ${!available ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}
                    `}
                    hoverable={available}
                  >
                    <CardBody className="space-y-3">
                      <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center text-4xl">
                        🎁
                      </div>

                      <h3 className="text-lg font-bold text-text line-clamp-2">
                        {gift.name}
                      </h3>

                      {gift.description && (
                        <p className="text-sm text-text-muted line-clamp-2">
                          {gift.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-xs font-semibold text-text-muted">
                          Disponibles
                        </span>
                        <span
                          className={`
                            text-sm
                            font-bold
                            ${
                              available
                                ? 'text-success'
                                : 'text-error'
                            }
                          `}
                        >
                          {gift.remainingQuantity} / {gift.maxQuantity}
                        </span>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-2 bg-primary/10 rounded text-primary font-bold text-sm"
                        >
                          ✓ Seleccionado
                        </motion.div>
                      )}

                      {!available && (
                        <div className="text-center py-2 bg-gray-100 rounded text-gray-600 font-semibold text-sm">
                          No disponible
                        </div>
                      )}

                      {!isSelected && available && (
                        <Button
                          size="sm"
                          variant="primary"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelect(gift.id);
                          }}
                          isLoading={isLoading}
                        >
                          Seleccionar
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      ))}
    </div>
  );
};
