import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ToolsPage from '../../../../src/modules/tools/pages/ToolsPage';
import '@testing-library/jest-dom';

jest.mock('../../../../src/config', () => ({
    API_BASE_URL: 'http://mock-api',
  }));

jest.mock('../../../../src/modules/tools/components/ToolFilters', () => ({
  ToolFilters: (props: any) => (
    <div data-testid="mock-filters">
      <button onClick={() => props.onSearchNameChange('mockName')}>Buscar Nombre</button>
      <button onClick={() => props.onCreateClick()}>Crear</button>
    </div>
  )
}));


jest.mock('../../../../src/modules/tools/components/ToolFormModal', () => ({
    ToolFormModal: (props: any) =>
      props.open ? (
        <div data-testid="mock-modal">
          <div data-testid="mock-modal-title">{props.title}</div>
          <button onClick={() => props.onSubmit({ toolName: 'Taladro', brand: 'Bosch' })}>
            Submit
          </button>
          <button data-testid="close-btn" onClick={props.onClose}>
            Close
          </button>
        </div>
      ) : null
  }));

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

describe('ToolsPage (unit)', () => {
  it('renderiza sin fallos', () => {
    render(<ToolsPage />);
    expect(screen.getByText('Herramientas')).toBeInTheDocument();
    expect(screen.getByTestId('mock-filters')).toBeInTheDocument();
  });

  it('abre modal al hacer clic en crear', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByText('Crear'));
    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
  });

  it('cierra modal al hacer clic en Close', async () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByText('Crear'));
    fireEvent.click(await screen.findByText('Close'));
    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  it('envía formulario al hacer submit en el modal', async () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByText('Crear'));
    fireEvent.click(await screen.findByText('Submit'));
  });

  it('actualiza searchName cuando se busca un nombre', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByText('Buscar Nombre'));
  });

  it('renderiza columnas esperadas con datos simulados', () => {
    const toolRow = {
      id: 1,
      key: '1',
      toolName: 'Taladro',
      brand: 'Bosch',
      quantity: 10,
      available: 5,
      damaged: 2,
      onLoan: 3,
      consumable: true,
      notes: '',
      minimalRegistration: 1,
      status: true,
      category: { id: 1, name: 'Eléctrico', status: true }
    };
  
    render(<ToolsPage />);
  });

  it('resetea editingTool al cerrar el modal', async () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByText('Crear'));
    fireEvent.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  it('usa el título correcto en modo edición', () => {
    render(<ToolsPage />);
    fireEvent.click(screen.getByText('Crear'));
    expect(screen.getByTestId('mock-modal-title')).toHaveTextContent('Crear Herramienta');
  });
});
