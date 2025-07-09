import React from 'react';
import { Input, Button, Row, Col, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

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
  vehicles?: { id: number; plate: string; brand: string; model: string }[];
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
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} md={20}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={5}>
              <Input
                placeholder="Buscar por nombre"
                value={searchName}
                onChange={(e) => onSearchNameChange(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Input
                placeholder="Buscar por marca"
                value={searchBrand}
                onChange={(e) => onSearchBrandChange(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={5}>
              <Input
                placeholder="Buscar por modelo"
                value={searchModel}
                onChange={(e) => onSearchModelChange(e.target.value)}
                prefix={<SearchOutlined />}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              {onSelectedVehicleChange && (
                <Select
                  placeholder="Vehículo"
                  value={selectedVehicle || undefined}
                  onChange={onSelectedVehicleChange}
                  allowClear
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                >
                  {vehicles.map((vehicle) => (
                    <Option key={vehicle.id} value={vehicle.id}>
                      <i className="fas fa-car" style={{ marginRight: 8 }} />
                      {vehicle.plate} - {vehicle.brand} {vehicle.model}
                    </Option>
                  ))}
                </Select>
              )}
            </Col>
            <Col xs={24} sm={12} md={5}>
              {onSelectedHeadquarterChange && (
                <Select
                  placeholder="Sede"
                  value={selectedHeadquarter || undefined}
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
        </Col>
        <Col xs={24} md={4}>
          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateClick}
              style={{ width: '100%' }}
            >
              Crear Parte
            </Button>
          </div>
        </Col>
      </Row>
    </div>
  );
};
