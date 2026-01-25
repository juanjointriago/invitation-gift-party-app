import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from './button';

export interface MultiStepFormStep {
  id: string;
  title: string;
  description?: string;
  content: React.ReactNode;
}

interface MultiStepFormProps {
  steps: MultiStepFormStep[];
  onSubmit: (currentStep: number) => void | Promise<void>;
  onStepChange?: (stepIndex: number) => void;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  allowSkip?: boolean;
  isLoading?: boolean;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onSubmit,
  onStepChange,
  showProgress = true,
  showStepNumbers = true,
  allowSkip = false,
  isLoading = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      onStepChange?.(stepIndex);
    }
  };

  const goNext = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const goPrevious = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(currentStep);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      {showProgress && (
        <div className="mb-8">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-6">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                {/* Step Button */}
                <motion.button
                  type="button"
                  onClick={() => goToStep(index)}
                  className={`
                    relative
                    flex
                    flex-col
                    items-center
                    transition-all
                    duration-300
                  `}
                  whileHover={{ scale: 1.05 }}
                >
                  {/* Circle */}
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor:
                        index <= currentStep
                          ? 'rgb(18, 52, 86)' // primary
                          : 'rgb(230, 230, 230)', // gray
                    }}
                    className={`
                      w-10
                      h-10
                      rounded-full
                      flex
                      items-center
                      justify-center
                      font-semibold
                      text-sm
                      transition-colors
                      duration-300
                      ${
                        index <= currentStep
                          ? 'text-white shadow-lg'
                          : 'text-text-muted border-2 border-border'
                      }
                    `}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      showStepNumbers && <span>{index + 1}</span>
                    )}
                  </motion.div>

                  {/* Title */}
                  <p
                    className={`
                      mt-2
                      text-xs
                      font-medium
                      text-center
                      max-w-[80px]
                      ${
                        index <= currentStep
                          ? 'text-primary'
                          : 'text-text-muted'
                      }
                    `}
                  >
                    {step.title}
                  </p>
                </motion.button>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor:
                        index < currentStep
                          ? 'rgb(18, 52, 86)' // primary
                          : 'rgb(230, 230, 230)', // gray
                    }}
                    className="flex-1 h-1 mx-2 my-5 transition-colors duration-300"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-border p-8 min-h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text mb-2">
                {steps[currentStep].title}
              </h2>
              {steps[currentStep].description && (
                <p className="text-text-muted">
                  {steps[currentStep].description}
                </p>
              )}
            </div>

            {/* Step Content */}
            <div>{steps[currentStep].content}</div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4 mt-8">
        <Button
          variant="outline"
          size="md"
          onClick={goPrevious}
          disabled={isFirstStep || isSubmitting || isLoading}
          leftIcon={<ChevronLeft className="w-4 h-4" />}
        >
          Anterior
        </Button>

        {allowSkip && !isLastStep && (
          <Button
            variant="ghost"
            size="md"
            onClick={goNext}
            disabled={isSubmitting || isLoading}
          >
            Saltar
          </Button>
        )}

        <Button
          variant="primary"
          size="md"
          onClick={isLastStep ? handleSubmit : goNext}
          isLoading={isSubmitting || isLoading}
          rightIcon={
            !isLastStep && !isSubmitting ? (
              <ChevronRight className="w-4 h-4" />
            ) : null
          }
        >
          {isLastStep ? 'Completar' : 'Siguiente'}
        </Button>
      </div>

      {/* Step Counter */}
      <p className="text-center text-text-muted text-sm mt-6">
        Paso {currentStep + 1} de {steps.length}
      </p>
    </div>
  );
};
