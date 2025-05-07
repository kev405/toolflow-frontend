import React, { useState, useEffect } from 'react'
import { Table, Space, Button, Dropdown, Tag, message, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { EditOutlined, DeleteOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons'
import { UserFormModal } from '../components/userFormModal/UserFormModal'
import { API_BASE_URL } from '../../../config'


interface UserType {
  key: string
  id: number
  username: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  rol: string
  estado: string
}

const fetchUsers = async (page: number, size: number, sortField: string, sortOrder: string) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/users?page=${page}&size=${size}&sortField=${sortField}&sortOrder=${sortOrder}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener usuarios');
    }

    return {
      success: true,
      data: data.content,
      total: data.totalElements
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const UsersPage = () => {
  const [data, setData] = useState<UserType[]>([])
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    sortField: 'name',
    sortOrder: 'asc'
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchUsers(
        tableParams.pagination.current - 1,
        tableParams.pagination.pageSize,
        tableParams.sortField,
        tableParams.sortOrder
      );

      if (result.success && result.data) {
        const formattedUsers = result.data.map((user: any) => ({
          key: user.id.toString(),
          id: user.id,
          username: user.username,
          nombre: user.name,
          apellido: user.lastName,
          email: user.email,
          telefono: user.phone,
          rol: user.roles,
          estado: user.status ? 'Activo' : 'Inactivo',
          password: user.password,
        }));

        setData(formattedUsers);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: result.total
          }
        });
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadUsers();
  }, [JSON.stringify(tableParams)]);

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setTableParams({
      pagination,
      sortField: sorter.field || 'name',
      sortOrder: sorter.order ? sorter.order.replace('end', '') : 'asc'
    })
  }


  const handleDelete = (record: UserType) => {
    Modal.confirm({
      title: '¿Eliminar usuario?',
      content: `¿Estás seguro que deseas eliminar el usuario "${record.username}"? Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      centered: true,
      onOk: async () => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${API_BASE_URL}/users/${record.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al eliminar usuario');
          }

          message.success('Usuario eliminado con éxito');
          await loadUsers();
        } catch (error) {
          console.error('Error deleting user:', error);
          message.error(error instanceof Error ? error.message : 'Error al eliminar usuario');
        }
      }
    });
  };

  const handleChangeStatus = async (record: UserType) => {
    try {
      const token = localStorage.getItem('authToken');
      const newStatus = record.estado === 'Activo' ? false : true;

      const response = await fetch(`${API_BASE_URL}/users/${record.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el estado del usuario');
      }

      message.success(`Usuario ${newStatus ? 'activado' : 'desactivado'} con éxito`);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error(error instanceof Error ? error.message : 'Error al actualizar el estado del usuario');
    }
  };

  const getItems = (record: UserType): MenuProps['items'] => [
    {
      key: '1',
      label: 'Editar',
      icon: <EditOutlined style={{ color: '#1890ff' }} />,
      onClick: () => handleEdit(record)
    },
    {
      key: '2',
      label: 'Eliminar',
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      onClick: () => handleDelete(record)
    }    
  ]

  const columns: ColumnsType<UserType> = [
    {
      title: 'Acciones',
      width: 20,
      key: 'actions',
      render: (_, record) => (
        <Dropdown menu={{ items: getItems(record) }} trigger={['click']}>
          <Button type="text">•••</Button>
        </Dropdown>
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Nombre de usuario',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
    },
    {
      title: 'Apellido',
      dataIndex: 'apellido',
      key: 'apellido',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Teléfono',
      dataIndex: 'telefono',
      key: 'telefono',
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      render: (roles: string[]) => {
        if (Array.isArray(roles)) {
          return roles.join(', ');
        }
        return roles;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => (
        <Tag color={estado === 'Activo' ? 'success' : 'error'}>
          {estado}
        </Tag>
      ),
    },
  ]

  const updateUser = async (id: number, user: any) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: user.nombre,
          username: user.username,
          ...(user.password && { password: user.password }),
          ...(user.confirmPassword && { repeatedPassword: user.confirmPassword }),
          lastName: user.apellido,
          phone: user.telefono,
          email: user.email,
          status: true,
          roles: user.rol
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar usuario');
      }

      return { success: true };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  const handleCreateUser = async (values: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: values.nombre,
          username: values.username,
          password: values.password,
          repeatedPassword: values.confirmPassword,
          lastName: values.apellido,
          phone: String(values.telefono),
          email: values.email,
          status: true,
          roles: [values.rol]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear usuario');
      }

      message.success('Usuario creado con éxito');
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      message.error(error instanceof Error ? error.message : 'Error al crear usuario');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    if (editingUser) {
      await handleEditUser(values);
    } else {
      await handleCreateUser(values);
    }
    setModalOpen(false);
    setLoading(false);
    setEditingUser(null);
    await loadUsers();
  };


  const handleEditUser = async (values: any) => {
    const id = editingUser?.id;

    if (!id) {
      message.error('ID de usuario no encontrado');
      return;
    }

    const result = await updateUser(id, values);
    if (result.success) {
      message.success('Usuario actualizado con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleEdit = (record: UserType) => {
    setEditingUser(record);
    setModalOpen(true);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 className='h3 mb-3 text-gray-800'>Usuarios</h1>
      <div className='row mb-3'>
        <div className='col-12 d-flex justify-content-end'>
          <Button
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
            style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
            type="primary"
            icon={<PlusOutlined />}
          >
            Crear Usuario
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />
      <UserFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmit}
        initialValues={editingUser}
        title={editingUser ? 'Editar Usuario' : 'Crear Usuario'}
      />
    </div >
  )
}

export default UsersPage