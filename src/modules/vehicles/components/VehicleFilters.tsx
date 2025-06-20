import React from 'react';
import { Input, Button, Row, Col, Select } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import InputMask from 'react-input-mask';

const { Option } = Select;

interface VehicleFiltersProps {
  searchVehicleType: string;
  searchPlate: string;
  searchBrand: string;
  selectedHeadquarter?: string;
  onSearchVehicleTypeChange: (value: string) => void;
  onSearchPlateChange: (value: string) => void;
  onSearchBrandChange: (value: string) => void;
  onSelectedHeadquarterChange?: (value: number | null) => void;
  onCreateClick: () => void;
  headquarters?: { id: number; name: string }[];
}

export const VehicleFilters: React.FC<VehicleFiltersProps> = ({
  searchVehicleType,
  searchPlate,
  searchBrand,
  selectedHeadquarter,
  onSearchVehicleTypeChange,
  onSearchPlateChange,
  onSearchBrandChange,
  onSelectedHeadquarterChange,
  onCreateClick,
  headquarters = [],
}) => {
  return (
    <div className="mb-3">
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} md={20}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Tipo de Vehículo"
                value={searchVehicleType || undefined}
                onChange={onSearchVehicleTypeChange}
                allowClear
                style={{ width: '100%' }}
              >
                <Option value="car">
                  <i className="fas fa-car" style={{ marginRight: 8 }} />
                  Automóvil
                </Option>
                <Option value="motorcycle">
                  <i className="fas fa-motorcycle" style={{ marginRight: 8 }} />
                  Motocicleta
                </Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <InputMask
                mask="aaa-999"
                maskChar={null}
                value={searchPlate}
                onChange={(e) => onSearchPlateChange(e.target.value)}
              >
                {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => {
                  const { size, ...restProps } = inputProps; // Filtramos `size` para evitar conflictos con AntD
                  return (
                    <Input
                      {...restProps}
                      placeholder="Placa"
                      suffix={<SearchOutlined style={{ color: '#999' }} />}
                    />
                  );
                }}
              </InputMask>
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
              <Select
                placeholder="Sede"
                value={selectedHeadquarter !== undefined ? Number(selectedHeadquarter) : undefined}
                onChange={(value) => onSelectedHeadquarterChange?.(value)}
                allowClear
                style={{ width: '100%' }}
              >
                {headquarters.map((hq) => (
                  <Option key={hq.id} value={hq.id}>
                    {hq.name}
                  </Option>
                ))}
              </Select>
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