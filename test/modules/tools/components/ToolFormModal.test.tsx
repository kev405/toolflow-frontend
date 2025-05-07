import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToolFormModal } from '../../../../src/modules/tools/components/ToolFormModal';
import '@testing-library/jest-dom';

// Mock explícito del CategorySelector
jest.mock('../../../../src/modules/tools/components/CategorySelector', () => () => (
  <div data-testid="category-selector" />
));

// Simular matchMedia necesario para Ant Design
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('ToolFormModal', () => {
  const mockProps = {
    open: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    title: 'Crear Herramienta',
    loading: false,
    categories: [
      { id: 1, name: 'Eléctrico', status: true },
      { id: 2, name: 'Mecánico', status: true },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza los campos del formulario', () => {
    render(<ToolFormModal {...mockProps} />);
    expect(screen.getByText('Crear Herramienta')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de Herramienta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Marca/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cantidad Disponible/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Registro Mínimo/i)).toBeInTheDocument();
    expect(screen.getByTestId('category-selector')).toBeInTheDocument();
  });

  it('ejecuta onSubmit con valores válidos', async () => {
    render(<ToolFormModal {...mockProps} />);
    
    fireEvent.change(screen.getByLabelText(/Nombre de Herramienta/i), { target: { value: 'Taladro' } });
    fireEvent.change(screen.getByLabelText(/Marca/i), { target: { value: 'Bosch' } });
    fireEvent.change(screen.getByLabelText(/Cantidad Disponible/i), { target: { value: 5 } });
    fireEvent.change(screen.getByLabelText(/Registro Mínimo/i), { target: { value: 2 } });

    fireEvent.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(mockProps.onSubmit).toHaveBeenCalled();
    });
  });

  it('cierra el modal al hacer clic en cerrar', () => {
    render(<ToolFormModal {...mockProps} />);
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('rellena el formulario si se proporcionan initialValues', () => {
    const initialValues = {
      toolName: 'Martillo',
      brand: 'Truper',
      available: 5,
      minimalRegistration: 1,
      consumable: true,
      notes: 'Usar con cuidado',
      category: 'Electricidad',
    };

    render(<ToolFormModal {...mockProps} initialValues={initialValues} />);
    
    expect(screen.getByDisplayValue('Martillo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Truper')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Usar con cuidado')).toBeInTheDocument();
  });
});
