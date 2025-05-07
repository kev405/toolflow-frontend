import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '../../../../src/modules/auth/pages/LoginPage';

// Mock del componente LoginForm
jest.mock('../../../../src/modules/auth/components/LoginForm', () => ({
  LoginForm: () => <div data-testid="login-form">Login Form</div>,
}));

// Mock del import de imagen
jest.mock('../../../../src/modules/auth/assets/logo-code-flow.png', () => 'mock-image-path');

describe('LoginPage', () => {
    test('renders LoginPage with background image and login form', () => {
        render(<LoginPage />);
      
        // Verifica que el formulario esté presente
        expect(screen.getByTestId('login-form')).toBeInTheDocument();
      
        // Verifica que el fondo tenga la imagen mockeada
        const imageDiv = screen.getByTestId('login-image');
        expect(imageDiv).toHaveStyle(`background-image: url(mock-image-path)`);
      });
      

  test('has correct layout structure', () => {
    const { container } = render(<LoginPage />);

    // Verifica que existe una clase de bootstrap principal
    expect(container.querySelector('.row.justify-content-center.align-items-center.vh-100.w-100')).toBeInTheDocument();

    // Verifica que el contenedor principal existe
    expect(container.querySelector('.container')).toBeInTheDocument();

    // Verifica que hay dos columnas principales
    expect(container.querySelectorAll('.col-lg-6').length).toBe(2);
  });
});
