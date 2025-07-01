import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Checkbox, InputNumber } from 'antd';
import { VehiclePartPayload } from '../pages/VehiclePartsPage';
import { API_BASE_URL } from '../../../config';

const { TextArea } = Input;
const { Option } = Select;

interface VehiclePartFormModalProps {
  visible: boolean;
  vehiclePart: VehiclePartPayload | null;
  vehicles: { id: number; plate: string; brand: string; model: string }[];
  onSave: () => void;
  onCancel: () => void;
}

const VEHICLE_TYPES = [
  { value: 'car', label: 'Automóvil', icon: 'car' },
  { value: 'motorcycle', label: 'Motocicleta', icon: 'motorcycle' },
  { value: 'truck', label: 'Camión', icon: 'truck' },
  { value: 'van', label: 'Camioneta', icon: 'shuttle-van' },
];

export const VehiclePartFormModal: React.FC<VehiclePartFormModalProps> = ({
  visible,
  vehiclePart,
  vehicles,
  onSave,
  onCancel,
}) => {  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isAssociatedToVehicle, setIsAssociatedToVehicle] = useState(false);

  useEffect(() => {
    if (visible && vehiclePart) {
      const isAssociated = !!vehiclePart.vehicleId;
      setIsAssociatedToVehicle(isAssociated);
      
      form.setFieldsValue({
        name: vehiclePart.name,
        brand: vehiclePart.brand,
        model: vehiclePart.model,
        description: vehiclePart.description || '',
        notes: vehiclePart.notes || '',
        quantity: vehiclePart.quantity || 1,
        isAssociatedToVehicle: isAssociated,
        vehicleId: vehiclePart.vehicleId,
        vehicleType: vehiclePart.vehicleType,
      });
    } else if (visible) {
      setIsAssociatedToVehicle(false);
      form.resetFields();
    }
  }, [visible, vehiclePart, form]);
  const handleAssociationChange = (checked: boolean) => {
    setIsAssociatedToVehicle(checked);
    // Clear the other field when switching
    if (checked) {
      form.setFieldValue('vehicleType', undefined);
    } else {
      form.setFieldValue('vehicleId', undefined);
    }
  };

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
      };

      // Add specific fields based on whether it's associated with a vehicle or not
      if (values.isAssociatedToVehicle) {
        payload.vehicleId = values.vehicleId;
      } else {
        payload.vehicleType = values.vehicleType;
      }

      // Add quantity only for creation
      if (!vehiclePart?.id) {
        payload.quantity = values.quantity;
      } else {
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

      const response = await fetch(`${API_BASE_URL}/vehicle-parts`, {
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

      const response = await fetch(`${API_BASE_URL}/vehicle-parts/${payload.id}`, {
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
    >      <Form
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
        </Form.Item>        <Form.Item
          name="description"
          label="Descripción (Opcional)"
          rules={[
            { max: 500, message: 'La descripción no puede exceder 500 caracteres' },
          ]}
        >
          <TextArea
            rows={2}
            placeholder="Descripción de la parte..."
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
            rows={2}
            placeholder="Observaciones adicionales..."
          />
        </Form.Item>

        {/* Cantidad inicial - solo visible en creación */}
        {!vehiclePart?.id && (
          <Form.Item
            name="quantity"
            label="Cantidad Inicial"
            rules={[
              { required: true, message: 'Por favor ingrese la cantidad inicial' },
              { type: 'number', min: 1, message: 'La cantidad debe ser mayor a 0' },
            ]}
          >
            <InputNumber
              min={1}
              style={{ width: '100%' }}
              placeholder="Cantidad inicial de la parte"
            />
          </Form.Item>
        )}        {/* Checkbox para asociar con vehículo */}
        <Form.Item
          name="isAssociatedToVehicle"
          valuePropName="checked"
        >
          <Checkbox onChange={(e) => handleAssociationChange(e.target.checked)}>
            ¿Parte asociada a un vehículo específico?
          </Checkbox>
        </Form.Item>

        {/* Campos condicionales según el checkbox */}
        {isAssociatedToVehicle ? (
          <Form.Item
            name="vehicleId"
            label="Vehículo Asociado"
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
        ) : (
          <Form.Item
            name="vehicleType"
            label="Tipo de Vehículo"
            rules={[
              { required: true, message: 'Por favor seleccione el tipo de vehículo' },
            ]}
          >
            <Select placeholder="Seleccione el tipo de vehículo">
              {VEHICLE_TYPES.map((type) => (
                <Option key={type.value} value={type.value}>
                  <i className={`fas fa-${type.icon}`} style={{ marginRight: 8 }} />
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
