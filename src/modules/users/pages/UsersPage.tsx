import React, { useState, useEffect } from 'react'
import { Table, Space, Button, Dropdown, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { EditOutlined, DeleteOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons'
import { UserFormModal } from '../components/userFormModal/UserFormModal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9009';

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
          rol: user.role,
          estado: user.status ? 'Activo' : 'Inactivo'
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
    console.log('Eliminar:', record)
  }

  const handleChangeStatus = (record: UserType) => {
    console.log('Cambiar estado:', record)
  }

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
    },
    {
      key: '3',
      label: 'Cambiar estado',
      icon: <SyncOutlined style={{ color: '#52c41a' }} />,
      onClick: () => handleChangeStatus(record)
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

  const handleCreateUser = (values: any) => {
    // Implementar lógica para crear usuario
    console.log('Crear usuario:', values);
    setModalOpen(false);
  };

  const handleEditUser = (values: any) => {
    // Implementar lógica para editar usuario
    console.log('Editar usuario:', values, editingUser?.id);
    setModalOpen(false);
    setEditingUser(null);
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
            onClick={() => setModalOpen(true)}
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
        onSubmit={editingUser ? handleEditUser : handleCreateUser}
        initialValues={editingUser}
        title={editingUser ? 'Editar Usuario' : 'Crear Usuario'}
      />      
    </div >
  )
}

export default UsersPage