import React, { useEffect, useState } from 'react';
import { Table, InputNumber, Form, Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EditOutlined,
  CloseOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { VehiclePartInventoryType } from '../pages/VehiclePartsPage';

interface EditableVehiclePartInventorySubTableProps {
  inventories: VehiclePartInventoryType[];
  onChange?: (updated: VehiclePartInventoryType[]) => void;
  onSaveRow?: (row: VehiclePartInventoryType) => Promise<{ success: boolean; error?: string }>;
}

export const EditableInventorySubTable: React.FC<EditableVehiclePartInventorySubTableProps> = ({
  inventories,
  onChange,
  onSaveRow,
}) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState<number | null>(null);
  const [editingData, setEditingData] = useState(inventories);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditingData(inventories);
  }, [inventories]);

  const isEditing = (record: VehiclePartInventoryType) => record.headquarterId === editingKey;

  const startEdit = (record: VehiclePartInventoryType) => {
    setEditingKey(record.headquarterId);
    form.setFieldsValue({
      quantity: record.quantity,
    });
  };

  const cancelEdit = () => {
    setEditingData(inventories);
    setEditingKey(null);
    form.resetFields();
  };

  const saveEdit = async (headquarterId: number) => {
    try {
      const values = await form.validateFields();
      const row = editingData.find(item => item.headquarterId === headquarterId);
      if (!row) return;

      const updatedRow = { ...row, quantity: values.quantity };
      setLoading(true);      if (onSaveRow) {
        const result = await onSaveRow(updatedRow);
        if (result.success) {
          const newData = editingData.map(item =>
            item.headquarterId === headquarterId ? updatedRow : item
          );
          setEditingData(newData);
          onChange?.(newData);
          setEditingKey(null);
          form.resetFields();
          // Success message is handled by parent component
        } else {
          message.error(result.error || 'Error al actualizar inventario');
        }
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value: number | null, headquarterId: number) => {
    if (value === null) return;
    const newData = editingData.map(item =>
      item.headquarterId === headquarterId
        ? { ...item, quantity: value }
        : item
    );
    setEditingData(newData);
  };

  const columns: ColumnsType<VehiclePartInventoryType> = [
    {
      title: 'Sede',
      dataIndex: 'headquarterName',
      key: 'headquarterName',
      width: '40%',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      width: '40%',
      render: (value: number, record: VehiclePartInventoryType) => {
        if (isEditing(record)) {
          return (
            <Form.Item
              name="quantity"
              style={{ margin: 0 }}
              rules={[
                { required: true, message: 'La cantidad es requerida' },
                { type: 'number', min: 0, message: 'La cantidad debe ser un número positivo' },
              ]}
            >
              <InputNumber
                min={0}
                precision={0}
                style={{ width: '100%' }}
                onChange={(val) => handleQuantityChange(val, record.headquarterId)}
              />
            </Form.Item>
          );
        }
        return value;
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: '20%',
      render: (_, record: VehiclePartInventoryType) => {
        if (isEditing(record)) {
          return (
            <Space size="small">
              <Button
                type="link"
                icon={<SaveOutlined />}
                onClick={() => saveEdit(record.headquarterId)}
                loading={loading}
                size="small"
              >
                Guardar
              </Button>
              <Button
                type="link"
                icon={<CloseOutlined />}
                onClick={cancelEdit}
                size="small"
                disabled={loading}
              >
                Cancelar
              </Button>
            </Space>
          );
        }

        return (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => startEdit(record)}
            size="small"
          >
            Editar
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ margin: '16px 0' }}>
      <h4 style={{ marginBottom: 16 }}>Inventario por Sede</h4>
      <Form form={form}>
        <Table
          columns={columns}
          dataSource={editingData}
          rowKey="headquarterId"
          pagination={false}
          size="small"
        />
      </Form>
    </div>
  );
};
