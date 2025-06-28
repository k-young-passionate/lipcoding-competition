import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../pages/SignupPage';
import { renderWithProviders } from '../utils/testUtils';

// Mock axios
jest.mock('axios');

describe('SignupPage Component', () => {
    test('renders signup form elements', () => {
        renderWithProviders(<SignupPage />);
        
        expect(screen.getByText('새 계정을 만드세요')).toBeInTheDocument();
        expect(screen.getByLabelText('이메일 주소')).toBeInTheDocument();
        expect(screen.getByLabelText('비밀번호')).toBeInTheDocument();
        expect(screen.getByLabelText('이름')).toBeInTheDocument();
        expect(screen.getByLabelText('역할')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /계정 만들기/i })).toBeInTheDocument();
    });

    test('has correct input field IDs for testing', () => {
        renderWithProviders(<SignupPage />);
        
        expect(screen.getByLabelText('이메일 주소')).toHaveAttribute('id', 'email');
        expect(screen.getByLabelText('비밀번호')).toHaveAttribute('id', 'password');
        expect(screen.getByLabelText('이름')).toHaveAttribute('id', 'name');
        expect(screen.getByLabelText('역할')).toHaveAttribute('id', 'role');
        expect(screen.getByRole('button', { name: /계정 만들기/i })).toHaveAttribute('id', 'signup');
    });

    test('allows user to fill out signup form', async () => {
        renderWithProviders(<SignupPage />);
        
        const emailInput = screen.getByLabelText('이메일 주소');
        const passwordInput = screen.getByLabelText('비밀번호');
        const nameInput = screen.getByLabelText('이름');
        const roleSelect = screen.getByLabelText('역할');
        
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'password123');
        await userEvent.type(nameInput, 'John Doe');
        await userEvent.selectOptions(roleSelect, 'mentor');
        
        expect(emailInput).toHaveValue('newuser@example.com');
        expect(passwordInput).toHaveValue('password123');
        expect(nameInput).toHaveValue('John Doe');
        expect(roleSelect).toHaveValue('mentor');
    });

    test('shows role options correctly', () => {
        renderWithProviders(<SignupPage />);
        
        const roleSelect = screen.getByLabelText('역할');
        expect(roleSelect).toBeInTheDocument();
        
        const menteeOption = screen.getByRole('option', { name: '멘티' });
        const mentorOption = screen.getByRole('option', { name: '멘토' });
        
        expect(menteeOption).toBeInTheDocument();
        expect(mentorOption).toBeInTheDocument();
        expect(menteeOption).toHaveValue('mentee');
        expect(mentorOption).toHaveValue('mentor');
    });

    test('shows error message when signup fails', () => {
        renderWithProviders(<SignupPage />, {
            initialState: {
                auth: {
                    token: null,
                    isAuthenticated: false,
                    user: null,
                    loading: false,
                    error: 'Email already exists',
                }
            }
        });
        
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });

    test('shows loading state when submitting', () => {
        renderWithProviders(<SignupPage />, {
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
        
        expect(screen.getByText('계정 생성 중...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /계정 생성 중.../i })).toBeDisabled();
    });

    test('has link to login page', () => {
        renderWithProviders(<SignupPage />);
        
        expect(screen.getByText('기존 계정으로 로그인')).toBeInTheDocument();
    });
});
