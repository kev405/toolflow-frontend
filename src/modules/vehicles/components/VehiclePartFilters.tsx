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
                      <i className="fas fa-car" style={{ marginRight: 8 }} />
                      {v.plate} • {v.brand} {v.model}
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
        </Col>
        <Col xs={24} md={4} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onCreateClick}
            style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
          >
            Crear Parte
          </Button>
        </Col>
      </Row>
    </div>
  );
};
