import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../../../../src/modules/auth/components/LoginForm';

const mockLogin = jest.fn();

jest.mock('../../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const fillAndSubmitForm = async ({ username, password }: { username: string; password: string }) => {
  fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: username } });
  fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
};

describe('LoginForm', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders form fields and button', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText('Usuario')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText(/recordar mis datos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('submits form with correct credentials and navigates', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(<LoginForm />);
    await fillAndSubmitForm({ username: 'testuser', password: 'testpass' });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'testpass' });
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  test('shows error message on failed login', async () => {
    mockLogin.mockResolvedValue({ success: false, error: 'Credenciales inválidas' });

    render(<LoginForm />);
    await fillAndSubmitForm({ username: 'baduser', password: 'wrongpass' });

    expect(await screen.findByRole('alert')).toHaveTextContent(/credenciales inválidas/i);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('saves credentials in localStorage when rememberMe is checked', async () => {
    mockLogin.mockResolvedValue({ success: true });

    render(<LoginForm />);

    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'user123' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByLabelText(/recordar mis datos/i));
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(localStorage.getItem('rememberedUsername')).toBe('user123');
      expect(localStorage.getItem('rememberedPassword')).toBe('pass123');
    });
  });

  test('clears credentials from localStorage when rememberMe is not checked', async () => {
    localStorage.setItem('rememberedUsername', 'foo');
    localStorage.setItem('rememberedPassword', 'bar');
  
    mockLogin.mockResolvedValue({ success: true });
  
    render(<LoginForm />);
  
    fireEvent.change(screen.getByPlaceholderText('Usuario'), { target: { value: 'userX' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: 'passX' } });
  
    fireEvent.click(screen.getByLabelText(/recordar mis datos/i));
  
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
  
    await waitFor(() => {
      expect(localStorage.getItem('rememberedUsername')).toBe(null);
      expect(localStorage.getItem('rememberedPassword')).toBe(null);
    });
  });

  test('loads remembered credentials on mount', () => {
    localStorage.setItem('rememberedUsername', 'storedUser');
    localStorage.setItem('rememberedPassword', 'storedPass');

    render(<LoginForm />);

    expect(screen.getByPlaceholderText('Usuario')).toHaveValue('storedUser');
    expect(screen.getByPlaceholderText('Contraseña')).toHaveValue('storedPass');
    expect(screen.getByLabelText(/recordar mis datos/i)).toBeChecked();
  });
});
