import React from 'react';
import { Card } from '../components/ui/card';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="text-center p-12">
        <h1 className="text-5xl font-bold text-error mb-4">404</h1>
        <p className="text-xl text-text-muted mb-6">Página no encontrada</p>
        <a href="/" className="text-primary hover:underline">
          Volver al inicio
        </a>
      </Card>
    </div>
  );
};
