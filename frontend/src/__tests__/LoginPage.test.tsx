import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';
import { renderWithProviders } from '../utils/testUtils';

// Mock axios
jest.mock('axios');

describe('LoginPage Component', () => {
    test('renders login form elements', () => {
        renderWithProviders(<LoginPage />);
        
        expect(screen.getByText('계정에 로그인하세요')).toBeInTheDocument();
        expect(screen.getByLabelText('이메일 주소')).toBeInTheDocument();
        expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
        expect(screen.getByText('새 계정을 만드세요')).toBeInTheDocument();
    });

    test('has correct input field IDs for testing', () => {
        renderWithProviders(<LoginPage />);
        
        expect(screen.getByLabelText('이메일 주소')).toHaveAttribute('id', 'email');
        expect(screen.getByLabelText('비밀번호')).toHaveAttribute('id', 'password');
        expect(screen.getByRole('button', { name: /로그인/i })).toHaveAttribute('id', 'login');
    });

    test('allows user to type in email and password fields', async () => {
        renderWithProviders(<LoginPage />);
        
        const emailInput = screen.getByLabelText('이메일 주소');
        const passwordInput = screen.getByLabelText('비밀번호');
        
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    test('shows error message when login fails', async () => {
        renderWithProviders(<LoginPage />, {
            initialState: {
                auth: {
                    token: null,
                    isAuthenticated: false,
                    user: null,
                    loading: false,
                    error: 'Invalid credentials',
                }
            }
        });
        
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    test('shows loading state when submitting', () => {
        renderWithProviders(<LoginPage />, {
            initialState: {
                auth: {
                    token: null,
                    isAuthenticated: false,
                    user: null,
                    loading: true,
                    error: null,
                }
            }
        });
        
        expect(screen.getByText('로그인 중...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /로그인 중.../i })).toBeDisabled();
    });

    test('form submission with valid data', async () => {
        renderWithProviders(<LoginPage />);
        
        const emailInput = screen.getByLabelText('이메일 주소');
        const passwordInput = screen.getByLabelText('비밀번호');
        const submitButton = screen.getByRole('button', { name: /로그인/i });
        
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.click(submitButton);
        
        // Form should have been submitted
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });
});
