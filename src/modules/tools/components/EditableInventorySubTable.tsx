import React, { useEffect, useState } from 'react';
import { Table, InputNumber, Form, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
	EditOutlined,
	CloseOutlined,
	SaveOutlined,
} from '@ant-design/icons';
import { InventoryType } from '../pages/ToolsPage';

interface EditableInventorySubTableProps {
	inventories: InventoryType[];
	onChange?: (updated: InventoryType[]) => void;
	onSaveRow?: (updatedRow: InventoryType) => Promise<{ success: boolean; error?: string } | void>;
}

export const EditableInventorySubTable: React.FC<EditableInventorySubTableProps> = ({
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

	const isEditing = (record: InventoryType) => record.id === editingKey;

	const startEdit = (record: InventoryType) => {
		setEditingKey(record.id);
	};

	const cancelEdit = () => {
		setEditingData(inventories);
		setEditingKey(null);
	};

	const saveEdit = async (id: number) => {
		const row = editingData.find(item => item.id === id);
		if (!row) return;

		const previousData = inventories;

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
			setEditingData(previousData);
			setEditingKey(null);
		}
	};


	const handleValueChange = (id: number, field: keyof InventoryType, value: number) => {
		const newData = editingData.map(inv =>
			inv.id === id ? { ...inv, [field]: value } : inv
		);
		setEditingData(newData);
	};

	const columns: ColumnsType<InventoryType> = [
		{
			title: 'Sede',
			dataIndex: 'name',
			key: 'name',
		},
		{
			title: 'Cantidad',
			dataIndex: 'quantity',
			render: (_, record) => record.available + record.onLoan + record.damaged,
		},
		{
			title: 'Disponible',
			dataIndex: 'available',
			key: 'available',
			render: (value, record) =>
				isEditing(record) ? (
					<InputNumber
						min={0}
						value={record.available}
						onChange={(val) => handleValueChange(record.id, 'available', val ?? 0)}
					/>
				) : (
					value
				),
		},
		{
			title: 'En Préstamo',
			dataIndex: 'onLoan',
			key: 'onLoan',
			render: (value, record) =>
				isEditing(record) ? (
					record.consumable ? (
						value
					) : (
						<InputNumber
							min={0}
							value={record.onLoan}
							onChange={(val) => handleValueChange(record.id, 'onLoan', val ?? 0)}
						/>
					)
				) : (
					value
				),
		},
		{
			title: 'Averiado',
			dataIndex: 'damaged',
			key: 'damaged',
			render: (value, record) =>
				isEditing(record) ? (
					record.consumable ? (
						value
					) : (
						<InputNumber
							min={0}
							value={record.damaged}
							onChange={(val) => handleValueChange(record.id, 'damaged', val ?? 0)}
						/>
					)
				) : (
					value
				),
		},
		{
			title: '',
			key: 'actions',
			width: 90,
			render: (_, record) =>
				isEditing(record) ? (
					<Space>
						<Button
							icon={<SaveOutlined />}
							style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
							type="primary"
							onClick={() => saveEdit(record.id)}
						/>
						<Button
							icon={<CloseOutlined />}
							danger
							onClick={cancelEdit}
						/>
					</Space>
				) : (
					<Button
						icon={<EditOutlined />}
						onClick={() => startEdit(record)}
					/>
				),
		},
	];

	return (
		<Form form={form} component={false}>
			<Table
				columns={columns}
				dataSource={editingData}
				pagination={false}
				rowKey="id"
			/>
		</Form>
	);
};

