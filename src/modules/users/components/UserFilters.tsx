import React from 'react';
import { Row, Col, Select, Button, Space } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { UserRoleTags } from './UserRoleTags';

const { Option } = Select;

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
  onUploadClick
}) => {
  return (
    <div className="mb-3">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={16}>
          <Select
            placeholder="Filtrar por rol"
            allowClear
            value={selectedRole || undefined}
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
        <Col xs={24} sm={8}>
          <Space
            direction="horizontal"
            style={{ width: '100%', justifyContent: 'flex-end' }}
            wrap
          >
            <Button
              icon={<UploadOutlined />}
              onClick={onUploadClick}
            >
              Subir Estudiantes
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#26B857', borderColor: '#26B857' }}
              onClick={onCreateClick}
            >
              Crear Usuario
            </Button>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
