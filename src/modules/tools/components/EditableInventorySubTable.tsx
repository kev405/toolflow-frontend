import React, { useEffect, useState } from 'react';
import {
	Table,
	InputNumber,
	Form,
	Button,
	Space,
	Typography,
	theme,           // 🎨 ← nuevo
} from 'antd';
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

	const { token } = theme.useToken();     // colorPrimario dinámico

	useEffect(() => {
		setEditingData(inventories);
	}, [inventories]);

	const isEditing = (record: InventoryType) => record.id === editingKey;

	const startEdit = (record: InventoryType) => setEditingKey(record.id);
	const cancelEdit = () => {
		setEditingData(inventories);
		setEditingKey(null);
	};

	const saveEdit = async (id: number) => {
		const row = editingData.find(item => item.id === id);
		if (!row) return;

		const previous = inventories;
		try {
			if (onSaveRow) {
				const result = await onSaveRow(row);
				if (result?.success === false) throw new Error(result.error);
			}
			onChange?.(editingData);
			setEditingKey(null);
		} catch (e) {
			console.error('Fallo al guardar:', e);
			setEditingData(previous);
			setEditingKey(null);
		}
	};

	const handleValueChange = (id: number, field: keyof InventoryType, value: number) => {
		setEditingData(prev =>
			prev.map(inv => (inv.id === id ? { ...inv, [field]: value } : inv)),
		);
	};

	const columns: ColumnsType<InventoryType> = [
		{
			title: 'Sede',
			dataIndex: 'name',
			key: 'name',
			width: '42%',
		},
		{
			title: 'Cantidad',
			dataIndex: 'quantity',
			width: '13%',
			render: (_, r) => r.available + r.onLoan + r.damaged,
		},
		{
			title: 'Disponible',
			dataIndex: 'available',
			width: '15%',
			render: (v, r) =>
				isEditing(r) ? (
					<InputNumber
						min={0}
						value={r.available}
						onChange={val => handleValueChange(r.id, 'available', val ?? 0)}
					/>
				) : (
					v
				),
		},
		{
			title: 'En Préstamo',
			dataIndex: 'onLoan',
			width: '15%',
			render: (v, r) =>
				isEditing(r) ? (
					r.consumable ? (
						v
					) : (
						<InputNumber
							min={0}
							value={r.onLoan}
							onChange={val => handleValueChange(r.id, 'onLoan', val ?? 0)}
						/>
					)
				) : (
					v
				),
		},
		{
			title: 'Averiado',
			dataIndex: 'damaged',
			width: '15%',
			render: (v, r) =>
				isEditing(r) ? (
					r.consumable ? (
						v
					) : (
						<InputNumber
							min={0}
							value={r.damaged}
							onChange={val => handleValueChange(r.id, 'damaged', val ?? 0)}
						/>
					)
				) : (
					v
				),
		},
		{
			title: '',
			key: 'actions',
			width: 90,
			render: (_, r) =>
				isEditing(r) ? (
					<Space>
						<Button
							icon={<SaveOutlined />}
							type="primary"
							style={{ background: '#26B857', borderColor: '#26B857' }}
							onClick={() => saveEdit(r.id)}
						/>
						<Button icon={<CloseOutlined />} danger onClick={cancelEdit} />
					</Space>
				) : (
					<Button icon={<EditOutlined />} onClick={() => startEdit(r)} />
				),
		},
	];

	return (
		<div style={{ padding: 16, background: '#fafafa' }}>
			<Typography.Title
				level={5}
				style={{
					margin: '0 0 12px',
					color: token.colorPrimary,
					fontWeight: 600,
					fontSize: 14,
				}}
			>
				<i className="fas fa-tools" style={{ marginRight: 8 }} />
				Inventario&nbsp;por&nbsp;Sede
			</Typography.Title>

			<Form form={form} component={false}>
				<Table
					bordered
					size="small"
					style={{ background: '#fff' }}
					columns={columns}
					dataSource={editingData}
					pagination={false}
					rowKey="id"
				/>
			</Form>
		</div>
	);
};
