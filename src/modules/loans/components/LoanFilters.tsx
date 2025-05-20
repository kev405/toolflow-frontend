import React from 'react';
import { Button, Select, DatePicker, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { labelMap, LoanStatusTag } from './LoanStatusTag';

const { Option } = Select;

interface LoanFiltersProps {
  isAdmin: boolean;
  teachers: { id: number; name: string }[];
  responsibles: { id: number; name: string }[];
  teacher: string;
  responsible: string;
  dueDate: string | null;
  loanStatus: string | null;
  onTeacherChange: (value: string) => void;
  onResponsibleChange: (value: string) => void;
  onDueDateChange: (date: any, dateString: string | string[]) => void;
  onLoanStatusChange: (value: string | null) => void;
  onCreateClick: () => void;
}

export const LoanFilters: React.FC<LoanFiltersProps> = ({
  isAdmin,
  responsibles,
  teachers,
  teacher,
  responsible,
  dueDate,
  loanStatus,
  onTeacherChange,
  onResponsibleChange,
  onDueDateChange,
  onLoanStatusChange,
  onCreateClick,
}) => {
  return (
    <div className="mb-3">
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} md={20}>
          <Row gutter={[16, 16]}>
            {isAdmin && (
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Selecciona docente"
                  allowClear
                  value={teacher || undefined}
                  onChange={onTeacherChange}
                  style={{ width: '100%' }}
                >
                  {teachers.map((teacher) => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Selecciona responsable"
                allowClear
                value={responsible || undefined}
                onChange={onResponsibleChange}
                style={{ width: '100%' }}
              >
                {responsibles.map((responsible) => (
                  <Option key={responsible.id} value={responsible.id}>
                    {responsible.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <DatePicker
                placeholder="Fecha de vencimiento"
                style={{ width: '100%' }}
                onChange={onDueDateChange}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Estado del préstamo"
                allowClear
                value={loanStatus}
                onChange={onLoanStatusChange}
                style={{ width: '100%' }}
              >
                {Object.entries(labelMap).map(([key]) => {
                  if (key === 'ON_CREATE') return null;
                  return (
                    <Option key={key} value={key}>
                      <LoanStatusTag status={key as keyof typeof labelMap} />
                    </Option>
                  );
                })}
              </Select>
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={4} style={{ textAlign: 'right' }}>
          <Button
            onClick={onCreateClick}
            style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
            type="primary"
            icon={<PlusOutlined />}
          >
            Crear Préstamo
          </Button>
        </Col>
      </Row>
    </div>
  );
};
