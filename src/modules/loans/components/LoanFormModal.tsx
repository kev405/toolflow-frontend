import React, { useEffect, useRef } from 'react';
import { Modal, Form, Input, Row, Col, Button, Select, InputNumber, Tag, DatePicker, Checkbox } from 'antd';
import { LoanStatusTag } from './LoanStatusTag';
import { LoanToolTable } from './LoanToolTable';
import { LoanPayload } from '../pages/LoansPage';
import dayjs from 'dayjs';

interface ToolOption {
  id: number;
  toolName: string;
  consumable: boolean;
  available: number;
  status?: boolean;
}

interface LoanFormModalProps {
  teachers: { id: number; name: string }[];
  tools: ToolOption[];
  isCreating: boolean;
  status: string;
  open: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  title: string;
  initialValues?: LoanPayload;
}

const LoanFormModal: React.FC<LoanFormModalProps> = ({
  teachers,
  tools,
  status,
  isCreating,
  open,
  isAdmin,
  onClose,
  onSubmit,
  title,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const isCancelled = status === 'CANCELLED';
  const isFinalized = ["FINALIZED", "MISSING_FINALIZED", "DAMAGED_FINALIZED", "MISSING_AND_DAMAGED_FINALIZED"].includes(status);
  const originalLoanValuesRef = useRef<LoanPayload | null>(null);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        originalLoanValuesRef.current = initialValues;
        form.setFieldsValue({
          ...initialValues,
          dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : dayjs()
        });
      } else {
        form.setFieldsValue({
          dueDate: dayjs()
        });
      }
    }
  }, [open]);

  const toolsArray: { id: number; loaned?: number }[] = Array.isArray(originalLoanValuesRef.current?.tools)
    ? originalLoanValuesRef.current?.tools as { id: number; loaned?: number }[]
    : Object.entries(originalLoanValuesRef.current?.tools || {}).map(([id, tool]) => ({
      ...(typeof tool === 'object' && tool !== null ? tool : {}),
      id: Number(id),
    })) as { id: number; loaned?: number }[];

  const originalLoanedMap = toolsArray.reduce((acc, tool) => {
    acc[tool.id] = tool.loaned || 0;
    return acc;
  }, {} as Record<number, number>);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      onOk={() => form.submit()}
      title={
        <div style={{ display: 'flex', justifyContent: 'start', alignItems: 'center', gap: 8 }}>
          <span>{title}</span>
          <LoanStatusTag status={status} />
        </div>
      }
      width={1200}
      footer={[
        <div className="d-flex justify-content-center mt-4">
          <Button type="primary" htmlType="submit" form='loan-form' style={{ width: '50%' }} disabled={isCancelled}>
            Guardar
          </Button>
        </div>,
      ]}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          paddingRight: 24
        }
      }}
      centered
      destroyOnClose
    >
      <Form id="loan-form" form={form} layout="vertical" onFinish={onSubmit}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="teacherId"
              label="Docente"
              rules={[{ required: true, message: 'Selecciona un docente' }]}
            >
              <Select placeholder="Docente" disabled={!isAdmin || isFinalized} optionLabelProp='label' variant={!isAdmin || isFinalized ? 'borderless' : 'outlined'}>
                {teachers.map((teacher) => (
                  <Select.Option key={teacher.id} value={teacher.id} label={teacher.name}>
                    {teacher.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="responsibleId"
              label="Responsable Principal"
              rules={[{ required: true, message: 'Selecciona un estudiante' }]}
            >
              <Select placeholder="Responsable Principal" showSearch optionFilterProp="children" disabled={isCancelled || isFinalized} variant={isCancelled || isFinalized ? 'borderless' : 'outlined'}>
                {teachers.map((teacher) => (
                  <Select.Option key={teacher.id} value={teacher.id} label={teacher.name}>
                    {teacher.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="sameDay" valuePropName="checked" style={{ marginBottom: 8 }}>
              <Checkbox
                disabled={isCancelled || isFinalized}
                onChange={(e) => {
                  const checked = e.target.checked;
                  if (checked) {
                    form.setFieldsValue({ dueDate: dayjs() });
                  } else {
                    form.setFieldsValue({ dueDate: undefined });
                  }
                }}
              >
                ¿Entrega el mismo día?
              </Checkbox>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="dueDate"
              label="Fecha de Vencimiento"
            >
              <DatePicker
                format="YYYY-MM-DD"
                placeholder="Fecha de Vencimiento"
                style={{ width: '100%' }}
                disabled={Form.useWatch('sameDay', form) || isCancelled || isFinalized}
                variant={Form.useWatch('sameDay', form) ? 'borderless' : 'outlined'}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="toolOptions"
          label="Herramientas"
          rules={[{ required: true, message: 'Selecciona al menos una herramienta' }]}
        >
          <Select
            mode="multiple"
            placeholder="Herramientas"
            optionFilterProp="children"
            disabled={isCancelled || isFinalized}
          >
            {tools.map(tool => (
              <Select.Option
                key={tool.id}
                value={tool.id}
                disabled={!tool.status || tool.available === 0}
              >
                {tool.toolName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>


        <Form.Item noStyle shouldUpdate>
          {() => {
            let toolsData = [];

            if (isCreating) {
              toolsData = (form.getFieldValue('toolOptions') || []).map((id: number) => {
                const tool = tools.find(t => t.id === id);
                return {
                  ...tool,
                  loaned: 0,
                  delivered: 0,
                  damaged: 0,
                };
              });
            } else {
              const toolOptions = form.getFieldValue('toolOptions') || [];
              const existingToolsMap = form.getFieldValue('tools') ?? {};

              const filteredExisting = toolOptions
                .filter((id: number) => existingToolsMap[id])
                .map((id: number) => {
                  const toolMeta = tools.find(t => t.id === id);
                  const currentTool = existingToolsMap[id];
                  const originalLoaned = originalLoanedMap?.[id] || 0;

                  return {
                    id: toolMeta?.id || currentTool.id,
                    toolName: toolMeta?.toolName || currentTool.toolName || 'Desconocido',
                    consumable: toolMeta?.consumable ?? currentTool.consumable ?? false,
                    available: toolMeta?.available ?? currentTool.available ?? 0,
                    ...currentTool,
                    originalLoaned,
                  };
                });

              const newTools = toolOptions
                .filter((id: number) => !existingToolsMap[id])
                .map((id: number) => {
                  const tool = tools.find(t => t.id === id);
                  return {
                    ...tool,
                    loaned: 0,
                    delivered: 0,
                    damaged: 0,
                    originalLoaned: 0,
                  };
                });

              toolsData = [...filteredExisting, ...newTools];
            }

            return (
              <LoanToolTable form={form} toolsData={toolsData} isAdmin={isAdmin} isCreating={isCreating} teachers={teachers} loanStatus={status} isCancelled={isCancelled} />
            );
          }}
        </Form.Item>

        <Row gutter={16} className="mt-4">
          <Col span={12}>
            <Form.Item
              name="notes"
              label="Notas"
              rules={[{ max: 200, message: 'Máximo 200 caracteres' }]}
            >
              <Input.TextArea rows={1} maxLength={200} placeholder="Notas adicionales" disabled={isCancelled} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default LoanFormModal;
