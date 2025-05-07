import React from 'react';
import { Input, Select, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { CategoryType } from '../pages/ToolsPage';

const { Search } = Input;
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
    <div className="row mb-3">
      <div className="col-12 d-flex align-items-center flex-wrap gap-2">
        <Search
          placeholder="Buscar por nombre"
          allowClear
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
          style={{ width: 200 }}
        />
        <Search
          placeholder="Buscar por marca"
          allowClear
          value={searchBrand}
          onChange={(e) => onSearchBrandChange(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          allowClear
          style={{ width: 250 }}
          placeholder="Seleccionar una categoría"
          value={selectedCategory ?? undefined}
          onChange={(value: number | undefined) => {
            onCategoryChange(typeof value === 'number' ? value : null);
          }}
        >
          {categories.map((category) => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>

        <div className="ms-auto">
          <Button
            onClick={onCreateClick}
            style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
            type="primary"
            icon={<PlusOutlined />}
          >
            Crear Herramienta
          </Button>
        </div>
      </div>
    </div>
  );
};
