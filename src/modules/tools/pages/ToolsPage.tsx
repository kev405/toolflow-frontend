import React, { useState, useEffect } from 'react'
import { Table, Button, Dropdown, Tag, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { ToolFormModal } from '../components/ToolFormModal'
import { ToolFilters } from '../components/ToolFilters'
import { API_BASE_URL } from '../../../config'
import { EditableInventorySubTable } from '../components/EditableInventorySubTable'

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

export interface CategoryType {
  id: number;
  name: string;
  status: boolean;
}

export interface InventoryType {
  id: number;
  headquarterId: number;
  name: string;
  quantity: number;
  available: number;
  onLoan: number;
  damaged: number;
  main: boolean;
}

export interface ToolType {
  key: string;
  id: number;
  toolName: string;
  brand: string;
  quantity: number;
  available: number;
  damaged: number;
  onLoan: number;
  consumable: boolean;
  notes: string;
  minimalRegistration?: number;
  status: boolean;
  category: CategoryType;
  inventories?: InventoryType[];
}

export interface ToolPayload {
  id?: number;
  toolName: string;
  brand: string;
  available: number;
  damaged: number;
  onLoan: number;
  notes: string;
  consumable: boolean;
  minimalRegistration?: number;
  status: boolean;
  category: string;
}

const emptyTool: ToolPayload = {
  id: undefined,
  toolName: '',
  brand: '',
  available: 0,
  damaged: 0,
  onLoan: 0,
  notes: '',
  consumable: false,
  minimalRegistration: 0,
  status: true,
  category: ''
}


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

const fetchTools = async (
  page: number,
  size: number,
  sortField: string,
  sortOrder: string,
  nameFilter?: string,
  brandFilter?: string,
  categoryFilter?: string
) => {
  try {
    const token = localStorage.getItem('authToken');

    const filters: string[] = [];

    if (nameFilter) {
      filters.push(`filter=toolName:${nameFilter}`);
    }
    if (brandFilter) {
      filters.push(`filter=brand:${brandFilter}`);
    }
    if (categoryFilter) {
      filters.push(`filter=category.name:${categoryFilter.trim()}`);
    }

    const query = [
      `page=${page}`,
      `size=${size}`,
      `sort=${sortField},${sortOrder}`,
      ...filters
    ].join('&');

    const response = await fetch(`${API_BASE_URL}/tools?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener herramientas');
    }

    return {
      success: true,
      data: data.content,
      total: data.totalElements
    };
  } catch (error) {
    console.error('Error fetching tools:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener categorías');
    }

    return {
      success: true,
      data: data.content || data
    };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const deleteTool = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar la herramienta');
    }

    return {
      success: true,
      message: 'Herramienta eliminada correctamente'
    };
  } catch (error) {
    console.error('Error eliminando herramienta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const updateTool = async (id: number, tool: ToolPayload) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/tools/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tool)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar herramienta');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar herramienta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const createTool = async (tool: ToolPayload) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tool)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear herramienta');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al crear herramienta:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const updateToolInventoryStock = async (
  toolId: number,
  headquarterId: number,
  stock: {
    available: number;
    damaged: number;
    onLoan: number;
  }
) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/tools/${toolId}/headquarters/${headquarterId}/stock`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(stock)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar inventario');
    }

    return { success: true };
  } catch (error) {
    console.error('Error actualizando inventario:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const ToolsPage = () => {
  const [data, setData] = useState<ToolType[]>([])
  const [categories, setCategories] = useState<CategoryType[]>([])
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<ToolPayload | null>(null);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    sortField: 'id',
    sortOrder: 'desc'
  });

  const loadTools = async (

  ) => {
    setLoading(true);
    try {
      const result = await fetchTools(
        tableParams.pagination.current - 1,
        tableParams.pagination.pageSize,
        tableParams.sortField,
        tableParams.sortOrder,
        searchName,
        searchBrand,
        selectedCategory ? categories.find(cat => cat.id === selectedCategory)?.name : ''
      );

      if (result.success && result.data) {
        const formattedTools = result.data.map((tool: ToolType) => ({
          ...tool,
          key: tool.id.toString(),
          quantity: tool.quantity || 0,
          available: tool.available || 0,
          damaged: tool.damaged || 0,
          onLoan: tool.onLoan || 0,
        }));

        setData(formattedTools);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.total
          }
        }));
      }
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await fetchCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const debounceSearch = debounce(() => {
    loadTools();
  }, 500);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTools();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortField,
    tableParams.sortOrder,
  ]);

  useEffect(() => {
    debounceSearch();
  }, [searchName, searchBrand, selectedCategory]);


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

  const handleDelete = (record: ToolType) => {
    Modal.confirm({
      title: '¿Eliminar herramienta?',
      content: `¿Estás seguro que deseas eliminar la herramienta "${record.toolName}"? Esta acción no se puede deshacer.`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      centered: true,
      onOk: async () => {
        const result = await deleteTool(record.id);
        if (result.success) {
          message.success('Herramienta eliminada correctamente');
          loadTools();
        } else {
          message.error(`Error al eliminar: ${result.error}`);
        }
      }
    });
  };

  const handleEdit = (record: ToolType) => {
    const tool = {
      ...record,
      category: record.category.name,
    }
    setEditingTool(tool);
    setModalOpen(true);
  }

  const handleCreateTool = async (values: ToolPayload) => {
    const result = await createTool(values);
    if (result.success) {
      message.success('Herramienta creada con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleEditTool = async (values: ToolPayload) => {
    const id = editingTool?.id;

    if (!id) {
      message.error('ID de herramienta no encontrado');
      return;
    }

    const result = await updateTool(id, values);
    if (result.success) {
      message.success('Herramienta actualizada con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleSubmit = async (values: ToolPayload) => {
    setLoading(true);
  
    if (!values.consumable) {
      delete values.minimalRegistration;
    }
  
    try {
      if (editingTool) {
        await handleEditTool(values);
      } else {
        await handleCreateTool(values);
      }
      setModalOpen(false);
      setEditingTool(null);
      await loadTools();
      await loadCategories();
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInventoryRow = async (toolId: number, updatedRow: InventoryType) => {
    const result = await updateToolInventoryStock(
      toolId,
      updatedRow.headquarterId,
      {
        available: updatedRow.available,
        damaged: updatedRow.damaged,
        onLoan: updatedRow.onLoan
      }
    );
  
    if (result.success) {
      message.success('Inventario actualizado correctamente');
      await loadTools();
    } else {
      message.error(`Error al guardar: ${result.error}`);
    }
  };

  const getItems = (): MenuProps['items'] => [
    {
      key: '1',
      label: 'Editar',
      icon: <EditOutlined style={{ color: '#1890ff' }} />,
    },
    {
      key: '2',
      label: 'Eliminar',
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
    }
  ]

  const columns: ColumnsType<ToolType> = [
    {
      title: 'Acciones',
      width: 20,
      key: 'actions',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: getItems(),
            onClick: ({ key }) => {
              if (key === '1') handleEdit(record);
              if (key === '2') handleDelete(record);
            }
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
      title: 'Herramienta',
      dataIndex: 'toolName',
      key: 'toolName',
      sorter: true,
    },
    {
      title: 'Marca',
      dataIndex: 'brand',
      key: 'brand',
      sorter: true,
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      sorter: true,
    },
    {
      title: 'Disponible',
      dataIndex: 'available',
      key: 'available',
      sorter: true,
    },
    {
      title: 'Averiado',
      dataIndex: 'damaged',
      key: 'damaged',
      sorter: true,
    },
    {
      title: 'En Préstamo',
      dataIndex: 'onLoan',
      key: 'onLoan',
      sorter: true,
    },
    {
      title: 'Consumible',
      dataIndex: 'consumable',
      key: 'consumable',
      render: (value: boolean) => (value ? 'Sí' : 'No'),
    },
    {
      title: 'Registro Mínimo',
      dataIndex: 'minimalRegistration',
      key: 'minimalRegistration',
      sorter: true,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: boolean) => (
        <Tag color={status ? 'success' : 'error'}>
          {status ? 'ACTIVO' : 'INACTIVO'}
        </Tag>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: ['category', 'name'],
      key: 'category',
      sorter: true,
    },
  ];

  return (
    <div style={{ padding: '24px' }} className='overflow-x-auto'>
      <h1 className='h3 mb-3 text-gray-800'>Herramientas</h1>
      <ToolFilters
        searchName={searchName}
        searchBrand={searchBrand}
        selectedCategory={selectedCategory}
        categories={categories}
        onSearchNameChange={setSearchName}
        onSearchBrandChange={setSearchBrand}
        onCategoryChange={setSelectedCategory}
        onCreateClick={() => setModalOpen(true)}
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
        expandable={{
          expandedRowRender: (record: ToolType) => (
            <EditableInventorySubTable
              inventories={record.inventories || []}
              onChange={(updatedInventories) => {
                setData(prev =>
                  prev.map(tool =>
                    tool.id === record.id
                      ? { ...tool, inventories: updatedInventories }
                      : tool
                  )
                );
              }}
              onSaveRow={async (updatedRow) => {
                return await handleSaveInventoryRow(record.id, updatedRow);
              }}
            />
          )
        }}
      />
      <ToolFormModal
        id={editingTool?.id}
        open={modalOpen}
        onClose={() => {
          setEditingTool(null);
          setModalOpen(false);
        }}
        onSubmit={handleSubmit}
        initialValues={editingTool || emptyTool}
        title={editingTool ? 'Editar Herramienta' : 'Crear Herramienta'}
        categories={categories}
      />
    </div >
  )
}

export default ToolsPage
