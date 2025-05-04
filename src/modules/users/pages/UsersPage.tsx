import React, { useState, useEffect } from 'react'
import { Table, Space, Button, Dropdown, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { EditOutlined, DeleteOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons'

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

  const handleEdit = (record: UserType) => {
    console.log('Editar:', record)
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

  const dataEx: UserType[] = [
    {
      key: '1',
      id: 1,
      username: 'JohnDuran',
      nombre: 'John',
      apellido: 'Duran',
      email: 'John.Duran@gmail.com',
      telefono: '3124567890',
      rol: 'Administrador',
      estado: 'Activo'
    },
    {
      key: '2',
      id: 2,
      username: 'Alex89',
      nombre: 'Alejandro',
      apellido: 'Garcia',
      email: 'alex.garcia@gmail.com',
      telefono: '3104567890',
      rol: 'Administrador',
      estado: 'Activo'
    },
    {
      key: '3',
      id: 3,
      username: 'LMarquez',
      nombre: 'Laura',
      apellido: 'Márquez',
      email: 'laura.mqz@yahoo.com',
      telefono: '3001234567',
      rol: 'Profesor',
      estado: 'Inactivo'
    },
    {
      key: '4',
      id: 4,
      username: 'Vale_22',
      nombre: 'Valentina',
      apellido: 'Ríos',
      email: 'valen.rios@gmail.com',
      telefono: '3123456789',
      rol: 'Profesor',
      estado: 'Activo'
    },
    {
      key: '5',
      id: 5,
      username: 'CAndres',
      nombre: 'Carlos',
      apellido: 'Andrade',
      email: 'carlos.a@gmail.com',
      telefono: '3208765432',
      rol: 'Estudiante',
      estado: 'Activo'
    },
    {
      key: '6',
      id: 6,
      username: 'JLopez92',
      nombre: 'Juliana',
      apellido: 'López',
      email: 'juli.lopez@hotmail.com',
      telefono: '3197654321',
      rol: 'Administrador de herramientas',
      estado: 'Activo'
    },
    {
      key: '7',
      id: 7,
      username: 'MAcevedo',
      nombre: 'Manuel',
      apellido: 'Acevedo',
      email: 'm.acevedo@outlook.com',
      telefono: '3182345678',
      rol: 'Estudiante',
      estado: 'Inactivo'
    },
    {
      key: '8',
      id: 8,
      username: 'SofiaH',
      nombre: 'Sofia',
      apellido: 'Herrera',
      email: 'sofiah@gmail.com',
      telefono: '3134567890',
      rol: 'Estudiante',
      estado: 'Activo'
    },
    {
      key: '9',
      id: 9,
      username: 'DaniGomez',
      nombre: 'Daniel',
      apellido: 'Gómez',
      email: 'daniel.gomez@yahoo.com',
      telefono: '3007894561',
      rol: 'Estudiante',
      estado: 'Activo'
    },
    {
      key: '10',
      id: 10,
      username: 'NCastillo',
      nombre: 'Natalia',
      apellido: 'Castillo',
      email: 'nat.castillo@live.com',
      telefono: '3151239876',
      rol: 'Estudiante',
      estado: 'Activo'
    },
    {
      key: '11',
      id: 11,
      username: 'JohnDuran',
      nombre: 'John',
      apellido: 'Duran',
      email: 'John.Duran@gmail.com',
      telefono: '3124567890',
      rol: 'Administrador',
      estado: 'Activo'
    },
    {
      key: '12',
      id: 12,
      username: 'Alex89',
      nombre: 'Alejandro',
      apellido: 'Garcia',
      email: 'alex.garcia@gmail.com',
      telefono: '3104567890',
      rol: 'Administrador',
      estado: 'Activo'
    },
    {
      key: '13',
      id: 13,
      username: 'LMarquez',
      nombre: 'Laura',
      apellido: 'Márquez',
      email: 'laura.mqz@yahoo.com',
      telefono: '3001234567',
      rol: 'Profesor',
      estado: 'Inactivo'
    },
    {
      key: '14',
      id: 14,
      username: 'Vale_22',
      nombre: 'Valentina',
      apellido: 'Ríos',
      email: 'valen.rios@gmail.com',
      telefono: '3123456789',
      rol: 'Profesor',
      estado: 'Activo'
    },
    {
      key: '15',
      id: 15,
      username: 'CAndres',
      nombre: 'Carlos',
      apellido: 'Andrade',
      email: 'carlos.a@gmail.com',
      telefono: '3208765432',
      rol: 'Estudiante',
      estado: 'Activo'
    },
    {
      key: '16',
      id: 16,
      username: 'JLopez92',
      nombre: 'Juliana',
      apellido: 'López',
      email: 'juli.lopez@hotmail.com',
      telefono: '3197654321',
      rol: 'Administrador de herramientas',
      estado: 'Activo'
    },
    {
      key: '17',
      id: 17,
      username: 'MAcevedo',
      nombre: 'Manuel',
      apellido: 'Acevedo',
      email: 'm.acevedo@outlook.com',
      telefono: '3182345678',
      rol: 'Estudiante',
      estado: 'Inactivo'
    },
    {
      key: '18',
      id: 18,
      username: 'SofiaH',
      nombre: 'Sofia',
      apellido: 'Herrera',
      email: 'sofiah@gmail.com',
      telefono: '3134567890',
      rol: 'Estudiante',
      estado: 'Activo'
    },
    {
      key: '19',
      id: 19,
      username: 'DaniGomez',
      nombre: 'Daniel',
      apellido: 'Gómez',
      email: 'daniel.gomez@yahoo.com',
      telefono: '3007894561',
      rol: 'Estudiante',
      estado: 'Activo'
    },
    {
      key: '20',
      id: 20,
      username: 'NCastillo',
      nombre: 'Natalia',
      apellido: 'Castillo',
      email: 'nat.castillo@live.com',
      telefono: '3151239876',
      rol: 'Estudiante',
      estado: 'Activo'
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <h1 className='h3 mb-3 text-gray-800'>Usuarios</h1>
      <div className='row mb-3'>
        <div className='col-12 d-flex justify-content-end'>
          <Button
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
    </div>
  )
}

export default UsersPage