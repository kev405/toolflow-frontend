import React, { useState } from 'react';
import { Form, Select, Input, Switch, Row, Col } from 'antd';

const { Option } = Select;

const CategorySelector: React.FC<{
  categories: { id: number; name: string }[];
}> = ({ categories }) => {
  const [isNewCategory, setIsNewCategory] = useState(false);

  return (
    <Col span={24}>

      <Form.Item
        name="category"
        label="Categoría"
        rules={[{ required: true, message: 'Por favor selecciona o ingresa una categoría' }]}
      >
        {isNewCategory ? (
          <Input placeholder="Nombre de la nueva categoría" />
        ) : (
          <Select placeholder="Selecciona una categoría existente">
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.name}>
                {cat.name}
              </Option>
            ))}
          </Select>
        )}
      </Form.Item>
      <Row align="middle" justify="start" style={{ marginBottom: 8 }}>
        <Col>
          <span style={{ marginRight: 8 }}>¿Agregar nueva categoría?</span>
        </Col>
        <Col>
          <Switch checked={isNewCategory} onChange={setIsNewCategory} />
        </Col>
      </Row>
    </Col>
  );
};

export default CategorySelector;
