import React from 'react'
import { Table, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'

interface UserType {
  key: string
  name: string
  email: string
  role: string
}

const UsersPage = () => {
  const columns: ColumnsType<UserType> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Roles',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Opciones',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <a href="#" className="btn btn-primary btn-icon-split">
            <span className="icon text-white-50">
              <i className="fas fa-flag"></i>
            </span>
            <span className="text">Editar</span>
          </a>
          <a href="#" className="btn btn-danger btn-icon-split">
            <span className="icon text-white-50">
              <i className="fas fa-trash"></i>
            </span>
            <span className="text">Eliminar</span>
          </a>
        </Space>
      ),
    },
  ]

  const data: UserType[] = [
    {
      key: '1',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@empresa.com',
      role: 'Administrador',
    },
    {
      key: '2',
      name: 'Ana María López',
      email: 'ana.lopez@empresa.com',
      role: 'Usuario',
    },
    {
      key: '3',
      name: 'Miguel Ángel Pérez',
      email: 'miguel.perez@empresa.com',
      role: 'Supervisor',
    },
    {
      key: '4',
      name: 'Laura González',
      email: 'laura.gonzalez@empresa.com',
      role: 'Editor',
    },
    {
      key: '5',
      name: 'José Manuel Martínez',
      email: 'jose.martinez@empresa.com',
      role: 'Administrador',
    },
    {
      key: '6',
      name: 'Isabel Sánchez',
      email: 'isabel.sanchez@empresa.com',
      role: 'Usuario',
    },
  ]

  return (
    <div style={{ padding: '24px' }}>
      <h1 className='h3 mb-3 text-gray-800'>Usuarios</h1>
      <Table columns={columns} dataSource={data} />
    </div>
  )
}

export default UsersPage