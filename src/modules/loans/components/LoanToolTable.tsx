import React from 'react';
import { Table, InputNumber, Input, Tag, Form, Tooltip, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { FormInstance } from 'antd';

interface ToolDataRow {
  id: number;
  toolName: string;
  available: number;
  consumable: boolean;
  requested?: number;
  loaned?: number;
  delivered?: number;
  damaged?: number;
  originalLoaned?: number;
  notes?: string;
}

interface LoanToolTableProps {
  form: FormInstance;
  toolsData: ToolDataRow[];
  isAdmin?: boolean;
  isCreating?: boolean;
  loanStatus?: string;
  isCancelled?: boolean;
  teachers: { id: number; name: string }[];
}

export const LoanToolTable: React.FC<LoanToolTableProps> = ({ form, toolsData, isAdmin, isCreating, teachers, loanStatus, isCancelled }) => {
  const columns: ColumnsType<ToolDataRow> = [
    {
      title: 'Herramienta',
      dataIndex: 'toolName',
      key: 'toolName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>
            {record.consumable && (
              <Tooltip title="Consumible">
                <Tag color="green" style={{ marginRight: 8, marginBottom: 4, cursor: 'pointer' }}>
                  C
                </Tag>
              </Tooltip>
            )}
            {text}
          </div>
          <div style={{ marginTop: 4 }}>
            <Tag color="blue">Disponibles: {record.available}</Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Pedidos',
      dataIndex: 'requested',
      width: 80,
      render: (_, record) => (
        <Form.Item name={['tools', record.id.toString(), 'requested']} style={{ margin: 0 }} rules={[
          { required: true, message: 'Campo requerido' },
        ]}>
          <InputNumber
            min={0}
            max={
              record.available +
              (form.getFieldValue(['tools', record.id.toString(), 'requested']) || 0)
            }
            style={{ width: '100%' }}
            disabled={(isAdmin && !isCreating && form.getFieldValue(['tools', record.id.toString(), 'requested'])) || isCancelled}
          />
        </Form.Item>

      )
    },
    {
      title: 'Prestados',
      dataIndex: 'loaned',
      width: 80,
      render: (_, record) =>
        !isAdmin ? null : (
          <Form.Item name={['tools', record.id.toString(), 'loaned']} style={{ margin: 0 }}>
            <InputNumber
              min={0}
              max={(record.available ?? 0) + (record.originalLoaned ?? 0)}
              style={{ width: '100%' }}
              disabled={["FINALIZED", "MISSING_FINALIZED", "DAMAGED_FINALIZED", "MISSING_AND_DAMAGED_FINALIZED"].includes(loanStatus || '') || isCancelled}
            />
          </Form.Item>
        )
    },
    {
      title: 'Entregados',
      dataIndex: 'delivered',
      width: 80,
      render: (_, record) =>
        record.consumable || !isAdmin || isCreating ? null : (
          <Form.Item name={['tools', record.id.toString(), 'delivered']} style={{ margin: 0 }}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              max={form.getFieldValue(['tools', record.id.toString(), 'loaned']) || 0}
              disabled={isCancelled}
            />
          </Form.Item>
        )
    },
    {
      title: 'Dañados',
      dataIndex: 'damaged',
      width: 80,
      render: (_, record) =>
        record.consumable || !isAdmin || isCreating ? null : (
          <Form.Item name={['tools', record.id.toString(), 'damaged']} style={{ margin: 0 }}>
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              max={form.getFieldValue(['tools', record.id.toString(), 'delivered']) || 0}
              disabled={isCancelled}
            />
          </Form.Item>
        )
    },
    {
      title: 'Faltantes',
      key: 'missing',
      align: 'center',
      render: (_, record) => {
        if (record.consumable || !isAdmin || isCreating) return null;

        const loaned = form.getFieldValue(['tools', record.id.toString(), 'loaned']) || 0;
        const delivered = form.getFieldValue(['tools', record.id.toString(), 'delivered']) || 0;
        const missing = Math.max(0, loaned - delivered);

        return (
          <Tag color={missing > 0 ? 'red' : undefined} style={{ fontSize: '0.75rem', padding: '2px 6px' }}>
            {missing}
          </Tag>
        );
      }
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      render: (_, record) =>
        !isAdmin ? null : (
          <Form.Item name={['tools', record.id.toString(), 'notes']} style={{ margin: 0 }}>
            <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} disabled={isCancelled} />
          </Form.Item>
        )
    },
    {
      title: 'Responsable',
      key: 'responsible',
      dataIndex: 'responsible',
      width: 150,
      render: (_, record) => (
        <Form.Item name={['tools', record.id.toString(), 'responsibleId']} style={{ margin: 0 }}>
          <Select placeholder="Selecciona responsable" allowClear style={{ width: '100%' }} disabled={["FINALIZED", "MISSING_FINALIZED", "DAMAGED_FINALIZED", "MISSING_AND_DAMAGED_FINALIZED"].includes(loanStatus || '') || isCancelled}>
            {teachers.map((teacher) => (
              <Select.Option key={teacher.id} value={teacher.id}>
                {teacher.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      )
    }
  ];

  return (
    <Table
      columns={columns.filter(Boolean)}
      dataSource={toolsData}
      rowKey="id"
      pagination={false}
      scroll={{ x: 'max-content' }}
      size="small"
      locale={{ emptyText: <div style={{ height: '1px' }} /> }}
      rowClassName={(record) => {
        if (!record?.id) return '';
        const responsible = form.getFieldValue(['tools', record.id.toString(), 'responsibleId']);
        return responsible ? 'row-with-responsible' : '';
      }}
    />
  );
};
