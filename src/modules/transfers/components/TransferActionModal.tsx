import React from 'react';
import { Modal, Button, Typography, Space } from 'antd';
import { ExclamationCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface TransferActionModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'accept' | 'cancel';
  transferId: number;
  transferInfo?: string;
}

const TransferActionModal: React.FC<TransferActionModalProps> = ({
  open,
  onClose,
  onConfirm,
  action,
  transferId,
  transferInfo
}) => {
  const isAccept = action === 'accept';
  
  const getModalConfig = () => {
    if (isAccept) {
      return {
        title: 'Confirmar Aceptación de Traslado',
        icon: <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />,
        content: '¿Estás seguro de que deseas aceptar este traslado?',
        okText: 'Aceptar Traslado',
        okType: 'primary' as const,
        okButtonProps: { style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }
      };
    } else {
      return {
        title: 'Confirmar Cancelación de Traslado',
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />,
        content: '¿Estás seguro de que deseas cancelar este traslado?',
        okText: 'Cancelar Traslado',
        okType: 'primary' as const,
        okButtonProps: { danger: true }
      };
    }
  };

  const config = getModalConfig();

  return (
    <Modal
      open={open}
      title={
        <Space>
          {config.icon}
          <span>{config.title}</span>
        </Space>
      }
      onCancel={onClose}
      onOk={onConfirm}
      okText={config.okText}
      cancelText="Cancelar"
      okType={config.okType}
      okButtonProps={config.okButtonProps}
      centered
    >
      <div style={{ padding: '16px 0' }}>
        <Text>
          {config.content}
        </Text>
        {transferInfo && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
            <Text type="secondary">
              <strong>Traslado ID:</strong> {transferId}
            </Text>
            <br />
            <Text type="secondary">
              {transferInfo}
            </Text>
          </div>
        )}
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fff7e6', borderRadius: '6px', border: '1px solid #ffd591' }}>
          <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: '8px' }} />
          <Text type="warning">
            {isAccept 
              ? 'Esta acción confirmará la recepción de todos los ítems del traslado.'
              : 'Esta acción cancelará permanentemente el traslado y no se podrá deshacer.'
            }
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default TransferActionModal; 