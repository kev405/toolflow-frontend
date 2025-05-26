import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Row, Col, Button } from 'antd';
import { CategoryType, ToolPayload } from '../pages/ToolsPage';
import CategorySelector from './CategorySelector';
import { useWatch } from 'antd/es/form/Form';

interface ToolFormModalProps {
  id?: number;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ToolPayload) => void;
  initialValues?: any;
  title: string;
  loading?: boolean;
  categories: CategoryType[];
}

export const ToolFormModal: React.FC<ToolFormModalProps> = ({
  id,
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
  loading = false,
  categories
}) => {
  const [form] = Form.useForm();
  const isEditing = !!id;

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
      } else {
        form.resetFields();
      }
    }
  }, [open]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const consumable = useWatch('consumable', form);

  return (
    <Modal
      open={open}
      title={title}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={800}
      centered
      footer={[
        <div className="d-flex justify-content-center mt-4">
          <Button type="primary" htmlType="submit" form='tool-form' style={{ width: '50%' }}>
            Guardar
          </Button>
        </div>,
      ]}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        initialValues={initialValues}
        className="mt-3"
        id='tool-form'
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="toolName"
              label="Nombre de Herramienta"
              rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
            >
              <Input placeholder="Nombre de la herramienta" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="brand"
              label="Marca"
              rules={[{ required: true, message: 'Por favor ingresa la marca' }]}
            >
              <Input placeholder="Marca" />
            </Form.Item>
          </Col>

          {!isEditing && (
            <Col span={12}>
              <Form.Item
                name="available"
                label="Cantidad Disponible"
                rules={[{ required: true, message: 'Por favor ingresa la cantidad disponible' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          )}

          {isEditing && (
            <>
              <Col span={8}>
                <Form.Item
                  name="available"
                  label="Disponibles"
                  rules={[{ required: true, message: 'Por favor ingresa la cantidad disponible' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="onLoan"
                  label="En Préstamo"
                  rules={[{ required: true, message: 'Por favor ingresa la cantidad en préstamo' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="damaged"
                  label="Averiadas"
                  rules={[{ required: true, message: 'Por favor ingresa la cantidad averiada' }]}
                >
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </>
          )}

          <Col span={5}>
            <Form.Item
              name="consumable"
              label="¿Es Consumible?"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>

          {consumable && (
            <Col span={7}>
              <Form.Item
                name="minimalRegistration"
                label="Registro Mínimo"
                rules={[{ required: true, message: 'Por favor ingresa el registro mínimo' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          )}

          <Col span={24}>
            <Form.Item
              name="notes"
              label="Notas"
            >
              <Input.TextArea rows={2} placeholder="Notas adicionales" />
            </Form.Item>
          </Col>
          <CategorySelector categories={categories} />
        </Row>
      </Form>
    </Modal>
  );
};