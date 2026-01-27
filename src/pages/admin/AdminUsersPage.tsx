import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardBody } from '../../components/ui/card';
import { SkeletonLoader } from '../../components/ui/skeleton-loader';
import { UsersService } from '../../services/users.service';
import type { IUser, Role } from '../../interfaces/users.interface';
import { useNotificationStore } from '../../stores/notification.store';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await UsersService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      addNotification({
        type: 'error',
        message: 'Error al cargar usuarios',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await UsersService.updateUserRole(userId, newRole);
      addNotification({
        type: 'success',
        message: 'Rol actualizado',
        description: 'El rol del usuario ha sido actualizado correctamente',
      });
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      addNotification({
        type: 'error',
        message: 'Error al actualizar rol',
        description: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="container-app py-10 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-text dark:text-gray-100">Gestión de Usuarios</h1>
        <p className="text-text-muted dark:text-gray-400">
          Administra los usuarios y sus roles en la plataforma
        </p>
      </motion.div>

      {/* Búsqueda */}
      <Card>
        <CardBody>
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-100"
          />
        </CardBody>
      </Card>

      {/* Lista de usuarios */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4"
      >
        {filteredUsers.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <p className="text-text-muted dark:text-gray-400">
                {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <motion.div key={user.id} variants={itemVariants}>
              <Card>
                <CardBody>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-full bg-primary dark:bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
                        {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text dark:text-gray-100">
                          {user.name || 'Sin nombre'}
                        </h3>
                        <p className="text-sm text-text-muted dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <span className="text-text-muted dark:text-gray-400">Rol: </span>
                        <span
                          className={`font-semibold ${
                            user.role === 'administrator'
                              ? 'text-purple-600 dark:text-purple-400'
                              : user.role === 'anfitrion'
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {user.role === 'administrator'
                            ? 'Administrador'
                            : user.role === 'anfitrion'
                            ? 'Anfitrión'
                            : 'Invitado'}
                        </span>
                      </div>

                      <select
                        value={user.role || 'guest'}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value as Role)
                        }
                        className="px-3 py-1.5 border border-border dark:border-gray-700 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="guest">Invitado</option>
                        <option value="anfitrion">Anfitrión</option>
                        <option value="administrator">Administrador</option>
                      </select>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="mt-4 pt-4 border-t border-border dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-muted dark:text-gray-400">Creado: </span>
                        <span className="text-text dark:text-gray-200">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('es-ES')
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-muted dark:text-gray-400">ID: </span>
                        <span className="text-text dark:text-gray-200 font-mono text-xs">
                          {user.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-text dark:text-gray-100">Estadísticas</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary dark:text-purple-400">
                {users.length}
              </p>
              <p className="text-sm text-text-muted dark:text-gray-400">Total usuarios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {users.filter((u) => u.role === 'anfitrion').length}
              </p>
              <p className="text-sm text-text-muted dark:text-gray-400">Anfitriones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {users.filter((u) => u.role === 'administrator').length}
              </p>
              <p className="text-sm text-text-muted dark:text-gray-400">Administradores</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
