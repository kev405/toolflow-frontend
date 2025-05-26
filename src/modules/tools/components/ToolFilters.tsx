import React from 'react';
import { Input, Select, Button, Row, Col } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { CategoryType } from '../pages/ToolsPage';

const { Option } = Select;

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
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} md={20}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Buscar por nombre"
                value={searchName}
                onChange={(e) => onSearchNameChange(e.target.value)}
                suffix={<SearchOutlined style={{ color: '#999' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Buscar por marca"
                value={searchBrand}
                onChange={(e) => onSearchBrandChange(e.target.value)}
                suffix={<SearchOutlined style={{ color: '#999' }} />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                allowClear
                style={{ width: '100%' }}
                placeholder="Seleccionar una categoría"
                value={selectedCategory ?? undefined}
                onChange={(value: number | undefined) =>
                  onCategoryChange(typeof value === 'number' ? value : null)
                }
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Col>
        <Col xs={24} md={4} style={{ textAlign: 'right' }}>
          <Button
            onClick={onCreateClick}
            style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
            type="primary"
            icon={<PlusOutlined />}
          >
            Crear Herramienta
          </Button>
        </Col>
      </Row>
    </div>
  );
};
