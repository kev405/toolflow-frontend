import React from 'react';
import { Input, Button, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

interface VehicleFiltersProps {
  searchVehicleType: string;
  searchPlate: string;
  searchBrand: string;
  searchColor: string;
  onSearchVehicleTypeChange: (value: string) => void;
  onSearchPlateChange: (value: string) => void;
  onSearchBrandChange: (value: string) => void;
  onSearchColorChange: (value: string) => void;
  onCreateClick: () => void;
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  searchVehicleType,
  searchPlate,
  searchBrand,
  searchColor,
  onSearchVehicleTypeChange,
  onSearchPlateChange,
  onSearchBrandChange,
  onSearchColorChange,
  onCreateClick,
}) => {
  return (
    <div className="mb-3">
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} md={20}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Tipo de Vehículo"
                value={searchVehicleType}
                onChange={(e) => onSearchVehicleTypeChange(e.target.value)}
                suffix={<SearchOutlined style={{ color: '#999' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Placa"
                value={searchPlate}
                onChange={(e) => onSearchPlateChange(e.target.value)}
                suffix={<SearchOutlined style={{ color: '#999' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Marca"
                value={searchBrand}
                onChange={(e) => onSearchBrandChange(e.target.value)}
                suffix={<SearchOutlined style={{ color: '#999' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Color"
                value={searchColor}
                onChange={(e) => onSearchColorChange(e.target.value)}
                suffix={<SearchOutlined style={{ color: '#999' }} />}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={4} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
            onClick={onCreateClick}
          >
            Crear Vehículo
          </Button>
        </Col>
      </Row>
    </div>
  );
};