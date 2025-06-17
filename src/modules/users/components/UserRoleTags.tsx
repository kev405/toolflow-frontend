import React, { JSX } from 'react';
import { Tag } from 'antd';
import {
    SafetyOutlined,
    ToolOutlined,
    ReadOutlined,
    UserOutlined
} from '@ant-design/icons';

interface UserRoleTagsProps {
    roles?: string[] | string;
}

const roleMeta: Record<string, { label: string; color: string; icon: JSX.Element }> = {
    ADMINISTRATOR: {
        label: 'ADMINISTRADOR',
        color: 'blue',
        icon: <SafetyOutlined />
    },
    TOOL_ADMINISTRATOR: {
        label: 'ADMIN. DE HERRAMIENTAS',
        color: 'magenta',
        icon: <ToolOutlined />
    },
    TEACHER: {
        label: 'PROFESOR',
        color: 'purple',
        icon: <ReadOutlined />
    },
    STUDENT: {
        label: 'ESTUDIANTE',
        color: 'green',
        icon: <UserOutlined />
    }
};

export const UserRoleTags: React.FC<UserRoleTagsProps> = ({ roles }) => {
    if (!roles) return null;

    const roleList = Array.isArray(roles) ? roles : [roles];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {roleList.map((role) => {
                const meta = roleMeta[role];
                return (
                    <Tag
                        key={role}
                        color={meta?.color || 'default'}
                        style={{
                            maxWidth: '200px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        title={meta?.label || role}
                    >
                        {meta?.icon}
                        <b style={{ marginLeft: 6 }}>{meta?.label || role}</b>
                    </Tag>
                );
            })}
        </div>
    );
};

