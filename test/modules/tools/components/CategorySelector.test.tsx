import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Form } from 'antd';
import CategorySelector from '../../../../src/modules/tools/components/CategorySelector';

describe('CategorySelector', () => {
  const categories = [
    { id: 1, name: 'Electricidad' },
    { id: 2, name: 'Mecánica' },
  ];

  const renderWithForm = () =>
    render(
      <Form>
        <CategorySelector categories={categories} />
      </Form>
    );

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

  it('muestra el selector de categorías por defecto', () => {
    renderWithForm();

    expect(screen.getByText('¿Agregar nueva categoría?')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();

    const select = screen.getByRole('combobox');
    fireEvent.mouseDown(select);

    expect(screen.getAllByText('Electricidad').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mecánica').length).toBeGreaterThan(0);

  });

  it('cambia a campo de texto cuando se activa el switch', () => {
    renderWithForm();
    fireEvent.click(screen.getByRole('switch'));
    expect(screen.getByPlaceholderText('Nombre de la nueva categoría')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('cambia de nuevo al select cuando se desactiva el switch', () => {
    renderWithForm();
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle); // activa
    fireEvent.click(toggle); // desactiva
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
