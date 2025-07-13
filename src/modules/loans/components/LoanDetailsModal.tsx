import React from 'react';
import { Modal, Descriptions, Divider, Table, Tag } from 'antd';
import dayjs from 'dayjs';
import { LoanStatusTag } from './LoanStatusTag';
import { LoanType } from '../pages/LoansPage';

interface LoanDetailsModalProps {
  open: boolean;
  onClose: () => void;
  loan: LoanType | null;
}

const formatDate = (date?: string | null) =>
  date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—';

const LoanDetailsModal: React.FC<LoanDetailsModalProps> = ({
  open,
  onClose,
  loan,
}) => {
  if (!loan) return null;
  const toolColumns = [
    {
      title: 'Herramienta',
      dataIndex: 'toolName',
      key: 'toolName',
    },
    {
      title: 'Pedidos',
      dataIndex: 'requested',
      key: 'requested',
      align: 'center' as const,
    },
    {
      title: 'Prestados',
      dataIndex: 'loaned',
      key: 'loaned',
      align: 'center' as const,
    },
    {
      title: 'Entregados',
      dataIndex: 'delivered',
      key: 'delivered',
      align: 'center' as const,
    },
    {
      title: 'Dañados',
      dataIndex: 'damaged',
      key: 'damaged',
      align: 'center' as const,
    },
    {
      title: 'Responsable',
      dataIndex: 'responsible',
      key: 'responsible',
      render: (resp: { fullName: string } | undefined) => resp?.fullName || '—',
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes?: string) => notes || '—',
    },
  ];

  return (
    <Modal
      open={open}
      title="Detalles del Préstamo"
      onCancel={onClose}
      footer={null}
      width={900}
      centered
    >
      <Descriptions
        bordered
        column={2}
        size="small"
        style={{ marginBottom: 16 }}
        labelStyle={{ width: 170 }}
      >
        <Descriptions.Item label="ID">{loan.id}</Descriptions.Item>
        <Descriptions.Item label="Estado">
          <LoanStatusTag status={loan.loanStatus} />
        </Descriptions.Item>
        <Descriptions.Item label="Docente">
          {loan.teacher.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Responsable">
          {loan.responsible.fullName}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de Vencimiento">
          {formatDate(loan.dueDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de Entrega">
          {formatDate(loan.receivedDate)}
        </Descriptions.Item>
        <Descriptions.Item label="Devuelto">
          <Tag color={loan.returned ? 'green' : 'volcano'}>
            {loan.returned ? 'Sí' : 'No'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Notas" span={2}>
          {loan.tools.every(t => !t.notes) ? 'Sin notas' : 'Ver tabla ↓'}
        </Descriptions.Item>
      </Descriptions>
      {loan.tools.length > 0 && (
        <>
          <Divider orientation="left">Herramientas Asociadas</Divider>
          <Table
            columns={toolColumns}
            dataSource={loan.tools}
            pagination={false}
            rowKey="id"
            size="small"
            scroll={{ y: 240 }}
          />
        </>
      )}
    </Modal>
  );
};

export default LoanDetailsModal;
