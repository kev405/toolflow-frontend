import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: any;
  title: string;
  loading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
  loading = false
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        confirmTelefono: initialValues.telefono
      });
    } else {
      form.resetFields();
    }
  }, [open, initialValues]);
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      centered
      footer={[
        <div className="d-flex justify-content-center mt-4">
          <Button type="primary" htmlType="submit" form='user-form' style={{ width: '50%' }}>
            Guardar
          </Button>
        </div>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        className="mt-3"
        id='user-form'
      >
        <div className="row g-3">
          <div className="col-md-6">
            <Form.Item
              name="nombre"
              rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
            >
              <Input placeholder="Nombre" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="apellido"
              rules={[{ required: true, message: 'Por favor ingresa el apellido' }]}
            >
              <Input placeholder="Apellido" />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Por favor ingresa el email' },
            { type: 'email', message: 'Por favor ingresa un email válido' }
          ]}
        >
          <Input placeholder="Ingresa el Email" />
        </Form.Item>

        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Por favor ingresa el nombre de usuario' }]}
        >
          <Input placeholder="Nombre de Usuario" />
        </Form.Item>

        <div className="row g-3">
          <div className="col-md-6">
            <Form.Item
              name="password"
            >
              <Input.Password placeholder="Contraseña" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="confirmPassword"
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const password = getFieldValue('password');
                    if (!password && !value) {
                      return Promise.resolve();
                    }
                    if (password === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Las contraseñas no coinciden'));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirmar Contraseña" />
            </Form.Item>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <Form.Item
              name="telefono"
              rules={[{ required: true, message: 'Por favor ingresa el teléfono' }]}
            >
              <Input placeholder="Teléfono" />
            </Form.Item>
          </div>
          <div className="col-md-6">
            <Form.Item
              name="confirmTelefono"
              rules={[
                { required: true, message: 'Por favor confirma el teléfono' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('telefono') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Los teléfonos no coinciden'));
                  },
                }),
              ]}
            >
              <Input placeholder="Confirmar Teléfono" />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="rol"
          rules={[{ required: true, message: 'Por favor selecciona el rol' }]}
        >
          <Select placeholder="Seleccione el Rol" mode='multiple'>
            <Select.Option value="ADMINISTRATOR">Administrador</Select.Option>
            <Select.Option value="TEACHER">Profesor</Select.Option>
            <Select.Option value="STUDENT">Estudiante</Select.Option>
            <Select.Option value="TOOL_ADMINISTRATOR">Administrador de herramientas</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};