import React, { useEffect, useState } from 'react';
import { Table, InputNumber, Form, Button, Space } from 'antd';
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

	useEffect(() => {
		setEditingData(inventories);
	}, [inventories]);

	const isEditing = (record: VehiclePartInventoryType) => record.id === editingKey;

	const startEdit = (record: VehiclePartInventoryType) => {
		setEditingKey(record.id);
	};

	const cancelEdit = () => {
		setEditingData(inventories);
		setEditingKey(null);
	};

	const saveEdit = async (id: number) => {
		const row = editingData.find(item => item.id === id);
		if (!row) return;
	
		try {
			if (onSaveRow) {
				const result = await onSaveRow(row);
				if (result?.success === false) {
					throw new Error(result.error || 'Error al guardar');
				}
			}
	
			onChange?.(editingData);
			setEditingKey(null);
		} catch (error) {
			console.error('Fallo al guardar:', error);
			setEditingData(inventories);
			setEditingKey(null);
		}
	};

	const handleValueChange = (id: number, field: keyof VehiclePartInventoryType, value: number) => {
		const newData = editingData.map(inv =>
			inv.id === id ? { ...inv, [field]: value } : inv
		);
		setEditingData(newData);
	};
	const columns: ColumnsType<VehiclePartInventoryType> = [
		{
			title: 'Sede',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Cantidad',
			dataIndex: 'quantity',
			key: 'quantity',
			render: (value, record) =>
				isEditing(record) ? (
					<InputNumber
						min={1}
						value={record.quantity}
						onChange={(val) => handleValueChange(record.id, 'quantity', val ?? 1)}
						placeholder="Cantidad"
					/>
				) : (
					<span style={{ fontWeight: 'bold' }}>{value}</span>
				),
		},
		{
			title: 'Acciones',
			key: 'actions',
			width: 120,
			render: (_, record) => {
				const editable = isEditing(record);
				return editable ? (
					<Space>
						<Button
							type="link"
							icon={<SaveOutlined />}
							onClick={() => saveEdit(record.id)}
							size="small"
						/>
						<Button
							type="link"
							icon={<CloseOutlined />}
							onClick={cancelEdit}
							size="small"
						/>
					</Space>
				) : (
					<Button
						type="link"
						icon={<EditOutlined />}
						onClick={() => startEdit(record)}
						size="small"
					/>
				);
			},
		},
	];

	return (
		<Form form={form} component={false}>
			<Table
				components={{
					body: {
						cell: (props: any) => (
							<td {...props} />
						),
					},
				}}
				bordered
				dataSource={editingData}
				columns={columns}
				rowKey="id"
				pagination={false}
				size="small"
			/>
		</Form>
	);
};
