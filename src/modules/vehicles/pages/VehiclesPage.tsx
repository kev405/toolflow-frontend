import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Dropdown, Modal, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { VehicleFormModal } from '../components/VehicleFormModal';
import { VehicleFilters } from '../components/VehicleFilters';
import { API_BASE_URL } from '../../../config';

interface PaginationParams {
  current: number;
  pageSize: number;
  total: number;
}

interface TableParams {
  pagination: PaginationParams;
  sortField: string;
  sortOrder: 'asc' | 'desc';
}

export interface VehicleType {
  key: string;
  id: number;
  plate: string;
  brand: string;
  model: string;
  color: string;
  numberChasis: string;
  vehicleType: string;
  location: string;
}

export interface VehiclePayload {
  id?: number;
  plate: string;
  brand: string;
  model: string;
  color: string;
  numberChasis: string;
  vehicleType: string;
  location: string;
}

const emptyVehicle: VehiclePayload = {
  id: undefined,
  plate: '',
  brand: '',
  model: '',
  color: '',
  numberChasis: '',
  vehicleType: '',
  location: '',
};

const fetchVehicles = async (
  page: number,
  size: number,
  sortField: string,
  sortOrder: string,
  vehicleType?: string,
  plate?: string,
  brand?: string,
  color?: string
) => {
  try {
    const token = localStorage.getItem('authToken');

    const filters: string[] = [];
    if (vehicleType) filters.push(`vehicleType=${vehicleType}`);
    if (plate) filters.push(`plate=${plate}`);
    if (brand) filters.push(`brand=${brand}`);
    if (color) filters.push(`color=${color}`);

    const query = [
      `page=${page}`,
      `size=${size}`,
      `sort=${sortField},${sortOrder}`,
      ...filters,
    ].join('&');

    const response = await fetch(`${API_BASE_URL}/vehicle/findBy?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener vehículos');
    }

    return {
      success: true,
      data: data.content,
      total: data.totalElements,
    };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red',
    };
  }
};

const deleteVehicle = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/vehicle/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar el vehículo');
    }

    return {
      success: true,
      message: 'Vehículo eliminado correctamente',
    };
  } catch (error) {
    console.error('Error eliminando vehículo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

const VehiclesPage = () => {
  const { user, loading: authLoading } = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (!authLoading) {
  //     if (!user || !user.role.some((role: { authority: string }) => role.authority === 'ADMINISTRATOR')) {
  //       navigate('/404');
  //     }
  //   }
  // }, [user, authLoading, navigate]);

  const [data, setData] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchVehicleType, setSearchVehicleType] = useState('');
  const [searchPlate, setSearchPlate] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchColor, setSearchColor] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehiclePayload | null>(null);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sortField: 'model',
    sortOrder: 'asc',
  });

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const result = await fetchVehicles(
        tableParams.pagination.current - 1,
        tableParams.pagination.pageSize,
        tableParams.sortField,
        tableParams.sortOrder,
        searchVehicleType,
        searchPlate,
        searchBrand,
        searchColor
      );

      if (result.success && result.data) {
        const formattedVehicles = result.data.map((vehicle: VehicleType) => ({
          ...vehicle,
          key: vehicle.id.toString(),
        }));

        setData(formattedVehicles);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.total,
          },
        }));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadVehicles();
    }
  }, [
    authLoading,
    user,
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
    searchVehicleType,
    searchPlate,
    searchBrand,
    searchColor,
  ]);

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    setTableParams((prev) => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      sortField: sorter.field || 'model',
      sortOrder: sorter.order ? sorter.order.replace('end', '') : 'asc',
    }));
  };

  const handleDelete = (record: VehicleType) => {
    Modal.confirm({
      title: '¿Eliminar vehículo?',
      content: `¿Estás seguro que deseas eliminar el vehículo "${record.plate}"? Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      centered: true,
      onOk: async () => {
        try {
          const result = await deleteVehicle(record.id);
          if (result.success) {
            message.success('Vehículo eliminado correctamente');
            loadVehicles();
          } else {
            message.error(`Error al eliminar: ${result.error}`);
          }
        } catch (error) {
          console.error('Error eliminando vehículo:', error);
          message.error(error instanceof Error ? error.message : 'Error desconocido');
        }
      },
    });
  };

  const handleEdit = (record: VehicleType) => {
    setEditingVehicle(record);
    setModalOpen(true);
  };

  const handleSubmit = async (values: VehiclePayload) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const url = `${API_BASE_URL}/vehicle`;
      const method = editingVehicle ? 'PUT' : 'POST';

      const payload = editingVehicle ? { ...values, id: editingVehicle.id } : values;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el vehículo');
      }

      message.success(editingVehicle ? 'Vehículo editado correctamente' : 'Vehículo creado correctamente');

      setModalOpen(false);
      setEditingVehicle(null);
      await loadVehicles();
    } catch (error) {
      console.error('Error al guardar el vehículo:', error);
      message.error(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getItems = (isAdmin: boolean): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: '1',
        label: 'Editar',
        icon: <EditOutlined style={{ color: '#1890ff' }} />,
      },
    ];
  
    if (isAdmin) {
      items.push({
        key: '2',
        label: 'Eliminar',
        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      });
    }
  
    return items;
  };
  
  const columns: ColumnsType<VehicleType> = [
    {
      title: 'Acciones',
      width: 20,
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: getItems(!!user?.role?.some((role: { authority: string }) => role.authority === 'ADMINISTRATOR')),
            onClick: ({ key }) => {
              if (key === '1') handleEdit(record);
              if (key === '2') handleDelete(record);
            },
          }}
        >
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
      title: 'Tipo de Vehículo',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      sorter: true,
    },
    {
      title: 'Placa',
      dataIndex: 'plate',
      key: 'plate',
      sorter: true,
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
      sorter: true,
    },
    {
      title: 'Modelo',
      dataIndex: 'model',
      key: 'model',
      sorter: true,
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
      sorter: true,
    },
    {
      title: 'Número de Chasis',
      dataIndex: 'numberChasis',
      key: 'numberChasis',
      sorter: true,
    },
    {
      title: 'Ubicación',
      dataIndex: 'location',
      key: 'location',
      sorter: true,
    },
  ];

  if (authLoading) {
    return (
      <Spin
        size="large"
        tip="Cargando..."
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div />
      </Spin>
    );
  }

  return (
    <div style={{ padding: '24px' }} className="overflow-x-auto">
      <h1 className="h3 mb-3 text-gray-800">Vehículos</h1>
      <VehicleFilters
        searchVehicleType={searchVehicleType}
        searchPlate={searchPlate}
        searchBrand={searchBrand}
        searchColor={searchColor}
        onSearchVehicleTypeChange={setSearchVehicleType}
        onSearchPlateChange={setSearchPlate}
        onSearchBrandChange={setSearchBrand}
        onSearchColorChange={setSearchColor}
        onCreateClick={() => setModalOpen(true)}
      />
      <Table
        columns={columns}
        dataSource={data}
        pagination={tableParams.pagination}
        loading={loading}
        onChange={handleTableChange}
      />
      <VehicleFormModal
        id={editingVehicle?.id}
        open={modalOpen}
        onClose={() => {
          setEditingVehicle(null);
          setModalOpen(false);
        }}
        onSubmit={handleSubmit}
        initialValues={editingVehicle || emptyVehicle}
        title={editingVehicle ? 'Editar Vehículo' : 'Crear Vehículo'}
      />
    </div>
  );
};

export default VehiclesPage;