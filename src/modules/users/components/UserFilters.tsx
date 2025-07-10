import React from 'react';
import { Row, Col, Select, Button, Typography, Space } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { UserRoleTags } from './UserRoleTags';

const { Option } = Select;
const { Title } = Typography;

interface UserFiltersProps {
  selectedRole: string | null;
  onRoleChange: (value: string | null) => void;
  onCreateClick: () => void;
  onUploadClick: () => void;
}

const roles = ['ADMINISTRATOR', 'TOOL_ADMINISTRATOR', 'TEACHER', 'STUDENT'];

export const UserFilters: React.FC<UserFiltersProps> = ({
  selectedRole,
  onRoleChange,
  onCreateClick,
  onUploadClick,
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
            Usuarios
          </Title>
        </Col>
        <Col flex="none">
          <Space>
            <Button
              icon={<UploadOutlined />}
              onClick={onUploadClick}
              style={{
                minWidth: 260,
              }}
            >
              Subir Estudiantes
            </Button>

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
              Crear Usuario
            </Button>
          </Space>
        </Col>
      </Row>
      <Row gutter={[16, 16]} align="middle" wrap>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filtrar por rol"
            allowClear
            value={selectedRole ?? undefined}
            onChange={onRoleChange}
            style={{ width: '100%' }}
          >
            {roles.map((role) => (
              <Option key={role} value={role}>
                <UserRoleTags roles={role} />
              </Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
};
