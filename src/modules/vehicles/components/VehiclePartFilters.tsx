import React from 'react';
import { Input, Button, Row, Col, Select, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

interface VehiclePartFiltersProps {
  searchName: string;
  searchBrand: string;
  searchModel: string;
  selectedVehicle?: number | null;
  selectedHeadquarter?: number | null;
  onSearchNameChange: (value: string) => void;
  onSearchBrandChange: (value: string) => void;
  onSearchModelChange: (value: string) => void;
  onSelectedVehicleChange?: (value: number | null) => void;
  onSelectedHeadquarterChange?: (value: number | null) => void;
  onCreateClick: () => void;
  vehicles?: { id: number; name: string; vehicleType?: string;}[];
  headquarters?: { id: number; name: string }[];
}

export const VehiclePartFilters: React.FC<VehiclePartFiltersProps> = ({
  searchName,
  searchBrand,
  searchModel,
  selectedVehicle,
  selectedHeadquarter,
  onSearchNameChange,
  onSearchBrandChange,
  onSearchModelChange,
  onSelectedVehicleChange,
  onSelectedHeadquarterChange,
  onCreateClick,
  vehicles = [],
  headquarters = [],
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
          <Title level={2} style={{ margin: 0 }} className='text-gray-800'>
            Partes de Vehículos
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
            Crear Parte
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Nombre de parte"
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            suffix={<SearchOutlined style={{ color: '#999' }} />}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Marca"
            value={searchBrand}
            onChange={(e) => onSearchBrandChange(e.target.value)}
            suffix={<SearchOutlined style={{ color: '#999' }} />}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Modelo"
            value={searchModel}
            onChange={(e) => onSearchModelChange(e.target.value)}
            suffix={<SearchOutlined style={{ color: '#999' }} />}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          {onSelectedVehicleChange && (
            <Select
              placeholder="Vehículo"
              value={selectedVehicle ?? undefined}
              onChange={onSelectedVehicleChange}
              allowClear
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {vehicles.map((v) => (
                <Option key={v.id} value={v.id}>
                  <i className={`fas fa-${v.vehicleType || "car"}`} style={{ marginRight: 8 }} />
                  {v.name}
                </Option>
              ))}
            </Select>
          )}
        </Col>

        <Col xs={24} sm={12} md={6}>
          {onSelectedHeadquarterChange && (
            <Select
              placeholder="Sede"
              value={selectedHeadquarter ?? undefined}
              onChange={onSelectedHeadquarterChange}
              allowClear
              style={{ width: '100%' }}
            >
              {headquarters.map((hq) => (
                <Option key={hq.id} value={hq.id}>
                  {hq.name}
                </Option>
              ))}
            </Select>
          )}
        </Col>
      </Row>
    </div>
  );
};
