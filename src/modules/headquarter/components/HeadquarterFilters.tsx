import React from 'react';
import { Button, Row, Col } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface HeadquarterFiltersProps {
  onCreateClick: () => void;
}

export const HeadquarterFilters: React.FC<HeadquarterFiltersProps> = ({
  onCreateClick,
}) => {
  return (
    <div className="mb-3">
      <Row justify="end">
        <Col>
          <Button
            onClick={onCreateClick}
            style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
            type="primary"
            icon={<PlusOutlined />}
          >
            Crear Sede
          </Button>
        </Col>
      </Row>
    </div>
  );
};
