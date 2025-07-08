import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, InputNumber, Checkbox } from 'antd';

const { TextArea } = Input;
import { VehiclePartPayload } from '../pages/VehiclePartsPage';
import { API_BASE_URL } from '../../../config';

const { Option } = Select;

interface VehiclePartFormModalProps {
  visible: boolean;
  vehiclePart: VehiclePartPayload | null;
  vehicles: { id: number; plate: string; brand: string; model: string }[];
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

      const payload: VehiclePartPayload = {
        name: values.name,
        brand: values.brand,
        model: values.model,
        description: values.description || '',
        notes: values.notes || '',
        quantity: values.quantity || 0,
        vehicleId: values.isAssociatedToVehicle ? values.vehicleId : null,
        vehicleType: values.isAssociatedToVehicle ? null : values.vehicleType,
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
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Guardar"
      cancelText="Cancelar"
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Nombre"
          rules={[
            { required: true, message: 'Por favor ingrese el nombre de la parte' },
            { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
            { max: 100, message: 'El nombre no puede exceder 100 caracteres' },
          ]}
        >
          <Input placeholder="Ej: Batería, Llantas, Motor de arranque" />
        </Form.Item>

        <Form.Item
          name="brand"
          label="Marca"
          rules={[
            { required: true, message: 'Por favor ingrese la marca' },
            { min: 2, message: 'La marca debe tener al menos 2 caracteres' },
            { max: 50, message: 'La marca no puede exceder 50 caracteres' },
          ]}
        >
          <Input placeholder="Ej: Bosch, Michelin, Denso" />
        </Form.Item>

        <Form.Item
          name="model"
          label="Modelo"
          rules={[
            { required: true, message: 'Por favor ingrese el modelo' },
            { min: 1, message: 'El modelo debe tener al menos 1 caracter' },
            { max: 50, message: 'El modelo no puede exceder 50 caracteres' },
          ]}
        >
          <Input placeholder="Ej: S4015, Energy XM2, 128000-2980" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descripción (Opcional)"
          rules={[
            { max: 500, message: 'La descripción no puede exceder 500 caracteres' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Descripción adicional de la parte..."
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Observaciones (Opcional)"
          rules={[
            { max: 500, message: 'Las observaciones no pueden exceder 500 caracteres' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Observaciones adicionales..."
          />
        </Form.Item>

        {/* Campo de cantidad solo para creación */}
        {!vehiclePart?.id && (
          <Form.Item
            name="quantity"
            label="Cantidad Inicial"
            rules={[
              { required: true, message: 'Por favor ingrese la cantidad inicial' },
              { type: 'number', min: 0, message: 'La cantidad debe ser mayor o igual a 0' },
            ]}
          >
            <InputNumber
              min={0}
              placeholder="0"
              style={{ width: '100%' }}
              addonAfter="unidades"
            />
          </Form.Item>
        )}

        {/* Checkbox para asociar a vehículo - solo en creación */}
        {!vehiclePart?.id && (
          <Form.Item
            name="isAssociatedToVehicle"
            valuePropName="checked"
          >
            <Checkbox
              onChange={(e) => {
                setIsAssociatedToVehicle(e.target.checked);
                // Limpiar campos relacionados cuando cambie el checkbox
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
        )}

        {/* Selector de vehículo - solo si está marcado el checkbox y en creación */}
        {!vehiclePart?.id && isAssociatedToVehicle && (
          <Form.Item
            name="vehicleId"
            label="Vehículo"
            rules={[
              { required: true, message: 'Por favor seleccione un vehículo' },
            ]}
          >
            <Select
              placeholder="Seleccione un vehículo"
              showSearch
              optionFilterProp="children"
            >
              {vehicles.map((vehicle) => (
                <Option key={vehicle.id} value={vehicle.id}>
                  <i className="fas fa-car" style={{ marginRight: 8 }} />
                  {vehicle.plate} - {vehicle.brand} {vehicle.model}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}

        {/* Selector de tipo de vehículo - solo si NO está marcado el checkbox y en creación */}
        {!vehiclePart?.id && !isAssociatedToVehicle && (
          <Form.Item
            name="vehicleType"
            label="Tipo de Vehículo"
            rules={[
              { required: true, message: 'Por favor seleccione el tipo de vehículo' },
            ]}
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
              <Option value="truck">
                <i className="fas fa-truck" style={{ marginRight: 8 }} />
                Camión
              </Option>
              <Option value="bus">
                <i className="fas fa-bus" style={{ marginRight: 8 }} />
                Bus
              </Option>
            </Select>
          </Form.Item>
        )}

        {/* Para edición - mostrar información de asociación pero sin permitir cambios */}
        {/* Removido: No mostrar asociación actual en edición */}
      </Form>
    </Modal>
  );
};
