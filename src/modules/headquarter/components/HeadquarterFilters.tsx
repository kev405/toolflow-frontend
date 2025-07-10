import React from 'react';
import { Row, Col, Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface HeadquarterFiltersProps {
  onCreateClick: () => void;
}

export const HeadquarterFilters: React.FC<HeadquarterFiltersProps> = ({
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
            Sedes
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
            Crear Sede
          </Button>
        </Col>
      </Row>
    </div>
  );
};
