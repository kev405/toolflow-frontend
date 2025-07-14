import React, { useState, useEffect } from 'react';
import {
  Modal, Steps, Button, Form, Select,
  DatePicker, Input, InputNumber, message, Row, Col, Divider, Tag
} from 'antd';
import dayjs from 'dayjs';
import { TransferPayload, TransferFormData } from '../pages/TransfersPage';

const { Step } = Steps;

interface ItemOption {
  id: number;
  name: string;
  available?: number;
  availableQuantity?: number;
  headquarterId?: number | null;
  status?: boolean;
}

interface TransferFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: TransferPayload) => void;
  title: string;
  initialValues?: TransferFormData;
  responsibles: { id: number; name: string }[];
  headquarters: { id: number; name: string }[];
  tools: ItemOption[];
  toolsAll: ItemOption[]; // NUEVO: lista completa de herramientas
  vehicleParts: ItemOption[];
  vehiclePartsAll: ItemOption[];
  vehicles: ItemOption[];
  vehiclesAll: ItemOption[];
  availableVehicles: ItemOption[];
  availableVehicleParts: ItemOption[];
  onHeadquarterChange?: (headquarterId: number) => void;
  isCreating?: boolean;
  isEditing?: boolean;
  afterClose?: () => void;
}

const TransferFormModal: React.FC<TransferFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  title,
  initialValues,
  responsibles,
  headquarters,
  tools,
  toolsAll, // NUEVO
  vehicleParts,
  vehiclePartsAll,
  vehicles,
  vehiclesAll,
  availableVehicles,
  availableVehicleParts,
  onHeadquarterChange,
  afterClose,
}) => {
  const [form] = Form.useForm();
  const [current, setCurrent] = useState(0);
  const [selectedHeadquarterId, setSelectedHeadquarterId] = useState<number | undefined>();
  const [selectedDestinationHeadquarterId, setSelectedDestinationHeadquarterId] = useState<number | undefined>();
  const [hasInactiveTool, setHasInactiveTool] = useState(false);

  useEffect(() => {
    if (open) {
      // Resetear al primer paso cuando se abre el modal
      setCurrent(0);
      setSelectedHeadquarterId(undefined);
      
      form.setFieldsValue({
        ...initialValues,
        transferDate: initialValues?.transferDate ? dayjs(initialValues.transferDate) : dayjs(),
      });

      // Si estamos editando y tenemos una sede de origen, cargar los datos disponibles
      if (initialValues?.originHeadquarterId && onHeadquarterChange) {
        setSelectedHeadquarterId(initialValues.originHeadquarterId);
        onHeadquarterChange(initialValues.originHeadquarterId);
      }
    }
  }, [open, initialValues]);

  // Actualizar el estado cuando cambie la sede de origen
  useEffect(() => {
    const currentHeadquarterId = form.getFieldValue('originHeadquarterId');
    if (currentHeadquarterId !== selectedHeadquarterId) {
      setSelectedHeadquarterId(currentHeadquarterId);
      // Llamar a la función para cargar datos disponibles por sede
      if (currentHeadquarterId && onHeadquarterChange) {
        onHeadquarterChange(currentHeadquarterId);
      }
    }
    setSelectedDestinationHeadquarterId(form.getFieldValue('destinationHeadquarterId'));
  });

  // Eliminar el useEffect anterior de onFieldsChange
  useEffect(() => {
    if (current === 1) {
      const values = form.getFieldsValue(true);
      const selectedIds = values.tools?.map((item: any) => item?.id) || [];
      const inactive = selectedIds.some((id: number) => {
        const tool = toolsAll.find(t => t.id === id);
        return tool && tool.status === false;
      });
      setHasInactiveTool(inactive);
    } else {
      setHasInactiveTool(false);
    }
  }, [form, current, toolsAll]);

  const next = async () => {
    try {
      await form.validateFields();
      setCurrent(prev => prev + 1);
    } catch {
      message.warning('Por favor completa los campos requeridos');
    }
  };

  const prev = () => setCurrent(prev => prev - 1);

  const toolSelector = (
    fieldName: 'tools' | 'vehicleParts',
    items: ItemOption[],
    label: string
  ) => {
    // Obtener todos los ítems disponibles (incluyendo los que ya están seleccionados)
    // Para herramientas, filtrar las que tienen status false
    const allItems = fieldName === 'tools'
      ? items.filter(item => item.status !== false)
      : [...items];

    // Si estamos editando, agregar los ítems que ya están en el traslado pero no están disponibles
    if (initialValues && initialValues[fieldName]) {
      initialValues[fieldName]?.forEach((selectedItem: any) => {
        const exists = allItems.find(item => item.id === selectedItem.id);
        if (!exists) {
          // Buscar el nombre en la lista completa de herramientas/partes
          let itemName = '';
          let itemStatus = true; // Por defecto activo
          if (fieldName === 'tools') {
            const tool = toolsAll.find(t => t.id === selectedItem.id); // Buscar en la lista completa
            itemName = tool?.name || `Herramienta ID: ${selectedItem.id}`;
            itemStatus = tool?.status !== false; // Mantener el status original
            // Agregar SIEMPRE aunque esté inactiva, pero mostrar (INACTIVO) y deshabilitar
            allItems.push({
              id: selectedItem.id,
              name: tool ? itemName : `Herramienta ID: ${selectedItem.id}`,
              available: 0, // No disponible
              headquarterId: selectedHeadquarterId || null,
              status: tool?.status // Puede ser false
            });
          } else if (fieldName === 'vehicleParts') {
            const part = vehiclePartsAll.find(p => p.id === selectedItem.id);
            // Si no se encuentra en la lista completa, usar el name del objeto del formulario
            itemName = part?.name || selectedItem.name || `Parte ID: ${selectedItem.id}`;
            allItems.push({
              id: selectedItem.id,
              name: itemName,
              available: 0, // No disponible
              headquarterId: selectedHeadquarterId || null,
              status: part?.status // Puede ser false
            });
          }
        }
      });
    }

    // NUEVO: Validar si hay alguna herramienta inactiva seleccionada
    let hasInactiveTool = false;
    if (fieldName === 'tools') {
      const selectedIds = form.getFieldValue(fieldName)?.map((item: any) => item?.id) || [];
      hasInactiveTool = selectedIds.some((id: number) => {
        const tool = toolsAll.find(t => t.id === id);
        return tool && tool.status === false;
      });
    }

    return (
      <>
        <Divider>{label}</Divider>
        {!selectedHeadquarterId ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Primero selecciona una sede de origen para ver las {label.toLowerCase()} disponibles
          </div>
        ) : allItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No hay {label.toLowerCase()} disponibles en la sede seleccionada
          </div>
        ) : (
          <>
            <Form.List name={fieldName}>
              {(fields, { add, remove }) => {
                const selectedIds = form.getFieldValue(fieldName)?.map((item: any) => item?.id) || [];

                return (
                  <>
                    {fields.map(({ key, name, ...restField }) => {
                      const selectedItemId = form.getFieldValue([fieldName, name, 'id']);
                      let isInactive = false;
                      let errorMsg = undefined;
                      if (fieldName === 'tools' && selectedItemId) {
                        const tool = toolsAll.find(t => t.id === selectedItemId);
                        isInactive = !!(tool && tool.status === false);
                        if (isInactive) errorMsg = 'La herramienta seleccionada está inactiva. Por favor, elimínala del traslado para continuar.';
                      } else if (fieldName === 'vehicleParts' && selectedItemId) {
                        // Buscar solo en availableVehicleParts
                        const availablePart = availableVehicleParts.find(p => Number(p.id) === Number(selectedItemId));
                        isInactive = !availablePart || availablePart.available === 0;
                        if (isInactive) errorMsg = 'La parte seleccionada está inactiva. Por favor, elimínala del traslado para continuar.';
                      }
                      return (
                        <Row gutter={16} key={key}>
                          <Col span={16}>
                            <Form.Item
                              {...restField}
                              name={[name, 'id']}
                              rules={[{ required: true, message: `Selecciona ${label.toLowerCase()}` }]}
                              validateStatus={isInactive ? 'error' : undefined}
                              help={isInactive ? errorMsg : undefined}
                            >
                              <Select
                                placeholder={`Selecciona ${label.toLowerCase()}`}
                                showSearch
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                                }
                              >
                                {allItems
                                  .filter(item => !selectedIds.includes(item.id) || selectedIds.indexOf(item.id) === name)
                                  .map(item => (
                                    <Select.Option
                                      key={item.id}
                                      value={item.id}
                                      disabled={item.status === false}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{item.name.replace(/ \(INACTIVO\)$/, '')}</span>
                                        <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                                          {item.status === false && <Tag color="red">INACTIVA</Tag>}
                                          {(() => {
                                            const availablePart = availableVehicleParts.find(p => Number(p.id) === Number(item.id));
                                            return availablePart && availablePart.available === 0 ? <Tag color="red">INACTIVA</Tag> : null;
                                          })()}
                                        </div>
                                      </div>
                                    </Select.Option>
                                  ))}
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              {...restField}
                              name={[name, 'quantity']}
                              rules={[
                                { required: true, message: 'Cantidad requerida' },
                                {
                                  validator: (_, value) => {
                                    if (value) {
                                      const selectedItemId = form.getFieldValue([fieldName, name, 'id']);
                                      const selectedItem = allItems.find(item => item.id === selectedItemId);
                                      if (fieldName === 'vehicleParts') {
                                        const availablePart = availableVehicleParts.find(p => Number(p.id) === Number(selectedItemId));
                                        const availableQty = availablePart ? availablePart.available : 0;
                                        if (!availablePart || availableQty === 0) {
                                          return Promise.reject(new Error('La parte seleccionada no está disponible.'));
                                        }
                                        if (selectedItem && value > (availableQty ?? 0)) {
                                          return Promise.reject(new Error(`Máximo disponible: ${availableQty}`));
                                        }
                                      } else {
                                        const availableQty = selectedItem ? (selectedItem.available ?? 0) : 0;
                                        if (selectedItem && availableQty > 0 && value > availableQty) {
                                          return Promise.reject(new Error(`Máximo disponible: ${availableQty}`));
                                        }
                                      }
                                    }
                                    return Promise.resolve();
                                  }
                                }
                              ]}
                            >
                              <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                placeholder="Cantidad"
                              />
                            </Form.Item>
                          </Col>
                          <Col span={2}>
                            <Button onClick={() => remove(name)} danger>X</Button>
                          </Col>
                        </Row>
                      );
                    })}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block>
                        Agregar {label}
                      </Button>
                    </Form.Item>
                  </>
                );
              }}
            </Form.List>
          </>
        )}
      </>
    );
  };

  const vehicleSelector = (items: ItemOption[]) => {
    // Obtener todos los vehículos disponibles (incluyendo los que ya están seleccionados)
    const allVehiclesList = [...items];

    // Si estamos editando, agregar los vehículos que ya están en el traslado pero no están disponibles
    if (initialValues && initialValues.vehicles) {
      initialValues.vehicles.forEach((veh: any) => {
        const vehicleId = typeof veh === 'object' ? veh.id : veh;
        const exists = allVehiclesList.find(vehicle => vehicle.id === vehicleId);
        if (!exists) {
          // Buscar el nombre y status en la lista completa de vehículos
          const vehicle = vehiclesAll.find(v => v.id === vehicleId);
          // Si no se encuentra en la lista completa, usar el name del objeto del formulario
          const vehicleName = vehicle?.name || (typeof veh === 'object' ? veh.name : undefined) || `Vehículo ID: ${vehicleId}`;
          allVehiclesList.push({
            id: vehicleId,
            name: vehicleName,
            available: 0, // No disponible
            headquarterId: selectedHeadquarterId || null,
            status: vehicle?.status
          });
        }
      });
    }

    // Validar si hay algún vehículo inactivo seleccionado
    const selectedVehicleIds = form.getFieldValue('vehicles') || [];
    let hasInactiveVehicle = false;
    let vehicleErrorMsg = undefined;
    if (selectedVehicleIds.length > 0) {
      hasInactiveVehicle = selectedVehicleIds.some((id: number) => {
        const vehicle = vehiclesAll.find(v => v.id === id);
        return vehicle && (vehicle.status === false || vehicle.available === 0);
      });
      if (hasInactiveVehicle) vehicleErrorMsg = 'El vehículo seleccionado está inactivo. Por favor, elimínalo del traslado para continuar.';
    }

    return (
      <>
        <Divider>Vehículos Completos</Divider>
        {!selectedHeadquarterId ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Primero selecciona una sede de origen para ver los vehículos disponibles
          </div>
        ) : allVehiclesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            No hay vehículos disponibles en la sede seleccionada
          </div>
        ) : (
          <Form.Item name="vehicles" validateStatus={hasInactiveVehicle ? 'error' : undefined} help={hasInactiveVehicle ? vehicleErrorMsg : undefined}>
            <Select
              mode="multiple"
              placeholder="Selecciona vehículos"
              optionFilterProp="children"
            >
              {allVehiclesList.map(vehicle => (
                <Select.Option
                  key={vehicle.id}
                  value={vehicle.id}
                  disabled={vehicle.status === false}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{vehicle.name}</span>
                    <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
                      {vehicle.status === false && <Tag color="red">INACTIVA</Tag>}
                      {vehicle.available === 0 && vehicle.status !== false && <Tag color="red">INACTIVA</Tag>}
                    </div>
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
      </>
    );
  };

  const filteredTools = selectedHeadquarterId ? tools.filter(t => t.headquarterId === selectedHeadquarterId) : [];
  const filteredParts = selectedHeadquarterId ? availableVehicleParts : [];
  const filteredVehicles = selectedHeadquarterId ? availableVehicles : [];

  const steps = [
    {
      title: 'Información General',
      content: (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Responsable"
                name="responsibleId"
                rules={[{ required: true, message: 'Selecciona un responsable' }]}
              >
                <Select placeholder="Selecciona responsable">
                  {responsibles.map(r => (
                    <Select.Option key={r.id} value={r.id}>{r.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Fecha de traslado"
                name="transferDate"
                rules={[{ required: true, message: 'Selecciona una fecha' }]}
                initialValue={dayjs()}

              >
                <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Sede Origen"
                name="originHeadquarterId"
                rules={[{ required: true, message: 'Selecciona una sede de origen' }]}
              >
                <Select
                  placeholder="Selecciona sede origen"
                  onChange={value => {
                    setSelectedHeadquarterId(value);
                    // Si la sede destino es igual, límpiala
                    if (form.getFieldValue('destinationHeadquarterId') === value) {
                      form.setFieldsValue({ destinationHeadquarterId: undefined });
                    }
                    if (onHeadquarterChange) onHeadquarterChange(value);
                  }}
                >
                  {headquarters.map(hq => (
                    <Select.Option key={hq.id} value={hq.id}>
                      {hq.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Sede Destino"
                name="destinationHeadquarterId"
                rules={[{ required: true, message: 'Selecciona una sede de destino' }]}
              >
                <Select placeholder="Selecciona sede destino">
                  {headquarters
                    .filter(hq => hq.id !== form.getFieldValue('originHeadquarterId'))
                    .map(hq => (
                      <Select.Option key={hq.id} value={hq.id}>
                        {hq.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="Observaciones">
            <Input.TextArea rows={2} maxLength={200} />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Herramientas',
      content: toolSelector('tools', filteredTools, 'Herramientas'),
    },
    {
      title: 'Partes de Vehículo',
      content: toolSelector('vehicleParts', filteredParts, 'Partes de Vehículo'),
    },
    {
      title: 'Vehículos',
      content: vehicleSelector(filteredVehicles),
    },
  ];

  const handleFinish = () => {
    const values = form.getFieldsValue(true);

    const hasItems =
      (values.tools?.length ?? 0) > 0 ||
      (values.vehicleParts?.length ?? 0) > 0 ||
      (values.vehicles?.length ?? 0) > 0;

    if (!hasItems) {
      return message.error('Debes agregar al menos un ítem al traslado.');
    }

    // Validar el status de las herramientas
    const validateToolStatus = (items: any[], itemType: string) => {
      for (const item of items || []) {
        // Buscar la herramienta en la lista completa de herramientas
        const tool = toolsAll.find(t => t.id === item.id);
        if (tool && tool.status === false) {
          message.error(`${itemType}: La herramienta "${tool.name}" ya no está disponible (status inactivo). Por favor elimínala del traslado.`);
          return false;
        }
      }
      return true;
    };

    // Validar que no se exceda la cantidad disponible
    const validateQuantities = (items: any[], availableItems: ItemOption[], itemType: string) => {
      for (const item of items || []) {
        // Solo usar availableVehicleParts para partes de vehículo
        let availableItem = availableItems.find(ai => Number(ai.id) === Number(item.id));
        if (itemType === 'Partes de vehículo') {
          availableItem = availableVehicleParts.find(ai => Number(ai.id) === Number(item.id));
        }
        if (!availableItem || item.quantity > (availableItem.available ?? 0)) {
          message.error(`${itemType}: La cantidad de "${item.name}" excede lo disponible (${availableItem ? availableItem.available : 0})`);
          return false;
        }
      }
      return true;
    };

    // Validar status de herramientas primero
    const toolsStatusValid = validateToolStatus(values.tools, 'Herramientas');
    if (!toolsStatusValid) {
      return;
    }

    const toolsValid = validateQuantities(values.tools, filteredTools, 'Herramientas');
    const partsValid = validateQuantities(values.vehicleParts, filteredParts, 'Partes de vehículo');

    if (!toolsValid || !partsValid) {
      return;
    }

    const payload: TransferPayload = {
      ...values,
      transferDate: values.transferDate?.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      // Transformar tools al formato de la API
      tools: values.tools?.map((tool: any) => ({
        toolId: tool.id,
        quantity: tool.quantity
      })) || [],
      // Transformar vehicleParts al formato de la API
      vehicleParts: values.vehicleParts?.map((part: any) => ({
        partId: part.id,
        quantity: part.quantity
      })) || [],
      // Los vehicles ya vienen como array de números
      vehicles: values.vehicles || [],
    };

    onSubmit(payload);
  };

  // --- VALIDACIÓN DE BLOQUEO DE AVANCE ---
  // Detectar si hay partes o vehículos inactivos seleccionados
  const [hasInactivePart, setHasInactivePart] = useState(false);
  const [hasInactiveVehicle, setHasInactiveVehicle] = useState(false);
  useEffect(() => {
    if (current === 2) { // Paso de partes de vehículo
      const values = form.getFieldsValue(true);
      const selectedIds = values.vehicleParts?.map((item: any) => item?.id) || [];
      const inactive = selectedIds.some((id: number) => {
        const availablePart = availableVehicleParts.find(p => Number(p.id) === Number(id));
        return !availablePart || availablePart.available === 0;
      });
      setHasInactivePart(inactive);
    } else {
      setHasInactivePart(false);
    }
    if (current === 3) { // Paso de vehículos
      const values = form.getFieldsValue(true);
      const selectedIds = values.vehicles || [];
      const inactive = selectedIds.some((id: number) => {
        const vehicle = vehiclesAll.find(v => v.id === id);
        return vehicle && vehicle.status === false;
      });
      setHasInactiveVehicle(inactive);
    } else {
      setHasInactiveVehicle(false);
    }
  }, [form, current, vehiclePartsAll, vehiclesAll, availableVehicleParts]);
  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    if (current === 1) {
      const selectedIds = allValues.tools?.map((item: any) => item?.id) || [];
      const inactive = selectedIds.some((id: number) => {
        const tool = toolsAll.find(t => t.id === id);
        return tool && tool.status === false;
      });
      setHasInactiveTool(inactive);
    }
    if (current === 2) {
      const selectedIds = allValues.vehicleParts?.map((item: any) => item?.id) || [];
      const inactive = selectedIds.some((id: number) => {
        const availablePart = availableVehicleParts.find(p => Number(p.id) === Number(id));
        return !availablePart || availablePart.available === 0;
      });
      setHasInactivePart(inactive);
    }
    if (current === 3) {
      const selectedIds = allValues.vehicles || [];
      const inactive = selectedIds.some((id: number) => {
        const vehicle = vehiclesAll.find(v => v.id === id);
        return vehicle && vehicle.status === false;
      });
      setHasInactiveVehicle(inactive);
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      onCancel={() => {
        onClose();
        setCurrent(0);
        setSelectedHeadquarterId(undefined);
      }}
      afterClose={afterClose}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {current > 0 && current < steps.length && (
            <Button onClick={prev}>Atrás</Button>
          )}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={next} disabled={
              (current === 1 && hasInactiveTool) ||
              (current === 2 && hasInactivePart) ||
              (current === 3 && hasInactiveVehicle)
            }>Siguiente</Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" htmlType="submit" onClick={() => form.submit()} disabled={hasInactiveTool || hasInactivePart || hasInactiveVehicle}>
              Guardar Traslado
            </Button>
          )}
        </div>
      }
      width={1200}
      centered
      destroyOnClose
      styles={{
        body: {
          maxHeight: '70vh',
          minHeight: '30vh',
          overflowY: 'auto',
          paddingRight: 24
        }
      }}
    >
      <Steps current={current} size="small" style={{ marginBottom: 24 }}>
        {steps.map((s, i) => <Step key={i} title={s.title} />)}
      </Steps>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={initialValues}
        onValuesChange={handleFormValuesChange}
      >
        {steps[current].content}
      </Form>
    </Modal>
  );
};

export default TransferFormModal;
