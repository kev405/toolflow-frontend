import { Button, Descriptions, Divider, Dropdown, MenuProps, message } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { TransferFilters } from "../components/TransferFilters";
import TransferFormModal from "../components/TransferFormModal";
import TransferDetailsModal from "../components/TransferDetailsModal";
import TransferActionModal from "../components/TransferActionModal";
import TransferStatusTag from "../components/TransferStatusTag";
import { EditOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { API_BASE_URL } from "../../../config";

// Función helper para formatear fechas
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

export interface TransferType {
  id: number;
  responsible: {
    id: number;
    username: string;
  },
  transferDate: string;
  originHeadquarter: {
    id: number;
    name: string;
  };
  destinationHeadquarter: {
    id: number;
    name: string;
  };
  tools: {
    toolId: number;
    toolName: string;
    quantity: number;
  }[];
  vehicleParts: {
    partId: number;
    partName: string;
    quantity: number;
  }[];
  vehicles: {
    vehicleId: number;
    plate: string | null;
    model: string | null;
  }[];
  notes: string;
  createdAt: string;
  transferStatus?: 'PENDING' | 'ACCEPTED' | 'CANCELLED';
}

export interface TransferPayload {
  id?: number;
  responsibleId?: number | null;
  originHeadquarterId?: number;
  destinationHeadquarterId?: number;
  transferDate?: string;
  tools?: { toolId: number; quantity: number }[];
  vehicleParts?: { partId: number; quantity: number }[];
  vehicles?: number[];
  notes?: string;
}

// Interfaz para el formato interno del modal
export interface TransferFormData {
  id?: number;
  responsibleId?: number | null;
  originHeadquarterId?: number;
  destinationHeadquarterId?: number;
  transferDate?: string;
  tools?: { id: number; quantity: number }[];
  vehicleParts?: { id: number; quantity: number }[];
  vehicles?: number[];
  notes?: string;
}

const emptyTransfer: TransferFormData = {
  responsibleId: null,
  transferDate: '',
  originHeadquarterId: undefined,
  destinationHeadquarterId: undefined,
  tools: [],
  vehicleParts: [],
  vehicles: [],
  notes: ''
};

const filledTransfer: TransferFormData = {
  responsibleId: 101,
  transferDate: '2025-06-03',
  originHeadquarterId: 1,
  destinationHeadquarterId: 2,
  tools: [
    { id: 1, quantity: 3 },
    { id: 2, quantity: 5 },
  ],
  vehicleParts: [
    { id: 3, quantity: 2 },
  ],
  vehicles: [1, 3],
  notes: 'Traslado de materiales y vehículos entre almacenes.'
};

interface TableParams {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  sortField: string;
  sortOrder: string;
}

export const mockTransfers: TransferType[] = [
  {
    id: 1,
    responsible: {
      id: 101,
      username: 'carlos.perez',
    },
    transferDate: '2025-06-01T08:00:00Z',
    originHeadquarter: {
      id: 1,
      name: 'Almacén Central',
    },
    destinationHeadquarter: {
      id: 2,
      name: 'Sucursal Norte',
    },
    tools: [
      { toolId: 1, toolName: 'Taladro', quantity: 2 },
      { toolId: 2, toolName: 'Martillo', quantity: 5 },
    ],
    vehicleParts: [
      { partId: 1, partName: 'Filtro de Aceite', quantity: 3 },
    ],
    vehicles: [
      { vehicleId: 1, plate: 'ABC123', model: 'Ford F-150' },
    ],
    notes: 'Traslado urgente para obra en curso.',
    createdAt: '2025-06-01T08:00:00Z',
    transferStatus: 'PENDING',
  },
  {
    id: 2,
    responsible: {
      id: 102,
      username: 'maria.rodriguez',
    },
    transferDate: '2025-05-28T10:15:00Z',
    originHeadquarter: {
      id: 2,
      name: 'Sucursal Norte',
    },
    destinationHeadquarter: {
      id: 3,
      name: 'Sucursal Sur',
    },
    tools: [
      { toolId: 3, toolName: 'Sierra Circular', quantity: 1 },
    ],
    vehicleParts: [
      { partId: 2, partName: 'Batería de Camión', quantity: 1 },
    ],
    vehicles: [],
    notes: 'Mantenimiento preventivo en la sucursal sur.',
    createdAt: '2025-05-28T10:15:00Z',
    transferStatus: 'ACCEPTED',
  },
  {
    id: 3,
    responsible: {
      id: 103,
      username: 'luis.fernandez',
    },
    transferDate: '2025-05-25T14:30:00Z',
    originHeadquarter: {
      id: 1,
      name: 'Almacén Central',
    },
    destinationHeadquarter: {
      id: 4,
      name: 'Sucursal Este',
    },
    tools: [
      { toolId: 4, toolName: 'Llave Inglesa', quantity: 3 },
    ],
    vehicleParts: [
      { partId: 3, partName: 'Neumático', quantity: 4 },
    ],
    vehicles: [
      { vehicleId: 2, plate: 'XYZ789', model: 'Isuzu NPR' },
    ],
    notes: 'Traslado cancelado por falta de disponibilidad.',
    createdAt: '2025-05-25T14:30:00Z',
    transferStatus: 'CANCELLED',
  },
];

const mockResponsibles = [
  { id: 101, name: 'Carlos Pérez' },
  { id: 102, name: 'María Rodríguez' },
  { id: 103, name: 'Luis Fernández' },
  { id: 104, name: 'Ana Gómez' },
  { id: 105, name: 'Jorge Ramírez' },
];

const mockTools = [
  { id: 1, toolName: 'Taladro', name: 'Taladro', available: 10, headquarterId: 1 },
  { id: 2, toolName: 'Martillo', name: 'Martillo', available: 25, headquarterId: 1 },
  { id: 3, toolName: 'Sierra Circular', name: 'Sierra Circular', available: 5, headquarterId: 2 },
  { id: 4, toolName: 'Llave Inglesa', name: 'Llave Inglesa', available: 15, headquarterId: 3 },
  { id: 5, toolName: 'Destornillador', name: 'Destornillador', available: 30, headquarterId: 2 },
];

const mockUniqueTools = [
  { id: 1, name: 'Taladro' },
  { id: 2, name: 'Martillo' },
  { id: 3, name: 'Sierra Circular' },
  { id: 4, name: 'Llave Inglesa' },
  { id: 5, name: 'Destornillador' },
];

const mockVehicleParts = [
  { id: 1, name: 'Filtro de Aceite', available: 8, headquarterId: 1 },
  { id: 2, name: 'Batería', available: 4, headquarterId: 2 },
  { id: 3, name: 'Neumático', available: 12, headquarterId: 1 },
  { id: 4, name: 'Pastillas de Freno', available: 20, headquarterId: 3 },
  { id: 5, name: 'Amortiguador', available: 6, headquarterId: 2 },
];

const mockVehicles = [
  { id: 1, name: 'Camioneta Ford F-150', headquarterId: 1 },
  { id: 2, name: 'Camión Isuzu NPR', headquarterId: 1 },
  { id: 3, name: 'Van Renault Kangoo', headquarterId: 2 },
  { id: 4, name: 'Pickup Toyota Hilux', headquarterId: 3 },
  { id: 5, name: 'Camión Chevrolet NHR', headquarterId: 2 },
];

const mockHeadquarters = [
  { id: 1, name: 'Almacén Central' },
  { id: 2, name: 'Sucursal Norte' },
  { id: 3, name: 'Sucursal Sur' },
  { id: 4, name: 'Sucursal Este' },
  { id: 5, name: 'Sucursal Oeste' },
];

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

const fetchTransfers = async (
  page: number,
  size: number,
  sortField: string,
  sortOrder: string,
  startHeadquarterId?: number,
  endHeadquarterId?: number,
  transferDate?: string,
  toolIds?: number[],
  partIds?: number[],
  vehicleIds?: number[]
) => {
  try {
    const token = localStorage.getItem('authToken');

    const params: string[] = [
      `page=${page}`,
      `size=${size}`,
      `sort=${sortField},${sortOrder}`
    ];

    // Agregar filtros según el formato de la API
    if (startHeadquarterId !== undefined) {
      params.push(`originId=${startHeadquarterId}`);
    }
    if (endHeadquarterId !== undefined) {
      params.push(`destinationId=${endHeadquarterId}`);
    }
    if (transferDate) {
      params.push(`transferDate=${transferDate}`);
    }
    if (toolIds && toolIds.length > 0) {
      params.push(`toolIds=${toolIds.join(',')}`);
    }
    if (partIds && partIds.length > 0) {
      params.push(`partIds=${partIds.join(',')}`);
    }
    if (vehicleIds && vehicleIds.length > 0) {
      params.push(`vehicleIds=${vehicleIds.join(',')}`);
    }

    const query = params.join('&');
    console.log('Query:', query);
    
    const response = await fetch(`${API_BASE_URL}/api/transfers?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener traslados');
    }

    // Mapear los datos para asegurar que transferStatus esté presente
    const mappedData = data.content.map((transfer: any) => ({
      ...transfer,
      transferStatus: transfer.transferStatus || 'PENDING'
    }));

    return {
      success: true,
      data: mappedData,
      total: data.totalElements
    };
  } catch (error) {
    console.error('Error fetching transfers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchResponsibles = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/users/by-roles?roles=ADMINISTRATOR`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener responsables');
    }

    return {
      success: true,
      data: data.content || data
    };
  } catch (error) {
    console.error('Error fetching responsibles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchTools = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/tools/all`, {
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
}

const fetchVehicleParts = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/vehicle-parts/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener partes de vehículos');
    }

    return {
      success: true,
      data: data.content || data
    };
  } catch (error) {
    console.error('Error fetching vehicle parts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchVehicles = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/vehicle/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener vehículos');
    }

    return {
      success: true,
      data: data.content || data
    };
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchVehiclesAvailableForTransfer = async (headquarterId: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/vehicle/available-for-transfer?headquarterId=${headquarterId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener vehículos disponibles');
    }

    return {
      success: true,
      data: data.content || data
    };
  } catch (error) {
    console.error('Error fetching vehicles available for transfer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchVehiclePartsAvailableForTransfer = async (headquarterId: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/vehicle-parts/available-for-transfer?headquarterId=${headquarterId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener partes de vehículos disponibles');
    }

    return {
      success: true,
      data: data.content || data
    };
  } catch (error) {
    console.error('Error fetching vehicle parts available for transfer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchToolsAvailableForTransfer = async (headquarterId: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/tools/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener herramientas disponibles');
    }
   

    return {
      success: true,
      data: data.content || data
    };
  } catch (error) {
    console.error('Error fetching tools available for transfer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchHeadquarters = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/headquarters/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener sucursales');
    }

    return {
      success: true,
      data: data.content || data
    };
  } catch (error) {
    console.error('Error fetching headquarters:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
}

const createTransfer = async (transfer: TransferPayload) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/transfers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transfer)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el traslado');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al crear el traslado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const updateTransfer = async (id: number, transfer: TransferPayload) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/transfers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transfer)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al actualizar el traslado');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al actualizar el traslado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const getTransferById = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/transfers/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener el traslado');
    }

    // Asegurar que transferStatus esté presente
    const mappedData = {
      ...data,
      transferStatus: data.transferStatus || 'PENDING'
    };

    return {
      success: true,
      data: mappedData
    };
  } catch (error) {
    console.error('Error al obtener el traslado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const acceptTransfer = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/transfers/${id}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al aceptar el traslado');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al aceptar el traslado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const cancelTransfer = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/api/transfers/${id}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al cancelar el traslado');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al cancelar el traslado:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const TransfersPages = () => {
  const [data, setData] = useState<TransferType[]>(mockTransfers);

  const [responsibles, setResponsibles] = useState<{ id: number, name: string }[]>(mockResponsibles);
  const [tools, setTools] = useState<{ id: number, name: string, available: number, headquarterId: number | null, status?: boolean }[]>(mockTools);
  const [allTools, setAllTools] = useState<{ id: number, name: string, available: number, headquarterId: number | null, status?: boolean }[]>(mockTools); // Lista completa
  const [vehicleParts, setVehicleParts] = useState<{ id: number, name: string, available: number, headquarterId: number | null }[]>(mockVehicleParts);
  const [vehicles, setVehicles] = useState<{ id: number, name: string, headquarterId: number | null }[]>(mockVehicles);
  const [allVehicleParts, setAllVehicleParts] = useState<{ id: number, name: string, available: number, headquarterId: number | null, status?: boolean }[]>(mockVehicleParts);
  const [allVehicles, setAllVehicles] = useState<{ id: number, name: string, headquarterId: number | null, status?: boolean }[]>(mockVehicles);
  
  // Estado para herramientas únicas (para filtros)
  const [uniqueTools, setUniqueTools] = useState<{ id: number; name: string }[]>(mockUniqueTools);

  // Estados para datos disponibles por sede
  const [availableVehicles, setAvailableVehicles] = useState<{ id: number, name: string, headquarterId: number | null }[]>([]);
  const [availableVehicleParts, setAvailableVehicleParts] = useState<{ id: number, name: string, available: number, headquarterId: number | null }[]>([]);
  const [availableTools, setAvailableTools] = useState<{ id: number, name: string, available: number, headquarterId: number | null, status?: boolean }[]>([]);
  const [headquarters, setHeadquarters] = useState<{ id: number; name: string }[]>(mockHeadquarters);

  const [selectedToolIds, setSelectedToolIds] = useState<number[]>([]);
  const [selectedPartIds, setSelectedPartIds] = useState<number[]>([]);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<number[]>([]);
  const [selectedStartHeadquarterId, setStartHeadquarterId] = useState<number | null>(null);
  const [selectedEndHeadquarterId, setEndHeadquarterId] = useState<number | null>(null);
  const [transferDate, setTransferDate] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [transfer, setTransfer] = useState<TransferFormData>(filledTransfer);
  const [selectedTransfer, setSelectedTransfer] = useState<TransferType | null>(null);
  const [actionTransfer, setActionTransfer] = useState<TransferType | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'cancel'>('accept');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    sortField: 'id',
    sortOrder: 'desc'
  });

  const loadTransfers = async () => {
    setLoading(true);
    try {
      const result = await fetchTransfers(
        tableParams.pagination.current - 1,
        tableParams.pagination.pageSize,
        tableParams.sortField,
        tableParams.sortOrder,
        selectedStartHeadquarterId ?? undefined,
        selectedEndHeadquarterId ?? undefined,
        transferDate ?? undefined,
        selectedToolIds.length > 0 ? selectedToolIds : undefined,
        selectedPartIds.length > 0 ? selectedPartIds : undefined,
        selectedVehicleIds.length > 0 ? selectedVehicleIds : undefined
      );

      if (result.success && result.data) {
        setData(result.data);
        setTableParams(prev => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.total
          }
        }));
      }
    } catch (error) {
      console.error('Error loading transfers:', error);
      message.error('No se pudieron cargar los traslados');
    } finally {
      setLoading(false);
    }
  };

  const loadResponsibles = async () => {
    const result = await fetchResponsibles();
    console.log(result, 'result responsables');
    if (result.success) {
      setResponsibles(result.data);
    } else {
      message.error(result.error || 'Error al cargar responsables');
    }
  };

  const loadTools = async () => {
    const result = await fetchTools();
    if (result.success) {
      // Transformar los datos para que sean compatibles con TransferFormModal
      const transformedTools = result.data.flatMap((tool: any) => {
        // Si la herramienta tiene inventarios, crear un item por cada sede
        if (tool.inventories && tool.inventories.length > 0) {
          return tool.inventories.map((inventory: any) => ({
            id: tool.id,
            name: tool.toolName,
            available: inventory.available,
            headquarterId: inventory.headquarterId,
            status: tool.status // Incluir el status de la herramienta
          }));
        } else {
          // Si no tiene inventarios, crear un item con datos por defecto
          return [{
            id: tool.id,
            name: tool.toolName,
            available: tool.available || 0,
            headquarterId: null, // No asignado a ninguna sede
            status: tool.status // Incluir el status de la herramienta
          }];
        }
      });

      setTools(transformedTools);
      // Guardar la lista completa de herramientas (sin filtrar por sede)
      const allToolsList = result.data.map((tool: any) => ({
        id: tool.id,
        name: tool.toolName,
        available: tool.available || 0,
        headquarterId: null,
        status: tool.status
      }));
      setAllTools(allToolsList);
      
      // Crear lista de herramientas únicas para filtros
      const uniqueToolsList = result.data.map((tool: any) => ({
        id: tool.id,
        name: tool.toolName
      }));
      setUniqueTools(uniqueToolsList);
      
      console.log(transformedTools, 'transformed tools');
    } else {
      message.error(result.error || 'Error al cargar herramientas');
    }
  };

  const loadVehicleParts = async () => {
    const result = await fetchVehicleParts();
    if (result.success) {
      // Transformar los datos para que sean compatibles con TransferFormModal
      const transformedParts = result.data.flatMap((part: any) => {
        // Si la parte tiene inventarios, crear un item por cada sede
        if (part.inventories && part.inventories.length > 0) {
          return part.inventories.map((inventory: any) => ({
            id: part.id,
            name: part.name,
            available: inventory.quantity,
            headquarterId: inventory.headquarterId,
            status: part.status
          }));
        } else {
          // Si no tiene inventarios, crear un item con datos por defecto
          return [{
            id: part.id,
            name: part.name,
            available: part.quantity || 0,
            headquarterId: null, // No asignado a ninguna sede
            status: part.status
          }];
        }
      });

      setVehicleParts(transformedParts);
      // Guardar la lista completa de partes de vehículo (sin filtrar por sede)
      const allPartsList = result.data.map((part: any) => ({
        id: part.id,
        name: part.name,
        available: part.quantity || 0,
        headquarterId: null,
        status: part.status
      }));
      setAllVehicleParts(allPartsList);
    } else {
      message.error(result.error || 'Error al cargar partes de vehículos');
    }
  };

  const loadVehicles = async () => {
    const result = await fetchVehicles();
    if (result.success) {
      // Los vehículos ya tienen headquarterId directamente
      const transformedVehicles = result.data.map((vehicle: any) => ({
        id: vehicle.id,
        name: vehicle.name,
        headquarterId: vehicle.headquarterId
        ,status: vehicle.status
      }));

      setVehicles(transformedVehicles);
      // Guardar la lista completa de vehículos
      const allVehiclesList = result.data.map((vehicle: any) => ({
        id: vehicle.id,
        name: vehicle.name,
        headquarterId: vehicle.headquarterId,
        status: vehicle.status
      }));
      setAllVehicles(allVehiclesList);
    } else {
      message.error(result.error || 'Error al cargar vehículos');
    }
  };

  const loadAvailableVehiclesForTransfer = async (headquarterId: number) => {
    const result = await fetchVehiclesAvailableForTransfer(headquarterId);
    if (result.success) {
      const transformedVehicles = result.data.map((vehicle: any) => ({
        id: vehicle.id,
        name: vehicle.name,
        available: vehicle.availableQuantity || 0,
        headquarterId: headquarterId // Usar el headquarterId que se pasó como parámetro
      }));

      setAvailableVehicles(transformedVehicles);
    } else {
      message.error(result.error || 'Error al cargar vehículos disponibles');
      setAvailableVehicles([]);
    }
  };

  const loadAvailableVehiclePartsForTransfer = async (headquarterId: number) => {
    const result = await fetchVehiclePartsAvailableForTransfer(headquarterId);
    if (result.success) {
      const transformedParts = result.data.map((part: any) => ({
        id: part.id,
        name: part.name,
        available: part.availableQuantity || part.available || part.quantity || 0,
        headquarterId: headquarterId // Usar el headquarterId que se pasó como parámetro
      }));

      setAvailableVehicleParts(transformedParts);
    } else {
      message.error(result.error || 'Error al cargar partes de vehículos disponibles');
      setAvailableVehicleParts([]);
    }
  };

  const loadAvailableToolsForTransfer = async (headquarterId: number) => {
    const result = await fetchToolsAvailableForTransfer(headquarterId);
    if (result.success) {
      // Transformar los datos para obtener la cantidad disponible por sede
      const transformedTools = result.data.map((tool: any) => {
        // Encontrar el inventario específico de la sede
        const inventory = tool.inventories?.find((inv: any) => inv.headquarterId === headquarterId);
        return {
          id: tool.id,
          name: tool.toolName || tool.name,
          available: inventory?.available || 0,
          headquarterId: headquarterId,
          status: tool.status
        };
      });

      setAvailableTools(transformedTools);
    } else {
      message.error(result.error || 'Error al cargar herramientas disponibles');
      setAvailableTools([]);
    }
  };

  const loadHeadquarters = async () => {
    const result = await fetchHeadquarters();
    if (result.success) {
      setHeadquarters(result.data);
    } else {
      message.error(result.error || 'Error al cargar sucursales');
    }
  };

  useEffect(() => {
    loadResponsibles();
    loadTools();
    loadVehicleParts();
    loadVehicles();
    loadHeadquarters();
  }, []);

  useEffect(() => {
    loadTransfers();
  }, [tableParams.pagination.current, tableParams.pagination.pageSize, tableParams.sortField, tableParams.sortOrder]);

  const debounceSearch = debounce(() => {
    loadTransfers();
  }, 500);

  useEffect(() => {
    debounceSearch();
  }, [
    selectedStartHeadquarterId,
    selectedEndHeadquarterId,
    transferDate,
    selectedToolIds,
    selectedPartIds,
    selectedVehicleIds
  ]);

  const getTransfer = async (id: number) => {
    const result = await getTransferById(id);
    if (result.success) {
      // Transformar los datos para que sean compatibles con el modal de edición
      const transferData = result.data;
      const transformedTransfer: TransferFormData = {
        id: transferData.id,
        responsibleId: transferData.responsible?.id,
        originHeadquarterId: transferData.originHeadquarter?.id,
        destinationHeadquarterId: transferData.destinationHeadquarter?.id,
        transferDate: transferData.transferDate,
        notes: transferData.notes,
        // Transformar tools al formato esperado por el modal (id en lugar de toolId)
        tools: transferData.tools?.map((tool: any) => ({
          id: tool.toolId,
          name: tool.toolName, // <-- nombre de la herramienta
          quantity: tool.quantity
        })) || [],
        // Transformar vehicleParts al formato esperado por el modal (id en lugar de partId)
        vehicleParts: transferData.vehicleParts?.map((part: any) => ({
          id: part.partId,
          name: part.partName, // <-- nombre de la parte
          quantity: part.quantity
        })) || [],
        // Transformar vehicles al formato esperado por el modal
        vehicles: transferData.vehicles?.map((vehicle: any) => vehicle.vehicleId) || [],
      };
      setTransfer(transformedTransfer);
    } else {
      message.error(result.error || 'Error al obtener el traslado');
    }
  };

  const handleView = (record: TransferType) => {
    setSelectedTransfer(record);
    setDetailsModalOpen(true);
  };

  const handleEdit = async (record: TransferType) => {
    try {
      setIsEditing(true);
      setIsCreating(false);
      setModalOpen(true);
      await getTransfer(record.id);
    } catch (error) {
      console.error('Error al cargar el traslado para editar:', error);
      message.error('Error al cargar el traslado para editar');
      setIsEditing(false);
      setModalOpen(false);
    }
  };

  const handleAcceptTransfer = (record: TransferType) => {
    setActionTransfer(record);
    setActionType('accept');
    setActionModalOpen(true);
  };

  const handleCancelTransfer = (record: TransferType) => {
    setActionTransfer(record);
    setActionType('cancel');
    setActionModalOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!actionTransfer) return;

    // Validar si hay herramientas, partes o vehículos inactivos, no disponibles o inexistentes
    const hasInactiveTool = actionTransfer.tools?.some(t => {
      const tool = allTools.find(at => at.id === t.toolId);
      return !tool || tool.status === false || (tool.available ?? 1) === 0;
    }) || false;
    const hasInactivePart = actionTransfer.vehicleParts?.some(p => {
      const part = allVehicleParts.find(ap => ap.id === p.partId);
      return !part || part.status === false || (part.available ?? 1) === 0;
    }) || false;
    const hasInactiveVehicle = actionTransfer.vehicles?.some(v => {
      const vehicle = allVehicles.find(av => av.id === v.vehicleId);
      return !vehicle || vehicle.status === false || (vehicle.available ?? 1) === 0;
    }) || false;
    if (hasInactiveTool || hasInactivePart || hasInactiveVehicle) {
      message.error('No se puede aceptar el traslado porque contiene herramientas, partes o vehículos inactivos, no disponibles o inexistentes. Elimine los ítems inactivos antes de aceptar.');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (actionType === 'accept') {
        result = await acceptTransfer(actionTransfer.id);
      } else {
        result = await cancelTransfer(actionTransfer.id);
      }

      if (result.success) {
        message.success(
          actionType === 'accept' 
            ? 'Traslado aceptado con éxito' 
            : 'Traslado cancelado con éxito'
        );
        await loadTransfers();
      } else {
        message.error(result.error);
      }
    } catch (error) {
      console.error('Error al procesar la acción:', error);
      message.error('Error al procesar la acción');
    } finally {
      setLoading(false);
      setActionModalOpen(false);
      setActionTransfer(null);
    }
  };

  const handleActionClose = () => {
    setActionModalOpen(false);
    setActionTransfer(null);
  };

  const handleCreateTransfer = async (values: TransferPayload) => {
    const result = await createTransfer(values);
    if (result.success) {
      message.success('Traslado creado con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleUpdateTransfer = async (values: TransferPayload) => {
    const id = transfer.id;

    if (!id) {
      message.error('ID de traslado no válido');
      return;
    }

    const result = await updateTransfer(id, values);
    if (result.success) {
      message.success('Traslado actualizado con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleSubmit = async (values: TransferPayload) => {
    setLoading(true);

    try {
      if (isEditing) {
        await handleUpdateTransfer(values);
      } else {
        await handleCreateTransfer(values);
      }

      await loadTransfers();

    } finally {
      setLoading(false);
      setIsCreating(false);
      setIsEditing(false);
      setModalOpen(false);
      setTransfer(emptyTransfer);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setTransfer(emptyTransfer);
    setIsCreating(false);
    setIsEditing(false);
    // Limpiar los datos disponibles por sede
    setAvailableVehicles([]);
    setAvailableVehicleParts([]);
    setAvailableTools([]);
  };

  // Función para resetear el formulario cuando se cierre el modal
  const handleModalAfterClose = () => {
    // Resetear el formulario después de que el modal se cierre completamente
    setTimeout(() => {
      setTransfer(emptyTransfer);
    }, 100);
  };


      const columns: ColumnsType<TransferType> = [
      {
        title: 'Acciones',
        key: 'actions',
        width: 120,
        render: (_, record) => {
          const isPending = record.transferStatus === 'PENDING' || !record.transferStatus;
          
          const items: MenuProps['items'] = [
            {
              key: 'view',
              label: 'Ver',
              icon: <EyeOutlined style={{ color: '#52c41a' }} />,
            },
            ...(isPending ? [
              {
                key: 'edit',
                label: 'Editar',
                icon: <EditOutlined style={{ color: '#1890ff' }} />,
              },
              {
                key: 'accept',
                label: 'Aceptar',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              },
              {
                key: 'cancel',
                label: 'Cancelar',
                icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
              }
            ] : [])
          ];

          return (
            <Dropdown
              trigger={['click']}
              menu={{
                items,
                onClick: ({ key }) => {
                  if (key === 'view') handleView(record);
                  if (key === 'edit') handleEdit(record);
                  if (key === 'accept') handleAcceptTransfer(record);
                  if (key === 'cancel') handleCancelTransfer(record);
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
      title: 'Responsable',
      dataIndex: 'responsible',
      key: 'responsible',
      render: (responsible) => responsible?.username,
      sorter: true
    },
    {
      title: 'Fecha de Traslado',
      dataIndex: 'transferDate',
      key: 'transferDate',
      sorter: true,
      render: (date) => formatDate(date),
    },
    {
      title: 'Origen',
      dataIndex: 'originHeadquarter',
      key: 'originHeadquarter',
      sorter: true,
      render: (hq) => hq?.name,
    },
    {
      title: 'Destino',
      dataIndex: 'destinationHeadquarter',
      key: 'destinationHeadquarter',
      sorter: true,
      render: (hq) => hq?.name,
    },
    {
      title: 'Estado',
      dataIndex: 'transferStatus',
      key: 'transferStatus',
      sorter: true,
      render: (status) => <TransferStatusTag status={status} />,
    }
  ];

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



  return (
    <div style={{ padding: '24px' }} className='overflow-x-auto'>      
      <TransferFilters
        startHeadquarters={headquarters}
        endHeadquarters={headquarters}
        tools={uniqueTools}
        vehicleParts={vehicleParts}
        vehicles={vehicles}
        startHeadquarterId={selectedStartHeadquarterId}
        endHeadquarterId={selectedEndHeadquarterId}
        transferDate={transferDate}
        selectedToolIds={selectedToolIds}
        selectedPartIds={selectedPartIds}
        selectedVehicleIds={selectedVehicleIds}
        onStartChange={setStartHeadquarterId}
        onEndChange={setEndHeadquarterId}
        onDateChange={(date, dateString) => setTransferDate(typeof dateString === 'string' ? dateString : null)}
        onToolChange={setSelectedToolIds}
        onPartChange={setSelectedPartIds}
        onVehicleChange={setSelectedVehicleIds}
        onCreateClick={() => {
          setIsCreating(true);
          setTransfer(emptyTransfer);
          setModalOpen(true);
        }}
      />
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        rowKey="id"
      />
      <TransferFormModal
        title={isCreating ? 'Crear Traslado' : 'Editar Traslado'}
        open={modalOpen}
        initialValues={transfer}
        responsibles={responsibles}
        tools={tools}
        toolsAll={allTools}
        vehicleParts={vehicleParts}
        vehiclePartsAll={allVehicleParts}
        vehicles={vehicles}
        vehiclesAll={allVehicles}
        availableVehicles={availableVehicles}
        availableVehicleParts={availableVehicleParts}        
        headquarters={headquarters}
        isCreating={isCreating}
        isEditing={isEditing}
        onClose={handleModalClose}
        onSubmit={handleSubmit}
        afterClose={handleModalAfterClose}
        onHeadquarterChange={(headquarterId) => {
          loadAvailableVehiclesForTransfer(headquarterId);
          loadAvailableVehiclePartsForTransfer(headquarterId);
          loadAvailableToolsForTransfer(headquarterId);
        }}
      />
      <TransferDetailsModal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        transfer={selectedTransfer}
      />
      <TransferActionModal
        open={actionModalOpen}
        onClose={handleActionClose}
        onConfirm={handleActionConfirm}
        action={actionType}
        transferId={actionTransfer?.id || 0}
        transferInfo={actionTransfer ? `${actionTransfer.originHeadquarter.name} → ${actionTransfer.destinationHeadquarter.name}` : undefined}
      />
    </div>
  )
}

export default TransfersPages