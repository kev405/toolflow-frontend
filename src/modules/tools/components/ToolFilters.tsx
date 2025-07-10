import React from 'react';
import { Input, Select, Button, Row, Col, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { CategoryType } from '../pages/ToolsPage';

const { Option } = Select;
const { Title } = Typography;

interface ToolFiltersProps {
  searchName: string;
  searchBrand: string;
  selectedCategory: number | null;
  categories: CategoryType[];
  onSearchNameChange: (value: string) => void;
  onSearchBrandChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onCreateClick: () => void;
}

export const ToolFilters: React.FC<ToolFiltersProps> = ({
  searchName,
  searchBrand,
  selectedCategory,
  categories,
  onSearchNameChange,
  onSearchBrandChange,
  onCategoryChange,
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
            Herramientas
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
            Crear Herramienta
          </Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Buscar por nombre"
            value={searchName}
            onChange={(e) => onSearchNameChange(e.target.value)}
            suffix={<SearchOutlined style={{ color: '#999' }} />}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Input
            placeholder="Buscar por marca"
            value={searchBrand}
            onChange={(e) => onSearchBrandChange(e.target.value)}
            suffix={<SearchOutlined style={{ color: '#999' }} />}
            allowClear
          />
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Seleccionar una categoría"
            value={selectedCategory ?? undefined}
            onChange={(value: number | undefined) =>
              onCategoryChange(typeof value === 'number' ? value : null)
            }
            allowClear
            style={{ width: '100%' }}
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};
