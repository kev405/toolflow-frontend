import React from 'react';
import { Tag } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

interface TransferStatusTagProps {
  status?: 'PENDING' | 'ACCEPTED' | 'CANCELLED';
}

const TransferStatusTag: React.FC<TransferStatusTagProps> = ({ status = 'PENDING' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'warning',
          icon: <ClockCircleOutlined />,
          text: 'PENDIENTE'
        };
      case 'ACCEPTED':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'ACEPTADO'
        };
      case 'CANCELLED':
        return {
          color: 'error',
          icon: <CloseCircleOutlined />,
          text: 'CANCELADO'
        };
      default:
        return {
          color: 'default',
          icon: <ClockCircleOutlined />,
          text: 'PENDIENTE'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Tag color={config.color} icon={config.icon}>
      {config.text}
    </Tag>
  );
};

export default TransferStatusTag; 