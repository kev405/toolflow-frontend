import React, { useEffect, useState } from 'react';
import { Table, InputNumber, Form, Button, Space, Spin, message } from 'antd';
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
	onSaveRow?: (updatedRow: VehiclePartInventoryType) => Promise<{ success: boolean; error?: string } | void>;
}

export const EditableInventorySubTable: React.FC<EditableVehiclePartInventorySubTableProps> = ({
	inventories,
	onChange,
	onSaveRow,
}) => {
	const [form] = Form.useForm();
	const [editingKey, setEditingKey] = useState<number | null>(null);
	const [editingData, setEditingData] = useState(inventories);
	const [loading, setLoading] = useState<number | null>(null);

	useEffect(() => {
		setEditingData(inventories);
	}, [inventories]);

	const isEditing = (record: VehiclePartInventoryType) => record.headquarterId === editingKey;

	const startEdit = (record: VehiclePartInventoryType) => {
		setEditingKey(record.headquarterId);
		form.setFieldsValue({ quantity: record.quantity });
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
			setLoading(headquarterId);

			if (onSaveRow) {
				const result = await onSaveRow(updatedRow);
				if (result?.success === false) {
					throw new Error(result.error || 'Error al guardar');
				}
			}

			// Actualizar datos locales
			const newData = editingData.map(inv =>
				inv.headquarterId === headquarterId ? updatedRow : inv
			);
			setEditingData(newData);
			onChange?.(newData);
			setEditingKey(null);
			form.resetFields();
			message.success('Cantidad actualizada correctamente');
		} catch (error) {
			console.error('Fallo al guardar:', error);
			message.error('Error al actualizar la cantidad');
			setEditingData(inventories);
			setEditingKey(null);
			form.resetFields();
		} finally {
			setLoading(null);
		}
	};

	const handleValueChange = (value: number | null) => {
		form.setFieldsValue({ quantity: value || 0 });
	};

	const columns: ColumnsType<VehiclePartInventoryType> = [
		{
			title: 'Sede',
			dataIndex: 'headquarterName',
			key: 'headquarterName',
			width: '50%',
		},
		{
			title: 'Cantidad',
			dataIndex: 'quantity',
			key: 'quantity',
			width: '30%',
			render: (value, record) =>
				isEditing(record) ? (
					<Form form={form}>
						<Form.Item
							name="quantity"
							style={{ margin: 0 }}
							rules={[
								{ required: true, message: 'Cantidad requerida' },
								{ type: 'number', min: 0, message: 'La cantidad debe ser mayor o igual a 0' },
							]}
						>
							<InputNumber
								min={0}
								style={{ width: '100%' }}
								onChange={handleValueChange}
								parser={(value) => value ? parseInt(value.replace(/\D/g, ''), 10) : 0}
								formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
							/>
						</Form.Item>
					</Form>
				) : (
					<span style={{ fontWeight: 'bold' }}>{value?.toLocaleString() || 0}</span>
				),
		},
		{
			title: 'Acciones',
			key: 'actions',
			width: '20%',
			render: (_, record) => {
				const editable = isEditing(record);
				const isLoading = loading === record.headquarterId;
				
				return editable ? (
					<Space>
						<Button
							type="link"
							icon={isLoading ? <Spin size="small" /> : <SaveOutlined />}
							onClick={() => saveEdit(record.headquarterId)}
							size="small"
							disabled={isLoading}
						>
							{isLoading ? 'Guardando...' : 'Guardar'}
						</Button>
						<Button
							type="link"
							icon={<CloseOutlined />}
							onClick={cancelEdit}
							size="small"
							disabled={isLoading}
						>
							Cancelar
						</Button>
					</Space>
				) : (
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
		<div style={{ padding: '16px', backgroundColor: '#fafafa' }}>
			<h4 style={{ marginBottom: '16px', color: '#1890ff' }}>
				<i className="fas fa-warehouse" style={{ marginRight: 8 }} />
				Inventario por Sede
			</h4>
			<Table
				components={{
					body: {
						cell: (props: any) => <td {...props} />,
					},
				}}
				bordered
				dataSource={editingData}
				columns={columns}
				rowKey="headquarterId"
				pagination={false}
				size="small"
				style={{ backgroundColor: 'white' }}
			/>
		</div>
	);
};
