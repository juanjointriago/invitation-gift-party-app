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
      const allParties = await PartyService.getAllParties();
      setParties(allParties);
    } catch (error) {
      console.error('Error loading parties:', error);
      addNotification({
        type: 'error',
        message: 'Error al cargar fiestas',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
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
          <h1 className="text-3xl font-bold text-text dark:text-gray-100">Gestión de Fiestas</h1>
          <p className="text-text-muted dark:text-gray-400 mt-1">Administra todas las fiestas del sistema</p>
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
                ? 'bg-primary dark:bg-purple-600 text-white'
                : 'bg-surface dark:bg-gray-800 border border-border dark:border-gray-700 text-text dark:text-gray-200 hover:bg-surface-hover dark:hover:bg-gray-700'
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
          <p className="text-text-muted dark:text-gray-400">Cargando fiestas...</p>
        </div>
      ) : filteredParties.length === 0 ? (
        <Card className="border-2 border-dashed dark:bg-gray-800">
          <CardBody className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <p className="text-text-muted dark:text-gray-400 text-lg mb-4">{filter === 'all'
                  ? 'No hay fiestas registradas aún'
                  : `No hay fiestas ${filter}`}
              </p>
              {filter === 'all' && (
                <p className="text-sm text-text-muted dark:text-gray-500 mb-6">
                  Los anfitriones pueden crear sus fiestas desde el dashboard de host
                </p>
              )}
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredParties.map((party) => (
            <Card key={party.party_uuid} className="hover:shadow-md transition-shadow dark:bg-gray-800">
              <CardBody>
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-text dark:text-gray-100">{party.title}</h3>
                        {getStatusBadge(party.status)}
                      </div>
                      <p className="text-text-muted dark:text-gray-400 text-sm mb-3">{party.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-text-muted dark:text-gray-400">
                        <span>📍 {party.location}</span>
                        <span>📅 {new Date(party.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                        <span>⏰ {new Date(party.date).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/host/party/${party.party_uuid}`)}
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

                  {/* Estadísticas */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-border dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary dark:text-purple-400">
                        {party.questions?.length || 0}
                      </div>
                      <div className="text-xs text-text-muted dark:text-gray-400">Preguntas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {party.giftList?.length || 0}
                      </div>
                      <div className="text-xs text-text-muted dark:text-gray-400">Regalos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {party.categories?.length || 0}
                      </div>
                      <div className="text-xs text-text-muted dark:text-gray-400">Categorías</div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border dark:border-gray-700 text-sm">
                    <div>
                      <span className="text-text-muted dark:text-gray-400">Anfitrión ID: </span>
                      <span className="text-text dark:text-gray-200 font-mono text-xs">{party.host_user_id.slice(0, 12)}...</span>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-gray-400">UUID: </span>
                      <span className="text-text dark:text-gray-200 font-mono text-xs">{party.party_uuid.slice(0, 12)}...</span>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-gray-400">Creada: </span>
                      <span className="text-text dark:text-gray-200">{party.createdAt ? new Date(party.createdAt).toLocaleDateString('es-ES') : 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-text-muted dark:text-gray-400">Actualizada: </span>
                      <span className="text-text dark:text-gray-200">{party.updatedAt ? new Date(party.updatedAt).toLocaleDateString('es-ES') : 'N/A'}</span>
                    </div>
                  </div>

                  {/* Tema */}
                  {party.themeConfig && (
                    <div className="pt-3 border-t border-border dark:border-gray-700">
                      <div className="text-xs text-text-muted dark:text-gray-400 mb-2">Colores del tema:</div>
                      <div className="flex gap-2">
                        {party.themeConfig.primaryColor && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-6 h-6 rounded border border-border dark:border-gray-600" 
                              style={{ backgroundColor: party.themeConfig.primaryColor }}
                            />
                            <span className="text-xs text-text-muted dark:text-gray-400">Primary</span>
                          </div>
                        )}
                        {party.themeConfig.secondaryColor && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-6 h-6 rounded border border-border dark:border-gray-600" 
                              style={{ backgroundColor: party.themeConfig.secondaryColor }}
                            />
                            <span className="text-xs text-text-muted dark:text-gray-400">Secondary</span>
                          </div>
                        )}
                        {party.themeConfig.accentColor && (
                          <div className="flex items-center gap-1">
                            <div 
                              className="w-6 h-6 rounded border border-border dark:border-gray-600" 
                              style={{ backgroundColor: party.themeConfig.accentColor }}
                            />
                            <span className="text-xs text-text-muted dark:text-gray-400">Accent</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
