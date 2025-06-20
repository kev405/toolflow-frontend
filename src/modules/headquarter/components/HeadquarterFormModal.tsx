import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col, Button, Select } from 'antd';
import { HeadquarterPayload } from '../pages/HeadquarterPage';

interface HeadquarterFormModalProps {
  id?: number;
  open: boolean;
  onClose: () => void;
  onSubmit: (values: HeadquarterPayload) => void;
  initialValues?: any;
  title: string;
  loading?: boolean;
  responsibles: { id: number; name: string }[];
}

const HeadquarterFormModal: React.FC<HeadquarterFormModalProps> = ({
  id,
  open,
  onClose,
  onSubmit,
  initialValues,
  title,
  loading = false,
  responsibles
}) => {
  const [form] = Form.useForm();

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

  return (
    <Modal
      open={open}
      title={title}
      onCancel={handleClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      centered
      footer={[
        <div className="d-flex justify-content-center mt-4" key="footer">
          <Button type="primary" htmlType="submit" form="headquarter-form" style={{ width: '50%' }}>
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
        id="headquarter-form"
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="name"
              label="Nombre de la Sede"
              rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
            >
              <Input placeholder="Nombre de la sede" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="address"
              label="Dirección"
              rules={[{ required: true, message: 'Por favor ingresa la dirección' }]}
            >
              <Input placeholder="Dirección de la sede" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="responsibleId" label="Responsable">
              <Select placeholder="Selecciona responsable" allowClear>
                {responsibles.map((r) => (
                  <Select.Option key={r.id} value={r.id}>
                    {r.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default HeadquarterFormModal;
