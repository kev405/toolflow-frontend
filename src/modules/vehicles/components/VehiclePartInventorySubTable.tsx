import React, { useEffect, useMemo, useState } from 'react';
import {
	Table,
	InputNumber,
	Form,
	Button,
	Space,
	Spin,
	message,
	Typography,
	theme,
	Modal,
	Select,
	Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
	EditOutlined,
	CloseOutlined,
	SaveOutlined,
	LinkOutlined,
	DisconnectOutlined,
} from '@ant-design/icons';
import { VehiclePartInventoryType, VehiclePartType } from '../pages/VehiclePartsPage';

interface EditableVehiclePartInventorySubTableProps {
	vehiclePart: VehiclePartType;
	inventories: VehiclePartInventoryType[];
	vehicles: { id: number; name: string; vehicleType?: string; headquarterId: number }[];
	onChange?: (updated: VehiclePartInventoryType[]) => void;
	onSaveRow?: (updatedRow: VehiclePartInventoryType) => Promise<{ success: boolean; error?: string } | void>;
	onAssociate?: (
		partId: number,
		headquarterId: number,
		vehicleId: number | null,
		quantity: number
	) => Promise<{ success: boolean; error?: string }>;
	onDisassociate?: (
		partId: number,
		headquarterId: number,
		vehicleId: number | null,
		quantity: number
	) => Promise<{ success: boolean; error?: string }>;
}

export const EditableInventorySubTable: React.FC<EditableVehiclePartInventorySubTableProps> = ({
	vehiclePart,
	inventories,
	vehicles,
	onChange,
	onSaveRow,
	onAssociate,
	onDisassociate,
}) => {
	const [form] = Form.useForm();
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [tableData, setTableData] = useState(inventories);
	const [rowLoading, setRowLoading] = useState<string | null>(null);

	const [modalOpen, setModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<'associate' | 'disassociate'>('associate');
	const [currentInv, setCurrentInv] = useState<VehiclePartInventoryType | null>(null);
	const [currentVeh, setCurrentVeh] = useState<number | null>(null);
	const [transferQty, setTransferQty] = useState<number>(1);
	const [modalBusyId, setModalBusyId] = useState<number | null>(null);

	const { token } = theme.useToken();

	useEffect(() => { setTableData(inventories); }, [inventories]);

	const isEditing = (rec: VehiclePartInventoryType) =>
		editingKey === rowKey(rec);

	const filteredVehicles = useMemo(() => {
		if (!currentInv) return [];
		return vehicles.filter(
			v =>
				v.vehicleType === vehiclePart.vehicleType &&
				v.headquarterId === currentInv.headquarterId
		);
	}, [vehicles, vehiclePart.vehicleType, currentInv]);

	const startEdit = (rec: VehiclePartInventoryType) => {
		setEditingKey(rowKey(rec));
		form.setFieldsValue({ quantity: rec.quantity });
	};

	const cancelEdit = () => {
		setEditingKey(null);
		form.resetFields();
	};

	const saveEdit = async (rec: VehiclePartInventoryType) => {
		try {
			const { quantity } = await form.validateFields();
			const updated = { ...rec, quantity };
			setRowLoading(rowKey(rec));

			const res = await onSaveRow?.(updated);
			if (res?.success === false) throw new Error(res.error);

			const newData = tableData.map(r =>
				rowKey(r) === rowKey(rec) ? updated : r
			);
			setTableData(newData);
			onChange?.(newData);
			cancelEdit();
			message.success('Cantidad actualizada');
		} catch (err) {
			message.error((err as Error).message || 'Error al actualizar');
		} finally {
			setRowLoading(null);
		}
	};

	const openModal = (
		mode: 'associate' | 'disassociate',
		inv: VehiclePartInventoryType
	) => {
		setModalMode(mode);
		setCurrentInv(inv);
		setCurrentVeh(mode === 'associate' ? null : inv.vehicleId);
		setTransferQty(1);
		setModalOpen(true);
	};

	const columns: ColumnsType<VehiclePartInventoryType> = [
		{
			title: 'Sede',
			dataIndex: 'headquarterName',
			width: '45%',
		},
		{
			title: 'Cantidad',
			dataIndex: 'quantity',
			width: '20%',
			render: (val, rec) =>
				isEditing(rec) ? (
					<Form form={form}>
						<Form.Item
							name="quantity"
							style={{ margin: 0 }}
							rules={[
								{ required: true, message: 'Requerido' },
								{ type: 'number', min: 0, message: '≥ 0' },
							]}
						>
							<InputNumber style={{ width: '100%' }} />
						</Form.Item>
					</Form>
				) : (
					val.toLocaleString()
				),
		},
		{
			title: 'Vehículo',
			dataIndex: 'vehicleId',
			width: '20%',
			render: (_id, rec) => {
				if (!rec.vehicleId) return <Tag color="default">Sin asociar</Tag>;
				const v = vehicles.find(x => x.id === rec.vehicleId);
				return (
					<span>
						<i className={`fas fa-${v?.vehicleType || 'car'}`} style={{ marginRight: 6 }} />
						{v ? v.name : `ID ${rec.vehicleId}`}
					</span>
				);
			},
		},
		{
			title: 'Acciones',
			key: 'act',
			width: '15%',
			render: (_, rec) => {
				const editable = isEditing(rec);
				const busyRow = rowLoading === String(rec.headquarterId);
				const busyModal = modalBusyId === rec.headquarterId;
				const hasStock = rec.quantity > 0;

				if (editable) {
					return (
						<Space>
							<Button
								icon={busyRow ? <Spin size="small" /> : <SaveOutlined />}
								type="primary"
								style={{ background: '#26B857', borderColor: '#26B857' }}
								onClick={() => saveEdit(rec)}
								disabled={busyRow}
							/>
							<Button icon={<CloseOutlined />} danger onClick={cancelEdit} disabled={busyRow} />
						</Space>
					);
				}

				return (
					<Space>
						<Button icon={<EditOutlined />} onClick={() => startEdit(rec)} />
						{hasStock && !rec.vehicleId && (
							<Button
								icon={<LinkOutlined />}
								loading={busyModal}
								onClick={() => openModal('associate', rec)}
							/>
						)}
						{hasStock && rec.vehicleId && (
							<Button
								icon={<DisconnectOutlined />}
								danger
								loading={busyModal}
								onClick={() => openModal('disassociate', rec)}
							/>
						)}
					</Space>
				);
			},
		},
	];

	const rowKey = (inv: VehiclePartInventoryType) =>
		`${inv.headquarterId}-${inv.vehicleId ?? 'none'}`;

	return (
		<div style={{ padding: 16, background: '#fafafa' }}>
			<Typography.Title level={5} style={{ margin: '0 0 12px', color: token.colorPrimary }}>
				<i className="fas fa-warehouse" style={{ marginRight: 8 }} />
				Inventario&nbsp;por&nbsp;Sede
			</Typography.Title>

			<Table
				bordered
				size="small"
				pagination={false}
				rowKey={rowKey}
				columns={columns}
				dataSource={tableData}
				style={{ background: '#fff' }}
			/>
			<Modal
				open={modalOpen}
				title={modalMode === 'associate' ? 'Asociar a vehículo' : 'Desasociar de vehículo'}
				okText={modalMode === 'associate' ? 'Asociar' : 'Desasociar'}
				onCancel={() => setModalOpen(false)}
				confirmLoading={modalBusyId !== null}
				okButtonProps={{
					disabled: modalMode === 'associate' && currentVeh == null,
				}}
				onOk={async () => {
					if (!currentInv) return;

					const maxQty = currentInv.quantity;
					if (transferQty <= 0 || transferQty > maxQty) {
						message.warning(`Cantidad inválida (1-${maxQty})`);
						return;
					}

					setModalBusyId(currentInv.headquarterId);
					try {
						const fn =
							modalMode === 'associate' ? onAssociate : onDisassociate;
						const res = await fn?.(
							vehiclePart.id,
							currentInv.headquarterId,
							modalMode === 'associate' ? currentVeh : currentInv.vehicleId,
							transferQty
						);
						if (res?.success === false) throw new Error(res.error);
					} catch (err) {
						message.error(
							(err as Error).message ||
							(modalMode === 'associate' ? 'Error al asociar' : 'Error al desasociar')
						);
					} finally {
						setModalBusyId(null);
						setModalOpen(false);
					}
				}}
			>
				<Space direction="vertical" style={{ width: '100%' }}>
					{modalMode === 'associate' && (
						<Select
							placeholder="Selecciona vehículo"
							value={currentVeh ?? undefined}
							onChange={setCurrentVeh}
							style={{ width: '100%' }}
							showSearch
							optionFilterProp="children"
						>
							{filteredVehicles.map(v => (
								<Select.Option key={v.id} value={v.id}>
									<i
										className={`fas fa-${v.vehicleType || 'car'}`}
										style={{ marginRight: 8 }}
									/>
									{v.name}
								</Select.Option>
							))}
						</Select>
					)}

					<InputNumber
						min={1}
						max={currentInv?.quantity ?? 1}
						value={transferQty}
						onChange={val => setTransferQty(val ?? 1)}
						style={{ width: '100%' }}
						placeholder={`Máx. ${currentInv?.quantity ?? 0}`}
					/>
				</Space>
			</Modal>
		</div>
	);
};
