import React from 'react';
import { Row, Col, Select, DatePicker, Button, Typography, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { labelMap, LoanStatusTag } from './LoanStatusTag';
import { ToolType } from '../../tools/pages/ToolsPage';

const { Option } = Select;
const { Title } = Typography;

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
      {/* -------- Fila 1: título + botón -------- */}
      <Row
        align="middle"
        justify="space-between"
        wrap={false}
        style={{ marginBottom: 24 }}
      >
        <Col>
          <Title level={2} style={{ margin: 0 }} className="text-gray-800">
            Préstamos
          </Title>
        </Col>

        <Col flex="none">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateClick}
            style={{
              minWidth: 260,
              backgroundColor: '#26B857',
              borderColor: '#26B857',
            }}
          >
            Crear Préstamo
          </Button>
        </Col>
      </Row>

      {/* -------- Fila 2: filtros principales -------- */}
      <Row gutter={[16, 16]} align="middle" wrap>
        {isAdmin && (
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Selecciona docente"
              allowClear
              value={teacher || undefined}
              onChange={onTeacherChange}
              style={{ width: '100%' }}
            >
              {teachers.map((t) => (
                <Option key={t.id} value={t.id}>
                  {t.name}
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
            {responsibles.map((r) => (
              <Option key={r.id} value={r.id}>
                {r.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <DatePicker
            placeholder="Fecha de vencimiento"
            style={{ width: '100%' }}
            onChange={onDueDateChange}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Estado del préstamo"
            allowClear
            value={loanStatus ?? undefined}
            onChange={onLoanStatusChange}
            style={{ width: '100%' }}
          >
            {Object.entries(labelMap).map(([key]) =>
              key === 'ON_CREATE' ? null : (
                <Option key={key} value={key}>
                  <LoanStatusTag status={key as keyof typeof labelMap} />
                </Option>
              )
            )}
          </Select>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 16 }} wrap>
        <Col xs={24} md={24}>
          <Select
            mode="multiple"
            placeholder="Filtrar por herramientas"
            allowClear
            value={selectedTools}
            onChange={onToolChange}
            style={{ width: '75%' }}
            optionFilterProp="children"
          >
            {tools.map((tool) => {
              const isOutOfStock = tool.available === 0;
              const isInactive = tool.status === false;

              return (
                <Option key={tool.id} value={tool.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{tool.toolName}</span>
                    <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                      {isOutOfStock && <Tag color="orange">AGOTADO</Tag>}
                      {isInactive && <Tag color="red">INACTIVO</Tag>}
                    </div>
                  </div>
                </Option>
              );
            })}
          </Select>
        </Col>
      </Row>
    </div>
  );
};
