import React from 'react';
import { Tag } from 'antd';

interface LoanStatusTagProps {
  status?: string;
}

export const statusColors: Record<string, string> = {
  ON_CREATE: 'default',
  ORDER: 'blue',
  ON_LOAN: 'orange',
  FINALIZED: 'green',
  MISSING_FINALIZED: 'red',
  DAMAGED_FINALIZED: 'volcano',
  MISSING_AND_DAMAGED_FINALIZED: 'magenta',
  CANCELLED: 'gray',
  OVERDUE: 'gold'
};

export const labelMap: Record<string, string> = {
  ON_CREATE: 'EN CREACIÓN',
  ORDER: 'PEDIDO',
  ON_LOAN: 'EN PRESTAMO',
  FINALIZED: 'FINALIZADO',
  MISSING_FINALIZED: 'FINALIZADO CON FALTANTES',
  DAMAGED_FINALIZED: 'FINALIZADO CON DAÑOS',
  MISSING_AND_DAMAGED_FINALIZED: 'FINALIZADO CON FALTANTES Y DAÑOS',
  CANCELLED: 'CANCELADO',
  OVERDUE: 'ATRASADO',
};

export const LoanStatusTag: React.FC<LoanStatusTagProps> = ({ status }) => {
  if (!status) return null;

  const color = statusColors[status] || 'default';
  const label = labelMap[status] || status;

  return (
    <div>
      <Tag color={color}>
        <b>{label}</b>
      </Tag>
    </div>
  );
};
