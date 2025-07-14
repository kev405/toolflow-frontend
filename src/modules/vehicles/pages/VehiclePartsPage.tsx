import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { Table, Button, Dropdown, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
  headquarterId: number;
  headquarterName: string;
  quantity: number;
  vehicleId: number | null;
}

export interface VehiclePartType {
  key: string;
  id: number;
  name: string;
  brand: string;
  model: string;
  description?: string;
  notes?: string;
  createdAt?: string;
  vehicleId?: number | null;
  vehicleType?: string;
  inventories?: VehiclePartInventoryType[];
}

export interface VehiclePartPayload {
  id?: number;
  name: string;
  brand: string;
  model: string;
  description?: string;
  notes?: string;
  quantity?: number;
  vehicleId?: number | null;
  vehicleType?: string;
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
  selectedVehicle?: number | null,
  selectedHeadquarter?: number | null
) => {
  try {
    const token = localStorage.getItem('authToken');

    const filters: string[] = [];
    if (name) filters.push(`name=${name}`);
    if (brand) filters.push(`brand=${brand}`);
    if (model) filters.push(`model=${model}`);
    if (selectedVehicle) filters.push(`vehicleId=${selectedVehicle}`);
    if (selectedHeadquarter) filters.push(`headquarterId=${selectedHeadquarter}`);

    const query = [
      `page=${page - 1}`, // Convert from UI pagination (1-based) to API pagination (0-based)
      `size=${size}`,
      `sort=${sortField},${sortOrder}`,
      ...filters,
    ].join('&');

    const response = await fetch(`${API_BASE_URL}/api/vehicle-parts?${query}`, {
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

    const response = await fetch(`${API_BASE_URL}/api/vehicle-parts/${id}`, {
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

const saveInventoryRow = async (partId: number, vehicleId: number | null, updatedRow: VehiclePartInventoryType) => {
  try {
    const token = localStorage.getItem('authToken');

    let query = '';
    if (vehicleId){
      query = `?VehicleAssociatedId=${vehicleId}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/vehicle-parts/${partId}/headquarters/${updatedRow.headquarterId}/stock${query}`, {
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

const associatedVehiclePart = async (partId: number, headquarterId: number, vehicleId: number | null, quantity: number, associated: boolean) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/vehicle-parts/${partId}/headquarters/${headquarterId}/association`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity: quantity,
        destinationVehicleId: associated ? vehicleId : null,
        sourceVehicleId: associated ? null : vehicleId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al asociar vehículo');
    }

    return {
      success: true,
      message: 'Vehículo asociado correctamente',
    };
  } catch (error) {
    console.error('Error asociando vehículo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red',
    };
  }
}

const fetchHeadquarters = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/headquarters/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error al obtener sedes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching headquarters:', error);
    return [];
  }
};

export const VehiclePartsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [vehicleParts, setVehicleParts] = useState<VehiclePartType[]>([]); const [tableParams, setTableParams] = useState<TableParams>({
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
  const [selectedHeadquarter, setSelectedHeadquarter] = useState<number | null>(null);

  // States for vehicles list (for filters and form)
  const [vehicles, setVehicles] = useState<{ id: number; name: string; vehicleType?: string; headquarterId: number }[]>([]);
  const [headquarters, setHeadquarters] = useState<{ id: number; name: string }[]>([]);

  const debouncedFetch = debounce((
    page: number,
    size: number,
    sortField: string,
    sortOrder: string,
    name?: string,
    brand?: string,
    model?: string,
    selectedVehicle?: number | null,
    selectedHeadquarter?: number | null
  ) => {
    loadVehicleParts(page, size, sortField, sortOrder, name, brand, model, selectedVehicle, selectedHeadquarter);
  }, 300);

  const loadVehicleParts = async (
    page: number = tableParams.pagination.current,
    size: number = tableParams.pagination.pageSize,
    sortField: string = tableParams.sortField,
    sortOrder: string = tableParams.sortOrder,
    name?: string,
    brand?: string,
    model?: string,
    selectedVehicle?: number | null,
    selectedHeadquarter?: number | null
  ) => {
    setLoading(true);
    try {
      const result = await fetchVehicleParts(page, size, sortField, sortOrder, name, brand, model, selectedVehicle, selectedHeadquarter);

      if (result.success && result.data) {
        const formattedData = result.data.map((part: any) => ({
          ...part,
          key: part.id.toString(),
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
      const response = await fetch(`${API_BASE_URL}/vehicle/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setVehicles(data.map((vehicle: any) => ({
          id: vehicle.id,
          name: vehicle.name,
          vehicleType: vehicle.vehicleType || "",
          headquarterId: vehicle.headquarterId || null,
        })));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const loadHeadquarters = async () => {
    try {
      const headquarters = await fetchHeadquarters();
      setHeadquarters(headquarters);
    } catch (error) {
      console.error('Error loading headquarters:', error);
      message.error('Error al cargar las sedes');
    }
  };

  useEffect(() => {
    loadVehicleParts();
    loadVehicles();
    loadHeadquarters();
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
      selectedVehicle,
      selectedHeadquarter
    );
  }, [searchName, searchBrand, searchModel, selectedVehicle, selectedHeadquarter]);

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
      selectedVehicle,
      selectedHeadquarter
    );
  };

  const handleCreate = () => {
    setEditingVehiclePart(emptyVehiclePart);
    setIsModalVisible(true);
  };

  const handleEdit = (vehiclePart: VehiclePartType) => {
    setEditingVehiclePart({
      id: vehiclePart.id,
      name: vehiclePart.name,
      brand: vehiclePart.brand,
      model: vehiclePart.model,
      description: vehiclePart.description || '',
      notes: vehiclePart.notes || '',
      vehicleId: vehiclePart.vehicleId || null,
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

  const handleSaveInventoryRow = async (partId: number, vehicleId: number | null, updatedRow: VehiclePartInventoryType) => {
    const result = await saveInventoryRow(partId, vehicleId, updatedRow);

    if (result.success) {
      message.success('Inventario actualizado correctamente');
      await loadVehicleParts();
      return { success: true };
    } else {
      message.error(`Error al guardar: ${result.error}`);
      return { success: false, error: result.error };
    }
  };

  const handleOnDisassociate = async (partId: number, headquarterId: number, vehicleId: number | null, quantity: number) => {
    const result = await associatedVehiclePart(partId, headquarterId, vehicleId, quantity, false);
    if (result.success) {
      message.success('Vehículo desasociado correctamente');
      await loadVehicleParts();
      return { success: true };
    } else {
      message.error(`Error al desasociar: ${result.error}`);
      return { success: false, error: result.error };
    }
  };

  const handleOnAssociate = async (partId: number, headquarterId: number, vehicleId: number | null, quantity: number) => {
    const result = await associatedVehiclePart(partId, headquarterId, vehicleId, quantity, true);
    if (result.success) {
      message.success('Vehículo asociado correctamente');
      await loadVehicleParts();
      return { success: true };
    } else {
      message.error(`Error al asociar: ${result.error}`);
      return { success: false, error: result.error };
    }
  };

  const columns: ColumnsType<VehiclePartType> = [
    {
      title: 'Acciones',
      width: 80,
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          trigger={['click']} menu={{
            items: [
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
            ], onClick: ({ key }) => {
              if (key === 'edit') handleEdit(record);
              if (key === 'delete') handleDelete(record);
            },
          }}
        >
          <Button type="text">•••</Button>
        </Dropdown>
      ),
    }, {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      width: 80,
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
    }, {
      title: 'Modelo',
      dataIndex: 'model',
      key: 'model',
      sorter: true,
    }, {
      title: 'Cantidad Total',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (_, record) => {
        if (!record.inventories || record.inventories.length === 0) return '0';
        const total = record.inventories.reduce((sum, inv) => sum + inv.quantity, 0);
        return total.toString();
      },
    },
    {
      title: 'Tipo de Vehículo',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      sorter: true,
      render: (type: string) => {
        const iconClass = type === 'car' ? 'fas fa-car' : 'fas fa-motorcycle';
        const label = type === 'car' ? 'Automóvil' : 'Motocicleta';

        return (
          <span>
            <i className={iconClass} style={{ marginRight: 8 }} />
            {label}
          </span>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '24px' }} className="overflow-x-auto">
      <VehiclePartFilters
        searchName={searchName}
        searchBrand={searchBrand}
        searchModel={searchModel}
        selectedVehicle={selectedVehicle}
        selectedHeadquarter={selectedHeadquarter}
        onSearchNameChange={setSearchName}
        onSearchBrandChange={setSearchBrand}
        onSearchModelChange={setSearchModel}
        onSelectedVehicleChange={setSelectedVehicle}
        onSelectedHeadquarterChange={setSelectedHeadquarter}
        onCreateClick={handleCreate}
        vehicles={vehicles}
        headquarters={headquarters}
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
          expandedRowRender: (record: VehiclePartType) => (
            <div
              style={{
                background: '#fafafa',
                padding: '16px',
                border: '1px solid #f0f0f0',
                borderRadius: '4px',
                margin: '8px 0'
              }}
            >
              <EditableInventorySubTable
                vehiclePart={record}
                inventories={record.inventories || []}
                vehicles={vehicles || []}
                onChange={(updatedInventories) => {
                  setVehicleParts(prev =>
                    prev.map(part =>
                      part.id === record.id
                        ? { ...part, inventories: updatedInventories }
                        : part
                    )
                  );
                }}
                onSaveRow={async (updatedRow) => {
                  const vehicleId = updatedRow.vehicleId || null;
                  return await handleSaveInventoryRow(record.id, vehicleId, updatedRow);
                }}
                onDisassociate={handleOnDisassociate}
                onAssociate={handleOnAssociate}
              />
            </div>
          ),
          rowExpandable: (record) => !!(record.inventories && record.inventories.length > 0),
        }}
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
