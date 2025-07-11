import React, { useEffect, useState } from 'react';
import InputMask from 'react-input-mask';
import { Modal, Form, Input, Button, Select, Row, Col } from 'antd';
import { VehiclePayload } from '../pages/VehiclesPage';

const { Option } = Select;

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
  const [plateMask, setPlateMask] = useState<'aaa999' | 'aaa99a'>(
    initialValues.vehicleType === 'motorcycle' ? 'aaa99a' : 'aaa999'
  );

  useEffect(() => {
    setPlateMask(initialValues.vehicleType === 'motorcycle' ? 'aaa99a' : 'aaa999');
  }, [initialValues.vehicleType]);

  const handleVehicleTypeChange = (value: string) => {
    const newMask = value === 'motorcycle' ? 'aaa99a' : 'aaa999';
    setPlateMask(newMask);
    form.validateFields(['plate']).catch(() => {});
  };

  useEffect(() => {
    if (open) form.setFieldsValue(initialValues);
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
              rules={[{ required: true, message: 'Por favor seleccione el tipo de vehículo' }]}
            >
              <Select placeholder="Seleccione el tipo de vehículo" onChange={handleVehicleTypeChange}>
                <Option value="car">
                  <i className="fas fa-car" /> Automóvil
                </Option>
                <Option value="motorcycle">
                  <i className="fas fa-motorcycle" /> Motocicleta
                </Option>
              </Select>
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.vehicleType !== cur.vehicleType}>
              {({ getFieldValue }) => {
                const type = getFieldValue('vehicleType');
                const regexCar = /^[A-Z]{3}\d{3}$/;
                const regexMoto = /^[A-Z]{3}\d{2}[A-Z]$/;

                return (
                  <Form.Item
                    name="plate"
                    label="Placa"
                    rules={[
                      { required: true, message: 'Por favor ingrese la placa del vehículo' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          if (type === 'motorcycle' ? regexMoto.test(value) : regexCar.test(value)) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              type === 'motorcycle'
                                ? 'Formato moto: ABC12D'
                                : 'Formato carro: ABC123'
                            )
                          );
                        },
                      },
                    ]}
                  >
                    <InputMask mask={plateMask} maskChar={null}>
                      {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => {
                        const { size, ...rest } = inputProps;
                        return (
                          <Input
                            {...rest}
                            placeholder={type === 'motorcycle' ? 'Ej. ABC12D' : 'Ej. ABC123'}
                            maxLength={6}
                            onInput={e =>
                              (e.currentTarget.value = e.currentTarget.value.toUpperCase())
                            }
                          />
                        );
                      }}
                    </InputMask>
                  </Form.Item>
                );
              }}
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
