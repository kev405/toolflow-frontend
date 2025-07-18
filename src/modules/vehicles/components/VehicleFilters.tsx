import React from 'react';
import { Input, Button, Row, Col, Select, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Title } = Typography;

interface VehicleFiltersProps {
  searchVehicleType: string;
  searchPlate: string;
  searchBrand: string;
  selectedHeadquarter?: number | null;
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
      <Row
        align="middle"
        justify="space-between"
        wrap={false}
        style={{ marginBottom: 24 }}
      >
        <Col>
          <Title level={2} style={{ margin: 0 }} className="text-gray-800">
            Vehículos
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
            Crear Vehículo
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle" wrap>
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
          <Input
            placeholder="Placa (máx. 6 caracteres)"
            value={searchPlate}
            onChange={e => {
              const value = e.target.value.toUpperCase().slice(0, 6);
              onSearchPlateChange(value);
            }}
            suffix={<SearchOutlined style={{ color: '#999' }} />}
            allowClear
            maxLength={6}
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
