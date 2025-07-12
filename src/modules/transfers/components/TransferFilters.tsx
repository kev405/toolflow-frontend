import React from 'react';
import { Button, Select, DatePicker, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import Title from 'antd/es/typography/Title';

const { Option } = Select;

interface Item {
  id: number;
  name: string;
}

interface TransferFiltersProps {
  startHeadquarters: { id: number; name: string }[];
  endHeadquarters: { id: number; name: string }[];
  tools: { id: number; name: string; toolName?: string }[];
  vehicleParts: Item[];
  vehicles: Item[];
  startHeadquarterId: number | null;
  endHeadquarterId: number | null;
  transferDate: string | null;
  selectedToolIds: number[];
  selectedPartIds: number[];
  selectedVehicleIds: number[];
  onStartChange: (value: number | null) => void;
  onEndChange: (value: number | null) => void;
  onDateChange: (date: any, dateString: string | string[]) => void;
  onToolChange: (value: number[]) => void;
  onPartChange: (value: number[]) => void;
  onVehicleChange: (value: number[]) => void;
  onCreateClick: () => void;
}

export const TransferFilters: React.FC<TransferFiltersProps> = ({
  startHeadquarters,
  endHeadquarters,
  tools,
  vehicleParts,
  vehicles,
  startHeadquarterId,
  endHeadquarterId,
  transferDate,
  selectedToolIds,
  selectedPartIds,
  selectedVehicleIds,
  onStartChange,
  onEndChange,
  onDateChange,
  onToolChange,
  onPartChange,
  onVehicleChange,
  onCreateClick,
}) => {
  return (
    <div className="mb-3">
      <Row
        align="middle"
        justify="space-between"
        wrap={false}
        style={{ marginBottom: 24 }}
      >
        <Col>
          <Title level={2} style={{ margin: 0 }} className="text-gray-800">
            Traslados
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
            Crear Traslado
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Sede Origen"
            allowClear
            value={startHeadquarterId ?? undefined}
            onChange={onStartChange}
            style={{ width: '100%' }}
          >
            {startHeadquarters.map((hq) => (
              <Option key={hq.id} value={hq.id}>
                {hq.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Sede Destino"
            allowClear
            value={endHeadquarterId ?? undefined}
            onChange={onEndChange}
            style={{ width: '100%' }}
          >
            {endHeadquarters.map((hq) => (
              <Option key={hq.id} value={hq.id}>
                {hq.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <DatePicker
            placeholder="Fecha de traslado"
            style={{ width: '100%' }}
            onChange={onDateChange}
          />
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            mode="multiple"
            placeholder="Filtrar por herramientas"
            allowClear
            value={selectedToolIds}
            onChange={onToolChange}
            style={{ width: '100%' }}
            maxTagCount="responsive"
          >
            {tools.map((tool) => (
              <Option key={tool.id} value={tool.id}>
                {tool.name || tool.toolName || `Herramienta ID: ${tool.id}`}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            mode="multiple"
            placeholder="Filtrar por partes de vehículo"
            allowClear
            value={selectedPartIds}
            onChange={onPartChange}
            style={{ width: '100%' }}
            maxTagCount="responsive"
          >
            {vehicleParts.map(part => (
              <Option key={part.id} value={part.id}>
                {part.name}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            mode="multiple"
            placeholder="Filtrar por vehículos"
            allowClear
            value={selectedVehicleIds}
            onChange={onVehicleChange}
            style={{ width: '100%' }}
            maxTagCount="responsive"
          >
            {vehicles.map(vehicle => (
              <Option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </Option>
            ))}
          </Select>
        </Col>       
      </Row>
    </div>
  );
};
