import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Table, Button, Dropdown, Modal, Spin, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { VehiclePartFormModal } from '../components/VehiclePartFormModal';
import { VehiclePartFilters } from '../components/VehiclePartFilters';
import { EditableInventorySubTable } from '../components/VehiclePartInventorySubTable';
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

export interface VehiclePartInventoryType {
  id: number;
  headquarterId: number;
  name: string;
  quantity: number;
}

export interface VehiclePartType {
  key: string;
  id: number;
  name: string;
  brand: string;
  model: string;
  description?: string;
  notes?: string;
  totalQuantity: number;
  vehicleType?: string;
  associatedVehicle?: {
    id: number;
    plate: string;
    brand: string;
    model: string;
  };
  inventories: VehiclePartInventoryType[];
}

export interface VehiclePartPayload {
  id?: number;
  name: string;
  brand: string;
  model: string;
  description?: string;
  notes?: string;
  quantity?: number; // Only for creation
  vehicleId?: number | null; // When associated with specific vehicle
  vehicleType?: string; // When it's a generic part (car, motorcycle, truck, etc.)
}

const emptyVehiclePart: VehiclePartPayload = {
  id: undefined,
  name: '',
  brand: '',
  model: '',
  description: '',
  notes: '',
  quantity: 1,
  vehicleId: undefined,
  vehicleType: undefined,
};

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

const fetchVehicleParts = async (
  page: number,
  size: number,
  sortField: string,
  sortOrder: string,
  name?: string,
  brand?: string,
  model?: string,
  selectedVehicle?: number | null
) => {
  try {
    const token = localStorage.getItem('authToken');

    const filters: string[] = [];
    if (name) filters.push(`name=${name}`);
    if (brand) filters.push(`brand=${brand}`);
    if (model) filters.push(`model=${model}`);
    if (selectedVehicle) filters.push(`vehicleId=${selectedVehicle}`);

    const query = [
      `page=${page}`,
      `size=${size}`,
      `sort=${sortField},${sortOrder}`,
      ...filters,
    ].join('&');

    const response = await fetch(`${API_BASE_URL}/vehicle-parts?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener partes de vehículos');
    }

    return {
      success: true,
      data: data.content,
      total: data.totalElements,
    };
  } catch (error) {
    console.error('Error fetching vehicle parts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red',
    };
  }
};

const deleteVehiclePart = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/vehicle-parts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la parte del vehículo');
    }

    return {
      success: true,
      message: 'Parte del vehículo eliminada correctamente',
    };
  } catch (error) {
    console.error('Error eliminando parte del vehículo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red',
    };
  }
};

const saveInventoryRow = async (partId: number, updatedRow: VehiclePartInventoryType) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/vehicle-parts/${partId}/headquarters/${updatedRow.headquarterId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity: updatedRow.quantity,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar inventario');
    }

    return {
      success: true,
      message: 'Inventario actualizado correctamente',
    };
  } catch (error) {
    console.error('Error actualizando inventario:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red',
    };
  }
};

export const VehiclePartsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vehicleParts, setVehicleParts] = useState<VehiclePartType[]>([]);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
    sortField: 'name',
    sortOrder: 'asc',
  });

  // States for modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingVehiclePart, setEditingVehiclePart] = useState<VehiclePartPayload | null>(null);

  // States for filters
  const [searchName, setSearchName] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [searchModel, setSearchModel] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);

  // States for vehicles list (for filters and form)
  const [vehicles, setVehicles] = useState<{ id: number; plate: string; brand: string; model: string }[]>([]);

  // Expanded rows state
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const debouncedFetch = debounce((
    page: number,
    size: number,
    sortField: string,
    sortOrder: string,
    name?: string,
    brand?: string,
    model?: string,
    selectedVehicle?: number | null
  ) => {
    loadVehicleParts(page, size, sortField, sortOrder, name, brand, model, selectedVehicle);
  }, 300);

  const loadVehicleParts = async (
    page: number = tableParams.pagination.current,
    size: number = tableParams.pagination.pageSize,
    sortField: string = tableParams.sortField,
    sortOrder: string = tableParams.sortOrder,
    name?: string,
    brand?: string,
    model?: string,
    selectedVehicle?: number | null
  ) => {
    setLoading(true);
    try {
      const result = await fetchVehicleParts(page, size, sortField, sortOrder, name, brand, model, selectedVehicle);
      
      if (result.success && result.data) {
        const formattedData = result.data.map((part: any) => ({
          ...part,
          key: part.id.toString(),
          totalQuantity: part.inventories?.reduce((total: number, inv: any) => total + inv.quantity, 0) || 0,
        }));
        
        setVehicleParts(formattedData);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.total || 0,
          },
        }));
      } else {
        message.error(result.error || 'Error al cargar partes de vehículos');
      }
    } catch (error) {
      message.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_BASE_URL}/vehicle?page=1&size=1000&sort=plate,asc`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.content) {
        setVehicles(data.content.map((vehicle: any) => ({
          id: vehicle.id,
          plate: vehicle.plate,
          brand: vehicle.brand,
          model: vehicle.model,
        })));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  useEffect(() => {
    loadVehicleParts();
    loadVehicles();
  }, []);

  useEffect(() => {
    debouncedFetch(
      1,
      tableParams.pagination.pageSize,
      tableParams.sortField,
      tableParams.sortOrder,
      searchName,
      searchBrand,
      searchModel,
      selectedVehicle
    );
  }, [searchName, searchBrand, searchModel, selectedVehicle]);

  const handleTableChange = (pagination: any, _filters: any, sorter: any) => {
    const sortField = sorter.field || 'name';
    const sortOrder = sorter.order === 'descend' ? 'desc' : 'asc';

    setTableParams(prev => ({
      ...prev,
      pagination: {
        ...prev.pagination,
        current: pagination.current,
        pageSize: pagination.pageSize,
      },
      sortField,
      sortOrder,
    }));

    loadVehicleParts(
      pagination.current,
      pagination.pageSize,
      sortField,
      sortOrder,
      searchName,
      searchBrand,
      searchModel,
      selectedVehicle
    );
  };

  const handleCreate = () => {
    setEditingVehiclePart(emptyVehiclePart);
    setIsModalVisible(true);
  };  const handleEdit = (vehiclePart: VehiclePartType) => {
    setEditingVehiclePart({
      id: vehiclePart.id,
      name: vehiclePart.name,
      brand: vehiclePart.brand,
      model: vehiclePart.model,
      description: vehiclePart.description || '',
      notes: vehiclePart.notes || '',
      vehicleId: vehiclePart.associatedVehicle?.id || undefined,
      vehicleType: vehiclePart.vehicleType || undefined,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (vehiclePart: VehiclePartType) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta parte del vehículo?',
      content: `Se eliminará la parte "${vehiclePart.name}" de forma permanente.`,
      okText: 'Eliminar',
      cancelText: 'Cancelar',
      okType: 'danger',
      onOk: async () => {
        const result = await deleteVehiclePart(vehiclePart.id);
        if (result.success) {
          message.success(result.message);
          loadVehicleParts();
        } else {
          message.error(result.error || 'Error al eliminar la parte del vehículo');
        }
      },
    });
  };

  const handleModalSave = () => {
    setIsModalVisible(false);
    setEditingVehiclePart(null);
    loadVehicleParts();
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingVehiclePart(null);
  };

  const handleInventoryUpdate = async (vehiclePartId: number, inventories: VehiclePartInventoryType[]) => {
    const updatedParts = vehicleParts.map(part => {
      if (part.id === vehiclePartId) {
        return {
          ...part,
          inventories,
          totalQuantity: inventories.reduce((total, inv) => total + inv.quantity, 0),
        };
      }
      return part;
    });
    setVehicleParts(updatedParts);
  };

  const handleSaveInventoryRow = async (partId: number, updatedRow: VehiclePartInventoryType) => {
    const result = await saveInventoryRow(partId, updatedRow);
    if (result.success) {
      message.success('Inventario actualizado correctamente');
      return { success: true };
    } else {
      message.error(result.error || 'Error al actualizar inventario');
      return { success: false, error: result.error };
    }
  };  const columns: ColumnsType<VehiclePartType> = [
    {
      title: 'Acciones',
      width: 80,
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'view',
                label: 'Ver detalles',
                icon: <EyeOutlined style={{ color: '#1890ff' }} />,
              },
              {
                key: 'edit',
                label: 'Editar',
                icon: <EditOutlined style={{ color: '#1890ff' }} />,
              },
              {
                key: 'delete',
                label: 'Eliminar',
                icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
              },
            ],
            onClick: ({ key }) => {
              if (key === 'view') {
                // Toggle expand row
                const isExpanded = expandedRowKeys.includes(record.key);
                if (isExpanded) {
                  setExpandedRowKeys(prev => prev.filter(k => k !== record.key));
                } else {
                  setExpandedRowKeys(prev => [...prev, record.key]);
                }
              }
              if (key === 'edit') handleEdit(record);
              if (key === 'delete') handleDelete(record);
            },
          }}
        >
          <Button type="text">•••</Button>
        </Dropdown>
      ),
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
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
      title: 'Cantidad Total',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      align: 'center',
      render: (value) => <span style={{ fontWeight: 'bold' }}>{value}</span>,
    },
    {
      title: 'Vehículo Asociado',
      dataIndex: 'associatedVehicle',
      key: 'associatedVehicle',
      render: (vehicle) => vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'N/A',    },
  ];

  const expandedRowRender = (record: VehiclePartType) => (
    <div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
      <h4 style={{ marginBottom: '16px' }}>Inventario por Sede</h4>
      <EditableInventorySubTable
        inventories={record.inventories}
        onChange={(updated) => handleInventoryUpdate(record.id, updated)}
        onSaveRow={(updatedRow) => handleSaveInventoryRow(record.id, updatedRow)}
      />
    </div>
  );
  return (
    <div style={{ padding: '24px' }} className="overflow-x-auto">
      <h1 className="h3 mb-3 text-gray-800">Partes de Vehículos</h1>
      <VehiclePartFilters
        searchName={searchName}
        searchBrand={searchBrand}
        searchModel={searchModel}
        selectedVehicle={selectedVehicle}
        onSearchNameChange={setSearchName}
        onSearchBrandChange={setSearchBrand}
        onSearchModelChange={setSearchModel}
        onSelectedVehicleChange={setSelectedVehicle}
        onCreateClick={handleCreate}
        vehicles={vehicles}
      />
      
      <Table
        columns={columns}
        dataSource={vehicleParts}
        pagination={{
          ...tableParams.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} elementos`,
        }}
        loading={loading}
        onChange={handleTableChange}
        expandable={{
          expandedRowRender,
          expandedRowKeys,
          onExpandedRowsChange: (keys) => setExpandedRowKeys(keys as string[]),
          rowExpandable: (record) => record.inventories && record.inventories.length > 0,
        }}
        scroll={{ x: 800 }}
      />

      <VehiclePartFormModal
        visible={isModalVisible}
        vehiclePart={editingVehiclePart}
        vehicles={vehicles}
        onSave={handleModalSave}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default VehiclePartsPage;
