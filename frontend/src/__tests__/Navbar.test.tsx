import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../components/Navbar';
import { renderWithProviders, mockMentorUser, mockMenteeUser } from '../utils/testUtils';

describe('Navbar Component', () => {
    test('renders navbar with brand name', () => {
        renderWithProviders(<Navbar />, {
            initialState: {
                auth: {
                    token: 'mock-token',
                    isAuthenticated: true,
                    user: mockMenteeUser,
                    loading: false,
                    error: null,
                }
            }
        });
        
        expect(screen.getByText('멘토-멘티 매칭')).toBeInTheDocument();
    });

    test('shows mentee navigation items when user is mentee', () => {
        renderWithProviders(<Navbar />, {
            initialState: {
                auth: {
                    token: 'mock-token',
                    isAuthenticated: true,
                    user: mockMenteeUser,
                    loading: false,
                    error: null,
                }
            }
        });
        
        expect(screen.getByText('프로필')).toBeInTheDocument();
        expect(screen.getByText('멘토 찾기')).toBeInTheDocument();
        expect(screen.getByText('보낸 요청')).toBeInTheDocument();
        expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    test('shows mentor navigation items when user is mentor', () => {
        renderWithProviders(<Navbar />, {
            initialState: {
                auth: {
                    token: 'mock-token',
                    isAuthenticated: true,
                    user: mockMentorUser,
                    loading: false,
                    error: null,
                }
            }
        });
        
        expect(screen.getByText('프로필')).toBeInTheDocument();
        expect(screen.queryByText('멘토 찾기')).not.toBeInTheDocument();
        expect(screen.getByText('받은 요청')).toBeInTheDocument();
        expect(screen.getByText('로그아웃')).toBeInTheDocument();
    });

    test('displays user name in navbar', () => {
        renderWithProviders(<Navbar />, {
            initialState: {
                auth: {
                    token: 'mock-token',
                    isAuthenticated: true,
                    user: mockMenteeUser,
                    loading: false,
                    error: null,
                }
            }
        });
        
        expect(screen.getByText('Test Mentee')).toBeInTheDocument();
    });

    test('displays user email when no profile name available', () => {
        const userWithoutProfileName = {
            ...mockMenteeUser,
            profile: {
                ...mockMenteeUser.profile,
                name: ''
            }
        };

        renderWithProviders(<Navbar />, {
            initialState: {
                auth: {
                    token: 'mock-token',
                    isAuthenticated: true,
                    user: userWithoutProfileName,
                    loading: false,
                    error: null,
                }
            }
        });
        
        expect(screen.getByText('mentee@test.com')).toBeInTheDocument();
    });

    test('logout button triggers logout action', async () => {
        const { store } = renderWithProviders(<Navbar />, {
            initialState: {
                auth: {
                    token: 'mock-token',
                    isAuthenticated: true,
                    user: mockMenteeUser,
                    loading: false,
                    error: null,
                }
            }
        });
        
        const logoutButton = screen.getByText('로그아웃');
        await userEvent.click(logoutButton);
        
        // Check if logout action was dispatched by checking the state
        const state = store.getState();
        expect(state.auth.isAuthenticated).toBe(false);
        expect(state.auth.token).toBe(null);
        expect(state.auth.user).toBe(null);
    });
});
