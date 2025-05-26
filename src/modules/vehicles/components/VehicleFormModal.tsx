import React, { useEffect } from 'react';
import { Modal, Form, Input, Button, ColorPicker, Row, Col } from 'antd';
import { VehiclePayload } from '../pages/VehiclesPage';

interface VehicleFormModalProps {
  id?: number;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: VehiclePayload) => Promise<void>;
  initialValues: VehiclePayload;
  title: string;
}

export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({
  id,
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues);
    }
  }, [open, initialValues, form]);

  const handleFinish = async (values: VehiclePayload) => {
    await onSubmit(values);
    form.resetFields();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={[
        <div className="d-flex justify-content-center mt-4">
          <Button type="primary" htmlType="submit" form='vehicle-form' style={{ width: '50%' }}>
            Guardar
          </Button>
        </div>,
      ]}
      width={800}
    >
      <Form
        id="vehicle-form"
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="vehicleType"
              label="Tipo de Vehículo"
              rules={[
                { required: true, message: 'Por favor ingrese el tipo de vehículo' },
                { pattern: /^[a-zA-Z\s]+$/, message: 'Solo se permiten letras y espacios' },
              ]}
            >
              <Input placeholder="Ejemplo: Camioneta, Auto, Moto" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="plate"
              label="Placa"
              rules={[
                { required: true, message: 'Por favor ingrese la placa del vehículo' },
                { pattern: /^[A-Z0-9-]+$/, message: 'Solo se permiten letras mayúsculas, números y guiones' },
              ]}
            >
              <Input placeholder="Ejemplo: ABC-123" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="brand"
              label="Marca"
              rules={[
                { required: true, message: 'Por favor ingrese la marca del vehículo' },
                { pattern: /^[a-zA-Z\s]+$/, message: 'Solo se permiten letras y espacios' },
              ]}
            >
              <Input placeholder="Ejemplo: Toyota" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="model"
              label="Modelo"
              rules={[
                { required: true, message: 'Por favor ingrese el modelo del vehículo' },
                { pattern: /^[a-zA-Z0-9\s]+$/, message: 'Solo se permiten letras, números y espacios' },
              ]}
            >
              <Input placeholder="Ejemplo: Corolla" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="color"
              label="Color"
              rules={[
                { required: true, message: 'Por favor ingrese el color del vehículo' },
                { pattern: /^[a-zA-Z\s]+$/, message: 'Solo se permiten letras y espacios' },
              ]}
            >
              <Input placeholder="Ejemplo: Rojo" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="numberChasis"
              label="Número de Chasis"
              rules={[
                { required: true, message: 'Por favor ingrese el número de chasis' },
                { pattern: /^[A-Z0-9]+$/, message: 'Solo se permiten letras mayúsculas y números' },
              ]}
            >
              <Input placeholder="Ejemplo: 1HGCM82633A004352" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="location"
              label="Ubicación"
              rules={[
                { required: true, message: 'Por favor ingrese la ubicación del vehículo' },
                { pattern: /^[a-zA-Z0-9\s]+$/, message: 'Solo se permiten letras, números y espacios' },
              ]}
            >
              <Input placeholder="Ejemplo: Depósito Principal" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
