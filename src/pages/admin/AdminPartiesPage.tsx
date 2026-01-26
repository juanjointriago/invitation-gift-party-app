import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Eye, Trash2, Archive } from 'lucide-react';
import { useNotificationStore } from '../../stores/notification.store';
import { PartyService } from '../../services/party.service';
import type { Party } from '../../types/party';

export const AdminPartiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  useEffect(() => {
    loadParties();
  }, []);

  const loadParties = async () => {
    try {
      setLoading(true);
      // TODO: Implementar getAllParties en PartyService
      setParties([]);
    } catch (error) {
      console.error('Error loading parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partyUuid: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta fiesta? Esta acción no se puede deshacer.')) {
      try {
        await PartyService.deleteParty(partyUuid);
        setParties(parties.filter(p => p.party_uuid !== partyUuid));
        addNotification({
          type: 'success',
          message: 'Fiesta eliminada',
          description: 'La fiesta ha sido eliminada correctamente',
        });
      } catch (error) {
        console.error('Error deleting party:', error);
        addNotification({
          type: 'error',
          message: 'Error al eliminar',
          description: 'No se pudo eliminar la fiesta',
        });
      }
    }
  };

  const handleArchive = async (partyUuid: string) => {
    if (confirm('¿Deseas archivar esta fiesta?')) {
      try {
        await PartyService.archiveParty(partyUuid);
        setParties(parties.map(p => 
          p.party_uuid === partyUuid 
            ? { ...p, status: 'archived' as const }
            : p
        ));
        addNotification({
          type: 'success',
          message: 'Fiesta archivada',
          description: 'La fiesta ha sido archivada correctamente',
        });
      } catch (error) {
        console.error('Error archiving party:', error);
        addNotification({
          type: 'error',
          message: 'Error al archivar',
          description: 'No se pudo archivar la fiesta',
        });
      }
    }
  };

  const filteredParties = parties.filter(party => {
    if (filter === 'all') return true;
    return party.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Publicada</Badge>;
      case 'draft':
        return <Badge variant="warning">Borrador</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archivada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Gestión de Fiestas</h1>
          <p className="text-text-muted mt-1">Administra todas las fiestas del sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-surface border border-border text-text hover:bg-surface-hover'
            }`}
          >
            {status === 'all' && `Todas (${parties.length})`}
            {status === 'published' && `Publicadas (${parties.filter(p => p.status === 'published').length})`}
            {status === 'draft' && `Borradores (${parties.filter(p => p.status === 'draft').length})`}
            {status === 'archived' && `Archivadas (${parties.filter(p => p.status === 'archived').length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-text-muted">Cargando fiestas...</p>
        </div>
      ) : filteredParties.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-text-muted text-lg mb-4">
                {filter === 'all'
                  ? 'No hay fiestas registradas aún'
                  : `No hay fiestas ${filter}`}
              </p>
              {filter === 'all' && (
                <p className="text-sm text-text-muted mb-6">
                  Los anfitriones pueden crear sus fiestas desde el dashboard de host
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredParties.map((party) => (
            <Card key={party.party_uuid} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text">{party.title}</h3>
                      {getStatusBadge(party.status)}
                    </div>
                    <p className="text-text-muted text-sm mb-2">{party.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                      <span>📍 {party.location}</span>
                      <span>📅 {new Date(party.date).toLocaleDateString('es-ES')}</span>
                      <span>👤 {party.host_user_id}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/party/${party.party_uuid}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden sm:inline">Ver</span>
                    </Button>
                    {party.status !== 'archived' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArchive(party.party_uuid)}
                        className="flex items-center gap-2"
                      >
                        <Archive className="h-4 w-4" />
                        <span className="hidden sm:inline">Archivar</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(party.party_uuid)}
                      className="flex items-center gap-2 text-error hover:bg-error/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
