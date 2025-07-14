import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, InputNumber, Checkbox, Row, Col, Button } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { TextArea } = Input;
import { VehiclePartPayload } from '../pages/VehiclePartsPage';
import { API_BASE_URL } from '../../../config';

const { Option } = Select;

interface VehiclePartFormModalProps {
  visible: boolean;
  vehiclePart: VehiclePartPayload | null;
  vehicles: { id: number; name: string; vehicleType?: string; }[];
  onSave: () => void;
  onCancel: () => void;
}

export const VehiclePartFormModal: React.FC<VehiclePartFormModalProps> = ({
  visible,
  vehiclePart,
  vehicles,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isAssociatedToVehicle, setIsAssociatedToVehicle] = useState(false);

  useEffect(() => {
    if (visible && vehiclePart) {
      const hasVehicleId = !!vehiclePart.vehicleId;
      setIsAssociatedToVehicle(hasVehicleId);

      form.setFieldsValue({
        name: vehiclePart.name,
        brand: vehiclePart.brand,
        model: vehiclePart.model,
        description: vehiclePart.description || '',
        notes: vehiclePart.notes || '',
        quantity: vehiclePart.quantity || 0,
        isAssociatedToVehicle: hasVehicleId,
        vehicleId: vehiclePart.vehicleId,
        vehicleType: vehiclePart.vehicleType,
      });
    } else if (visible) {
      form.resetFields();
      setIsAssociatedToVehicle(false);
    }
  }, [visible, vehiclePart, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const vehicle = vehicles.find(v => v.id === values.vehicleId);

      const payload: VehiclePartPayload = {
        name: values.name,
        brand: values.brand,
        model: values.model,
        description: values.description || '',
        notes: values.notes || '',
        quantity: values.quantity || 0,
        vehicleId: values.isAssociatedToVehicle ? values.vehicleId : null,
        vehicleType: values.isAssociatedToVehicle ? vehicle?.vehicleType : values.vehicleType,
      };

      if (vehiclePart?.id) {
        payload.id = vehiclePart.id;
      }

      const result = vehiclePart?.id
        ? await updateVehiclePart(payload)
        : await createVehiclePart(payload);

      if (result.success) {
        message.success(
          vehiclePart?.id
            ? 'Parte del vehículo actualizada correctamente'
            : 'Parte del vehículo creada correctamente'
        );
        form.resetFields();
        onSave();
      } else {
        message.error(result.error || 'Error al guardar la parte del vehículo');
      }
    } catch (error) {
      console.error('Error en validación:', error);
    } finally {
      setLoading(false);
    }
  };

  const createVehiclePart = async (payload: VehiclePartPayload) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/vehicle-parts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la parte del vehículo');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error creando parte del vehículo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de red',
      };
    }
  };

  const updateVehiclePart = async (payload: VehiclePartPayload) => {
    try {
      const token = localStorage.getItem('authToken');

      const response = await fetch(`${API_BASE_URL}/api/vehicle-parts/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar la parte del vehículo');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error actualizando parte del vehículo:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error de red',
      };
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={vehiclePart?.id ? 'Editar Parte de Vehículo' : 'Crear Parte de Vehículo'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <div className="d-flex justify-content-center mt-4" key="footer">
          <Button
            type="primary"
            htmlType="submit"
            form="vehicle-part-form"
            loading={loading}
            style={{ width: '50%' }}
          >
            Guardar
          </Button>
        </div>,
      ]}
      width={800}
    >
      <Form
        id="vehicle-part-form"
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
      >
        {/* -------- FILA 1 -------- */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Nombre"
              rules={[
                { required: true, message: 'Por favor ingrese el nombre' },
                { min: 2, max: 100 },
              ]}
            >
              <Input placeholder="Ej: Batería" />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="brand"
              label="Marca"
              rules={[
                { required: true, message: 'Por favor ingrese la marca' },
                { min: 2, max: 50 },
              ]}
            >
              <Input placeholder="Ej: Bosch" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="model"
              label="Modelo"
              rules={[
                { required: true, message: 'Por favor ingrese el modelo' },
                { min: 1, max: 50 },
              ]}
            >
              <Input placeholder="Ej: S4015" />
            </Form.Item>
          </Col>
          {!vehiclePart?.id ? (
            <Col xs={24} md={12}>
              <Form.Item
                name="quantity"
                label="Cantidad Disponible"
                rules={[
                  { required: true, message: 'Ingrese la cantidad' },
                  { type: 'number', min: 0 },
                ]}
              >
                <InputNumber min={0} style={{ width: '100%' }} addonAfter="Unidades" />
              </Form.Item>
            </Col>
          ) : <Col span={24}>
            <div style={{ marginBottom: 16, color: '#888', display: 'flex', alignItems: 'center' }}>
              <InfoCircleOutlined style={{ marginRight: 8 }} />
              <em>Los valores de inventario se gestionan por sede en la tabla expandida.</em>
            </div>
          </Col>}
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="description"
              label="Descripción (Opcional)"
              rules={[{ max: 500 }]}
            >
              <TextArea rows={3} placeholder="Descripción adicional..." />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="notes"
              label="Observaciones (Opcional)"
              rules={[{ max: 500 }]}
            >
              <TextArea rows={3} placeholder="Observaciones..." />
            </Form.Item>
          </Col>
        </Row>
        {!vehiclePart?.id && (<Row gutter={16}>
          <Col span={24}>
            <Form.Item name="isAssociatedToVehicle" valuePropName="checked">
              <Checkbox
                onChange={(e) => {
                  setIsAssociatedToVehicle(e.target.checked);
                  if (e.target.checked) {
                    form.setFieldValue('vehicleType', undefined);
                  } else {
                    form.setFieldValue('vehicleId', undefined);
                  }
                }}
              >
                ¿Parte asociada a un vehículo específico?
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>)}
        {!vehiclePart?.id && isAssociatedToVehicle && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="vehicleId"
                label="Vehículo"
                rules={[{ required: true, message: 'Seleccione un vehículo' }]}
              >
                <Select
                  placeholder="Seleccione un vehículo"
                  showSearch
                  optionFilterProp="children"
                >
                  {vehicles.map((v) => (
                    <Option key={v.id} value={v.id}>
                      <i className={`fas fa-${v.vehicleType || "car"}`} style={{ marginRight: 8 }} />
                      {v.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}
        {(!vehiclePart?.id && !isAssociatedToVehicle) && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="vehicleType"
                label="Tipo de Vehículo"
                rules={[{ required: true, message: 'Seleccione el tipo de vehículo' }]}
              >
                <Select placeholder="Seleccione el tipo de vehículo">
                  <Option value="car">
                    <i className="fas fa-car" style={{ marginRight: 8 }} />
                    Automóvil
                  </Option>
                  <Option value="motorcycle">
                    <i className="fas fa-motorcycle" style={{ marginRight: 8 }} />
                    Motocicleta
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};
