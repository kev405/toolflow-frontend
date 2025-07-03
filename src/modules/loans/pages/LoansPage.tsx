import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Dropdown, Modal, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { LoanFilters } from '../components/LoanFilters';
import LoanFormModal from '../components/LoanFormModal';
import { useAuth } from '../../../hooks/useAuth';
import { API_BASE_URL } from '../../../config';
import dayjs from 'dayjs';
import { LoanStatusTag } from '../components/LoanStatusTag';
import { ToolType } from '../../tools/pages/ToolsPage';

interface LoanType {
  id: number;
  teacher: {
    id: number;
    fullName: string;
  },
  responsible: {
    id: number;
    fullName: string;
  },
  dueDate: string;
  receivedDate: string;
  loanStatus: string;
  tools: {
    id: number;
    requested: number;
    loaned: number;
    delivered: number;
    damaged: number;
    responsible: {
      id: number;
      fullName: string;
    };
    notes?: string;
  }[];
  returned: boolean;
  status: boolean;
}

export interface LoanPayload {
  id?: number;
  teacherId: number | null;
  dueDate: string | null;
  toolOptions?: number[];
  tools: {
    id: number;
    requested: number;
    loaned: number;
    delivered: number;
    damaged: number;
    notes?: string;
  }[];
  responsibleId?: number | null;
  notes?: string;
  status?: boolean;
  loanStatus?: string;
  sameDay?: boolean;
}

const emptyLoan: LoanPayload = {
  teacherId: null,
  dueDate: dayjs().format('YYYY-MM-DD'),
  tools: [],
  responsibleId: null,
  notes: '',
  status: true,
  loanStatus: 'pedido',
  sameDay: true
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

const fetchLoans = async (
  page: number,
  size: number,
  sortField: string,
  sortOrder: string,
  teacherName?: string,
  responsibleName?: string,
  dueDate?: string,
  loanStatus?: string,
  selectedTools?: number[]
) => {
  try {
    const token = localStorage.getItem('authToken');

    const filters: string[] = [];

    if (teacherName) {
      filters.push(`filter=teacherId:${teacherName}`);
    }
    if (responsibleName) {
      filters.push(`filter=responsibleId:${responsibleName}`);
    }
    if (dueDate) {
      filters.push(`filter=dueDate:${dueDate}`);
    }
    if (loanStatus) {
      filters.push(`filter=loanStatus:${loanStatus}`);
    }
    if (selectedTools && selectedTools.length > 0) {
      const toolsFilter = selectedTools.join(',');
      filters.push(`filter=toolIds:${toolsFilter}`);
    }

    const query = [
      `page=${page}`,
      `size=${size}`,
      `sort=${sortField},${sortOrder}`,
      ...filters
    ].join('&');

    const response = await fetch(`${API_BASE_URL}/loans?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener préstamos');
    }

    return {
      success: true,
      data: data.content,
      total: data.totalElements
    };
  } catch (error) {
    console.error('Error fetching loans:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de red'
    };
  }
};

const fetchTeachers = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/users/all/teachers`, {
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

const fetchStudents = async () => {
  try {
    const token = localStorage.getItem('authToken');

    const roles = ['STUDENT'];

    const queryParams = roles.map(role => `roles=${encodeURIComponent(role)}`).join('&');

    const response = await fetch(`${API_BASE_URL}/users/by-roles?${queryParams}`, {
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

const createLoan = async (loan: LoanPayload) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/loans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(loan)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el préstamo');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al crear el prestamo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

const upadateLoan = async (id: number, loan: LoanPayload) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/loans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(loan)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al crear el préstamo');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al crear el prestamo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

const deleteLoan = async (id: number) => {
  try {
    const token = localStorage.getItem('authToken');

    const response = await fetch(`${API_BASE_URL}/loans/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al eliminar el préstamo');
    }

    return { success: true };
  } catch (error) {
    console.error('Error al eliminar el prestamo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}

const LoansPage = () => {
  const auth = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [data, setData] = useState<LoanType[]>([]);
  const [teachers, setTeachers] = useState<{ id: number, username: string, name: string }[]>([]);
  const [students, setStudents] = useState<{ id: number, username: string, name: string }[]>([]);
  const [tools, setTools] = useState<ToolType[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState<string>('ON_CREATE');
  const [loan, setLoan] = useState<LoanPayload>(emptyLoan);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [loanStatus, setLoanStatus] = useState<string | null>(null);
  const [selectedTools, setSelectedTools] = useState<number[]>([]);
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    },
    sortField: 'dueDate',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const roles = auth.user?.role?.map((role) => role.authority);

    if (roles?.includes('ADMINISTRATOR') || roles?.includes('TOOL_ADMINISTRATOR')) {
      setIsAdmin(true);
    }

    if (roles?.includes('TEACHER') && roles.length === 1) {
      setLoan({
        ...emptyLoan,
        teacherId: teachers.find((teacher) => teacher.username === auth.user?.id)?.id || null
      });
    }
  }
    , [auth.user, teachers]);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const result = await fetchTeachers();
      const data = result.data.map((teacher: any) => ({
        id: teacher.id,
        name: `${teacher?.name} ${teacher?.lastName}`,
        username: teacher?.username,
      }));
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      message.error('No se pudieron cargar los profesores');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const result = await fetchStudents();
      const data = result.data.map((student: any) => ({
        id: student.id,
        name: `${student?.name} ${student?.lastName}`,
        username: student?.username,
      }));
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      message.error('No se pudieron cargar los estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const loadTools = async () => {
    setLoading(true);
    try {
      const result = await fetchTools();
  
      if (result.success && result.data) {
        const filteredTools = result.data
          .map((tool: ToolType) => {
            const mainInventory = tool.inventories?.find(inv => inv.main);
  
            if (!mainInventory) {
              return null;
            }
  
            return {
              ...tool,
              quantity: mainInventory.quantity,
              available: mainInventory.available,
              damaged: mainInventory.damaged,
              onLoan: mainInventory.onLoan,
            };
          })
          .filter(Boolean);
  
        setTools(filteredTools as ToolType[]);
      }
    } catch (error) {
      console.error('Error loading tools:', error);
      message.error('No se pudieron cargar las herramientas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    loadTools();
    loadStudents();
  }, []);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const result = await fetchLoans(
        tableParams.pagination.current - 1,
        tableParams.pagination.pageSize,
        tableParams.sortField,
        tableParams.sortOrder,
        teacherName,
        responsibleName,
        dueDate ?? undefined,
        loanStatus ?? undefined,
        selectedTools 
      );
      if (result.success && result.data) {
        const formattedData = result.data.map((loan: LoanType) => ({
          ...loan,
          returned: !["ON_LOAN", "ORDER", "CANCELLED", "OVERDUE"].includes(loan.loanStatus),
        }));
        setData(formattedData);
        setTableParams((prev) => ({
          ...prev,
          pagination: {
            ...prev.pagination,
            total: result.total
          }
        }));
      }
    } catch (error) {
      console.error('Error loading loans:', error);
      message.error('No se pudieron cargar los préstamos');
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    loadLoans();
  }, [
    tableParams.pagination.current,
    tableParams.pagination.pageSize,
    tableParams.sortField,
    tableParams.sortOrder
  ]);

  const debounceSearch = debounce(() => {
    loadLoans();
  }, 500);

  useEffect(() => {
    debounceSearch();
  }, [teacherName, responsibleName, dueDate, loanStatus, selectedTools]);

  const handleEdit = (record: LoanType) => {
    const tools = record.tools.reduce((acc: any, tool: any) => {
      acc[tool.id] = {
        ...tool,
        id: tool.id,
        requested: tool.requested,
        loaned: tool.loaned,
        delivered: tool.delivered,
        damaged: tool.damaged,
        notes: tool.notes || '',
        responsibleId: tool.responsible?.id || null,
      };
      return acc;
    }
      , {});
    setLoan({
      ...record,
      tools,
      teacherId: record.teacher.id,
      responsibleId: record?.responsible?.id,
      dueDate: record.dueDate,
      sameDay: true,
      loanStatus: record.loanStatus,
      status: record.status,
      toolOptions: record.tools.map((tool) => tool.id),
    });
    setModalOpen(true);
    setIsCreating(false);
    setIsEditing(true);
    setDefaultStatus(record.loanStatus);
  };

  const handleDelete = (record: LoanType) => {
    Modal.confirm({
      title: '¿Eliminar préstamo?',
      content: `¿Seguro que deseas eliminar el préstamo de "${record.teacher.fullName}"?`,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        const result = await deleteLoan(record.id);
        if (result.success) {
          message.success('Prestamos eliminado correctamente');
          await loadTools();
          await loadLoans();
        } else {
          message.error(`Error al eliminar: ${result.error}`);
        }
      }
    });
  };

  const handleCreateLoan = async (values: LoanPayload) => {
    const result = await createLoan(values);
    if (result.success) {
      message.success('Prestamo creado con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleUpdateLoan = async (values: LoanPayload) => {
    const id = loan.id;

    if (!id) {
      message.error('ID de préstamo no válido');
      return;
    }

    const result = await upadateLoan(id, values);
    if (result.success) {
      message.success('Prestamo actualizado con éxito');
    } else {
      message.error(result.error);
    }
  };

  const handleSubmit = async (values: LoanPayload) => {
    setLoading(true);
    const roles = auth.user?.role?.map((role) => role.authority);

    const tools = Object.entries(values.tools).map(([key, data]) => ({
      ...data,
      id: Number(key),
    }));

    let payload = { ...values, tools, dueDate: values.dueDate ? dayjs(values.dueDate).format('YYYY-MM-DD') : null };
    if (roles?.includes('ADMINISTRATOR') || roles?.includes('TOOL_ADMINISTRATOR')) {
      payload = {
        ...payload,
        loanStatus: "ON_LOAN",
      };
    }

    if (roles?.includes('TEACHER') && roles.length === 1) {
      payload = {
        ...payload,
        teacherId: teachers.find((teacher) => teacher.username === auth.user?.id)?.id || null,
        loanStatus: "ORDER",
      };
    }

    delete payload?.sameDay;
    delete payload?.toolOptions;

    try {
      if (isEditing) {
        await handleUpdateLoan(payload);
      } else {
        await handleCreateLoan(payload);
      }
      setModalOpen(false);
      setLoan(emptyLoan);
      await loadTools();
      await loadLoans();
    } finally {
      setLoading(false);
      setIsCreating(false);
      setIsEditing(false);
      setModalOpen(false);
      setLoan(emptyLoan);
      setDefaultStatus('ON_CREATE');
    }
  };

  const expandedRowRender = (record: LoanType) => {
    return (
      <Table
        dataSource={record.tools}
        pagination={false}
        rowKey="id"
        columns={[
          {
            title: 'Herramienta',
            dataIndex: 'toolName',
            key: 'toolName',
          },
          {
            title: 'Pedidos',
            dataIndex: 'requested',
            key: 'requested',
            align: 'center',
          },
          {
            title: 'Prestados',
            dataIndex: 'loaned',
            key: 'loaned',
            align: 'center',
          },
          {
            title: 'Entregados',
            dataIndex: 'delivered',
            key: 'delivered',
            align: 'center',
          },
          {
            title: 'Dañados',
            dataIndex: 'damaged',
            key: 'damaged',
            align: 'center',
          },
          {
            title: 'Responsable',
            dataIndex: 'responsible',
            key: 'responsible',
            render: (responsible: { fullName: string }) => (
              <div>
                <div style={{ fontWeight: 500 }}>{responsible?.fullName}</div>
              </div>
            ),
          },
        ]}
        size="small"
      />
    );
  };

  const columns: ColumnsType<LoanType> = [
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
          ...(record.loanStatus === 'ORDER'
            ? [{
              key: '2',
              label: 'Eliminar',
              icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
            }]
            : [])
        ];

        return (
          <Dropdown
            trigger={['click']}
            menu={{
              items,
              onClick: ({ key }) => {
                if (key === '1') handleEdit(record);
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
      title: 'Docente',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (teacher: { fullName: string }) => (
        <div>
          <div style={{ fontWeight: 500 }}>{teacher?.fullName}</div>
        </div>
      ),
    },
    {
      title: 'Responsable',
      dataIndex: 'responsible',
      key: 'responsible',
      render: (responsible: { fullName: string }) => (
        <div>
          <div style={{ fontWeight: 500 }}>{responsible?.fullName}</div>
        </div>
      ),
    },
    {
      title: 'Fecha de Vencimiento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      sorter: true,
    },
    {
      title: 'Fecha de Entrega',
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      sorter: true,
    },
    {
      title: 'Devuelto',
      dataIndex: 'returned',
      key: 'returned',
      align: 'center',
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'volcano'}>
          {value ? 'SI' : 'NO'}
        </Tag>
      ),
    },
    {
      title: "Estado de Préstamo",
      dataIndex: 'loanStatus',
      key: 'loanStatus',
      align: 'center',
      render: (loanStatus: string) => {
        return <LoanStatusTag status={loanStatus} />;
      }
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Tag color={record.status ? 'success' : 'error'}>
          {record.status ? 'ACTIVO' : 'INACTIVO'}
        </Tag>
      ),
    },
  ];


  return (
    <div style={{ padding: '24px' }} className='overflow-x-auto'>
      <h1 className='h3 mb-3 text-gray-800'>Préstamos</h1>
      <LoanFilters
        isAdmin={isAdmin}
        teachers={teachers}
        responsibles={students}
        teacher={teacherName}
        responsible={responsibleName}
        dueDate={dueDate}
        loanStatus={loanStatus}
        tools={tools}
        selectedTools={selectedTools}
        onToolChange={setSelectedTools}
        onTeacherChange={setTeacherName}
        onResponsibleChange={setResponsibleName}
        onDueDateChange={(_, dateString) =>
          setDueDate(typeof dateString === 'string' ? dateString : null)
        }
        onLoanStatusChange={setLoanStatus}
        onCreateClick={() => {
          setModalOpen(true);
          setIsCreating(true);
          setLoan({
            ...emptyLoan,
            teacherId: teachers.find((teacher) => teacher.username === auth.user?.id)?.id || null,
          })
        }}
      />
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        expandable={{
          expandedRowRender,
          rowExpandable: (record) => record.tools.length > 0,
        }}
        rowKey="id"
      />
      <LoanFormModal
        teachers={teachers}
        students={students}
        tools={tools}
        isAdmin={isAdmin}
        isCreating={isCreating}
        status={defaultStatus}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setLoan(emptyLoan);
          setIsCreating(false);
          setIsEditing(false);
          setDefaultStatus('ON_CREATE');
        }}
        onSubmit={handleSubmit}
        title={isCreating ? 'Crear Préstamo' : 'Editar Préstamo'}
        initialValues={loan}
      />
    </div>
  );
};

export default LoansPage;
