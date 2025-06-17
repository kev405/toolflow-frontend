import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Dropdown, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { API_BASE_URL } from '../../../config';
import { HeadquarterFilters } from '../components/HeadquarterFilters';
import HeadquarterFormModal from '../components/HeadquarterFormModal';

interface Headquarter {
  id: number;
  name: string;
  address: string;
  main: boolean;
  status: boolean;
  responsible: {
    id: number;
    fullName: string;
  } | null;
}

export interface HeadquarterPayload {
  id?: number;
  name: string;
  address: string;
  responsibleId: number | null;
}

export const emptyHeadquarter: HeadquarterPayload = {
  name: '',
  address: '',
  responsibleId: null,
};

const fetchHeadquarters = async (page: number, size: number, sortField: string, sortOrder: string) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(
      `${API_BASE_URL}/headquarters?page=${page}&size=${size}&sort=${sortField},${sortOrder}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error al obtener sedes');

    return { success: true, data: data.content, total: data.totalElements };
  } catch (error) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

const createHeadquarter = async (headquarter: HeadquarterPayload) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/headquarters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(headquarter)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear la sede');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al crear la sede:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const updateHeadquarter = async (id: number, headquarter: HeadquarterPayload) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/headquarters/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(headquarter)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar la sede');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar la sede:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};


const deleteHeadquarter = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/headquarters/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar sede');
    }
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

const getHeadquarterById = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/headquarters/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener la sede');
    }

    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error al obtener la sede:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const fetchAdminsAndTeachers = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const roles = ['ADMINISTRATOR', 'TOOL_ADMINISTRATOR', 'TEACHER'];

    const queryParams = roles.map(role => `roles=${encodeURIComponent(role)}`).join('&');

    const response = await fetch(`${API_BASE_URL}/users/by-roles?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener usuarios');
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

const HeadquartersPage = () => {
  const [data, setData] = useState<Headquarter[]>([]);
  const [headquarter, setHeadquarter] = useState<HeadquarterPayload>(emptyHeadquarter);
  const [responsibles, setResponsibles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [openModal, setOpenModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const result = await fetchHeadquarters(pagination.current - 1, pagination.pageSize, sortField, sortOrder);
    if (result.success) {
      setData(result.data);
      setPagination((prev) => ({ ...prev, total: result.total }));
    } else {
      message.error(result.error);
    }
    setLoading(false);
  };

  const loadResponsibles = async () => {
    const result = await fetchAdminsAndTeachers();

    if (result.success) {
      const formatted = result.data.map((user: any) => ({
        id: user.id,
        name: `${user.name} ${user.lastName}`,
      }));
      setResponsibles(formatted);
    } else {
      message.error(result.error);
    }
  };

  useEffect(() => {
    loadResponsibles();
  }, []);

  useEffect(() => {
    loadData();
  }, [pagination.current, pagination.pageSize, sortField, sortOrder]);

  const handleDelete = (record: Headquarter) => {
    Modal.confirm({
      title: '¿Eliminar sede?',
      content: `¿Seguro que deseas eliminar la sede "${record.name}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        const result = await deleteHeadquarter(record.id);
        if (result.success) {
          message.success('Sede eliminada correctamente');
          loadData();
        } else {
          message.error(`Error: ${result.error}`);
        }
      },
    });
  };

  const handleLoadHeadquarter = async (id: number) => {
    setLoading(true);
    try {
      const result = await getHeadquarterById(id);

      if (result.success && result.data) {
        setHeadquarter({
          id: result.data.id,
          name: result.data.name,
          address: result.data.address,
          responsibleId: result.data.responsible?.id || null,
        });

        setIsEditing(true);
        setIsCreating(false);
        setOpenModal(true);
      } else {
        message.error(result.error || 'No se pudo cargar la sede');
      }
    } catch (error) {
      message.error('Ocurrió un error al cargar la sede');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id: number) => {
    setIsCreating(false);
    setIsEditing(true);
    handleLoadHeadquarter(id);
  };

  const columns: ColumnsType<Headquarter> = [
    {
      title: 'Acciones',
      key: 'actions',
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: '1',
            label: 'Editar',
            icon: <EditOutlined style={{ color: '#1890ff' }} />,
          },
          ...(record.main !== true ? [{
            key: '2',
            label: 'Eliminar',
            icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
          }] : [])
        ];

        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items,
              onClick: ({ key }) => {
                if (key === '1') handleEdit(record.id);
                if (key === '2') handleDelete(record);
              }
            }}
          >
            <Button type="text">•••</Button>
          </Dropdown>
        );
      }
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      sorter: true,
    },
    {
      title: 'Sede Principal',
      dataIndex: 'main',
      key: 'main',
      render: (main) => (
        <Tag color={main ? 'blue' : 'default'}>{main ? 'PRINCIPAL' : 'SECUNDARIA'}</Tag>
      ),
    },
    {
      title: 'Responsable',
      dataIndex: ['responsible', 'fullName'],
      key: 'responsible',
      render: (value: string) => value || '—',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'green' : 'red'}>{status ? 'ACTIVO' : 'INACTIVO'}</Tag>
      ),
    },
  ];

  const handleTableChange = (paginationInfo: any, _filters: any, sorter: any) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }));
    if (sorter.field) {
      setSortField(sorter.field);
      setSortOrder(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const handleCreateHeadquarter = async (values: HeadquarterPayload) => {
    const result = await createHeadquarter(values);
    if (result.success) {
      message.success('Sede creada con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleUpdateHeadquarter = async (values: HeadquarterPayload) => {
    const id = headquarter.id;

    if (!id) {
      message.error('ID de sede no válido');
      return;
    }

    const result = await updateHeadquarter(id, values);
    if (result.success) {
      message.success('Sede actualizada con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleSubmit = async (values: HeadquarterPayload) => {
    setLoading(true);
    try {
      if (isEditing) {
        await handleUpdateHeadquarter(values);
      } else {
        await handleCreateHeadquarter(values);
      }

      setOpenModal(false);
      setHeadquarter(emptyHeadquarter);
      await loadData();
    } finally {
      setLoading(false);
      setIsCreating(false);
      setIsEditing(false);
      setOpenModal(false);
      setHeadquarter(emptyHeadquarter);
    }
  };

  const handleClose = () => {
    setOpenModal(false);
    setIsCreating(false);
    setIsEditing(false);
    setHeadquarter(emptyHeadquarter);
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 className="h3 mb-3 text-gray-800">Sedes</h1>
      <HeadquarterFilters onCreateClick={
        () => {
          setOpenModal(true);
          setIsCreating(true);
          setHeadquarter(emptyHeadquarter);
        }
      } />
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />
      <HeadquarterFormModal
        open={openModal}
        onClose={handleClose}
        onSubmit={handleSubmit}
        title={isEditing ? 'Editar Sede' : 'Crear Sede'}
        initialValues={headquarter}
        responsibles={responsibles}
      />
    </div>
  );
};

export default HeadquartersPage;
