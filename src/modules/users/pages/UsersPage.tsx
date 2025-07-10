import React, { useState, useEffect } from 'react'
import { Table, Button, Dropdown, Tag, message, Modal, Spin } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { EditOutlined, DeleteOutlined, SyncOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons'
import { UserFormModal } from '../components/UserFormModal'
import { API_BASE_URL } from '../../../config'
import { useAuth } from '../../../hooks/useAuth'
import { UserRoleTags } from  '../components/UserRoleTags'
import { UserFilters } from '../components/UserFilters'


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

const uploadStudentExcel = async (file: File): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem('authToken');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/users/upload-students`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Error al subir archivo'
      };
    }

    return { success: true, message: 'Archivo subido con éxito' };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchUsers = async (
  page: number,
  size: number,
  sortField: string,
  sortOrder: string,
  role?: string | null
) => {
  try {
    const token = localStorage.getItem('authToken');

    const queryParams = [
      `page=${page}`,
      `size=${size}`,
      `sort=${sortField},${sortOrder}`
    ];

    if (role) {
      queryParams.push(`searchColumn=role`);
      queryParams.push(`search=${role}`);
    }

    const query = queryParams.join('&');

    const response = await fetch(`${API_BASE_URL}/users?${query}`, {
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
  const [uploading, setUploading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const { user } = useAuth();

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await fetchUsers(
        tableParams.pagination.current - 1,
        tableParams.pagination.pageSize,
        tableParams.sortField,
        tableParams.sortOrder,
        selectedRole
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
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.total
          }
        }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
    selectedRole,
  ])

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      sortField: sorter.field || 'id',
      sortOrder: sorter.order ? sorter.order.replace('end', '') : 'asc',
    }));
  };

  const handleUploadStudents = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      message.error('El archivo debe ser un Excel (.xlsx)');
      return;
    }

    setUploading(true);

    try {
      const result = await uploadStudentExcel(file);

      if (result.success) {
        message.success(result.message);
        await loadUsers();
      } else {
        message.error(result.message);
      }
    } catch (error) {
      console.error('Error al subir archivo:', error);
      message.error('Error inesperado al subir el archivo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = (record: UserType) => {
    Modal.confirm({
      title: '¿Eliminar usuario?',
      content: `¿Estás seguro que deseas eliminar el usuario "${record.username}"? Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      centered: true,
      onOk: async () => {
        if (user?.id === record.username) {
          message.error('No puedes eliminar tu propio usuario');
          return;
        }

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
      sorter: true,
    },
    {
      title: 'Nombre de usuario',
      dataIndex: 'username',
      key: 'username',
      sorter: true,
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: true,
    },
    {
      title: 'Apellido',
      dataIndex: 'apellido',
      key: 'apellido',
      sorter: true,

    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Rol',
      dataIndex: 'rol',
      key: 'rol',
      render: (roles: string[] | string) => <UserRoleTags roles={roles} />
    }
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
          roles: values.rol
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
    <Spin spinning={uploading} tip={'Subiendo archivo...'}>
      <div style={{ padding: '24px' }}>
        <input
          type="file"
          accept=".xlsx"
          id="upload-students-input"
          style={{ display: 'none' }}
          onChange={handleUploadStudents}
        />
        <UserFilters
          selectedRole={selectedRole}
          onRoleChange={(value) => setSelectedRole(value)}
          onCreateClick={() => {
            setEditingUser(null);
            setModalOpen(true);
          }}
          onUploadClick={() => {
            document.getElementById('upload-students-input')?.click();
          }}
        />
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            ...tableParams.pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} elementos`,
          }}
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
    </Spin>
  )
}

export default UsersPage