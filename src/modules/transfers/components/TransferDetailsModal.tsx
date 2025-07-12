import React from 'react';
import { Modal, Descriptions, Divider, Table } from 'antd';
import { TransferType } from '../pages/TransfersPage';
import TransferStatusTag from './TransferStatusTag';

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

interface TransferDetailsModalProps {
  open: boolean;
  onClose: () => void;
  transfer: TransferType | null;
}

const TransferDetailsModal: React.FC<TransferDetailsModalProps> = ({
  open,
  onClose,
  transfer
}) => {
  if (!transfer) return null;

  const toolColumns = [
    {
      title: 'Nombre',
      dataIndex: 'toolName',
      key: 'toolName',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
  ];

  const partColumns = [
    {
      title: 'Nombre',
      dataIndex: 'partName',
      key: 'partName',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
    },
  ];

  const vehicleColumns = [
    {
      title: 'Placa',
      dataIndex: 'plate',
      key: 'plate',
      render: (plate: string | null) => plate || 'Sin placa',
    },
    {
      title: 'Modelo',
      dataIndex: 'model',
      key: 'model',
      render: (model: string | null) => model || 'Sin modelo',
    },
  ];

  return (
    <Modal
      open={open}
      title="Detalles del Traslado"
      onCancel={onClose}
      footer={null}
      width={800}
      centered
    >
      <Descriptions
        bordered
        column={2}
        size="small"
        style={{ marginBottom: 16 }}
        labelStyle={{ width: 150 }}
      >
        <Descriptions.Item label="ID">{transfer.id}</Descriptions.Item>
        <Descriptions.Item label="Responsable">
          {transfer.responsible.username}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de Traslado">
          {formatDate(transfer.transferDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Origen">
          {transfer.originHeadquarter.name}
        </Descriptions.Item>
        <Descriptions.Item label="Destino">
          {transfer.destinationHeadquarter.name}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de Creación">
          {formatDate(transfer.createdAt)}
        </Descriptions.Item>
        <Descriptions.Item label="Estado">
          <TransferStatusTag status={transfer.transferStatus} />
        </Descriptions.Item>
        <Descriptions.Item label="Notas" span={2}>
          {transfer.notes || 'Sin notas'}
        </Descriptions.Item>
      </Descriptions>

      {transfer.tools.length > 0 && (
        <>
          <Divider orientation="left">Herramientas</Divider>
          <Table
            columns={toolColumns}
            dataSource={transfer.tools}
            pagination={false}
            rowKey="toolId"
            size="small"
          />
        </>
      )}

      {transfer.vehicleParts.length > 0 && (
        <>
          <Divider orientation="left">Partes de Vehículo</Divider>
          <Table
            columns={partColumns}
            dataSource={transfer.vehicleParts}
            pagination={false}
            rowKey="partId"
            size="small"
          />
        </>
      )}

      {transfer.vehicles.length > 0 && (
        <>
          <Divider orientation="left">Vehículos</Divider>
          <Table
            columns={vehicleColumns}
            dataSource={transfer.vehicles}
            pagination={false}
            rowKey="vehicleId"
            size="small"
          />
        </>
      )}
    </Modal>
  );
};

export default TransferDetailsModal; 