import React from 'react';
import { Button, Select, DatePicker, Row, Col, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { labelMap, LoanStatusTag } from './LoanStatusTag';
import { ToolType } from '../../tools/pages/ToolsPage';

const { Option } = Select;

interface LoanFiltersProps {
  isAdmin: boolean;
  teachers: { id: number; name: string }[];
  responsibles: { id: number; name: string }[];
  teacher: string;
  responsible: string;
  tools: ToolType[];
  selectedTools: number[];
  dueDate: string | null;
  loanStatus: string | null;
  onTeacherChange: (value: string) => void;
  onResponsibleChange: (value: string) => void;
  onDueDateChange: (date: any, dateString: string | string[]) => void;
  onLoanStatusChange: (value: string | null) => void;
  onToolChange: (value: number[]) => void;
  onCreateClick: () => void;
}

export const LoanFilters: React.FC<LoanFiltersProps> = ({
  isAdmin,
  teachers,
  responsibles,
  teacher,
  responsible,
  tools,
  selectedTools,
  dueDate,
  loanStatus,
  onTeacherChange,
  onResponsibleChange,
  onDueDateChange,
  onLoanStatusChange,
  onToolChange,
  onCreateClick,
}) => {
  return (
    <div className="mb-3">
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
        <Col xs={24} md={18}>
          <Select
            mode="multiple"
            placeholder="Filtrar por herramientas"
            allowClear
            value={selectedTools}
            onChange={onToolChange}
            style={{ width: '100%' }}
            optionFilterProp="children"
          >
            {tools.map((tool) => {
              const isOutOfStock = tool.available === 0;
              const isInactive = tool.status === false;

              return (
                <Option key={tool.id} value={tool.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{tool.toolName}</span>
                    <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                      {isOutOfStock && <Tag color="orange">AGOTADO</Tag>}
                      {isInactive && <Tag color="red">INACTIVO</Tag>}
                    </div>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Col>
        <Col xs={24} md={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={onCreateClick}
            style={{ backgroundColor: '#26B857', borderColor: '#26B857', width: '100%' }}
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
