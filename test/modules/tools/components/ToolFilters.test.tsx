import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToolFilters } from '../../../../src/modules/tools/components/ToolFilters';
import '@testing-library/jest-dom';

// 👇 Mocks para Ant Design que evita errores de entorno
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), // obsoleto
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });

  class ResizeObserverMock {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  }
  global.ResizeObserver = ResizeObserverMock as any;
});

describe('ToolFilters', () => {
  const mockProps = {
    searchName: '',
    searchBrand: '',
    selectedCategory: null,
    categories: [
      { id: 1, name: 'Electricidad', status: true },
      { id: 2, name: 'Mecánica', status: true },
    ],
    onSearchNameChange: jest.fn(),
    onSearchBrandChange: jest.fn(),
    onCategoryChange: jest.fn(),
    onCreateClick: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza los filtros y el botón de crear', () => {
    render(<ToolFilters {...mockProps} />);
  
    expect(screen.getByPlaceholderText('Buscar por nombre')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Buscar por marca')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // Cambio aquí
    expect(screen.getByRole('button', { name: /crear herramienta/i })).toBeInTheDocument();
  });

  it('dispara los callbacks al cambiar valores', () => {
    render(<ToolFilters {...mockProps} />);
  
    fireEvent.change(screen.getByPlaceholderText('Buscar por nombre'), {
      target: { value: 'Taladro' },
    });
    expect(mockProps.onSearchNameChange).toHaveBeenCalledWith('Taladro');
  
    fireEvent.change(screen.getByPlaceholderText('Buscar por marca'), {
      target: { value: 'Bosch' },
    });
    expect(mockProps.onSearchBrandChange).toHaveBeenCalledWith('Bosch');
  
    // Usa getByRole porque Select de AntD no expone placeholder directamente
    const categorySelect = screen.getByRole('combobox');
    fireEvent.mouseDown(categorySelect); // abre el dropdown
  
    // Usa getAllByText para evitar conflicto con duplicados internos de AntD
    const option = screen.getAllByText('Electricidad')[0];
    fireEvent.click(option);
  
    expect(mockProps.onCategoryChange).toHaveBeenCalledWith(1);
  });

  it('ejecuta onCreateClick al presionar el botón', () => {
    render(<ToolFilters {...mockProps} />);
    fireEvent.click(screen.getByRole('button', { name: /crear herramienta/i }));
    expect(mockProps.onCreateClick).toHaveBeenCalled();
  });
});
