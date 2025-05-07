import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

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
            title={<div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>{title}</div>}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
            centered
            footer={[
                <div key="submit" className="d-flex justify-content-center w-100">
                    <button
                        className="btn btn-primary w-25"
                        onClick={() => form.submit()}
                    >
                        Guardar
                    </button>
                </div>
            ]}
            closeIcon={<span className="close">&times;</span>}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={onSubmit}
                className="mt-3"
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
                                        if (!value || getFieldValue('password') === value) {
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
                    <Select placeholder="Seleccione el Rol">
                        <Select.Option value="ADMINISTRATOR">Administrador</Select.Option>
                        <Select.Option value="PROFESOR">Profesor</Select.Option>
                        <Select.Option value="ESTUDIANTE">Estudiante</Select.Option>
                        <Select.Option value="Administrador de herramientas">Administrador de herramientas</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};