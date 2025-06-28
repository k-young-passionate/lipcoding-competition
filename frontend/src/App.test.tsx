import React, { useEffect } from 'react';
import { screen } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { renderWithProviders, mockAuthState } from './utils/testUtils';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import MentorsPage from './pages/MentorsPage';
import RequestsPage from './pages/RequestsPage';
import Navbar from './components/Navbar';

// Mock axios to prevent actual API calls during tests
jest.mock('axios');

// Create AppContent component for testing (like in App.tsx but without the Provider wrapper)
function AppContent() {
    const dispatch = useAppDispatch();
    const { isAuthenticated, token, user } = useAppSelector(state => state.auth);

    useEffect(() => {
        if (token && !user) {
            dispatch(getCurrentUser());
        }
    }, [dispatch, token, user]);

    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Routes>
                    <Route path="/profile" element={<ProfilePage />} />
                    {user?.role === 'mentee' && (
                        <Route path="/mentors" element={<MentorsPage />} />
                    )}
                    <Route path="/requests" element={<RequestsPage />} />
                    <Route path="/" element={<Navigate to="/profile" replace />} />
                    <Route path="*" element={<Navigate to="/profile" replace />} />
                </Routes>
            </main>
        </div>
    );
}

describe('App Component', () => {
    test('redirects to login when not authenticated', () => {
        const initialState = {
            auth: {
                token: null,
                isAuthenticated: false,
                user: null,
                loading: false,
                error: null,
            },
            user: { profile: null, loading: false, error: null },
            mentor: { mentors: [], loading: false, error: null, searchSkill: '', sortBy: 'id' },
            matchRequest: { incomingRequests: [], outgoingRequests: [], loading: false, error: null }
        };

        renderWithProviders(
            <AppContent />,
            { initialState, includeRouter: true }
        );
        
        // Should show login form elements
        expect(screen.getByText('계정에 로그인하세요')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
    });

    test('shows main app with navbar when authenticated', () => {
        const initialState = {
            auth: mockAuthState,
            user: { profile: null, loading: false, error: null },
            mentor: { mentors: [], loading: false, error: null, searchSkill: '', sortBy: 'id' },
            matchRequest: { incomingRequests: [], outgoingRequests: [], loading: false, error: null }
        };

        renderWithProviders(
            <AppContent />,
            { initialState, includeRouter: true }
        );
        
        // Should show navigation
        expect(screen.getByText('멘토-멘티 매칭')).toBeInTheDocument();
        expect(screen.getByText('프로필')).toBeInTheDocument();
        
        // Should show mentee-specific navigation
        expect(screen.getByText('멘토 찾기')).toBeInTheDocument();
        expect(screen.getByText('보낸 요청')).toBeInTheDocument();
    });

    test('shows mentor-specific navigation when user is mentor', () => {
        const mentorAuthState = {
            ...mockAuthState,
            user: {
                ...mockAuthState.user,
                role: 'mentor' as const
            }
        };

        const initialState = {
            auth: mentorAuthState,
            user: { profile: null, loading: false, error: null },
            mentor: { mentors: [], loading: false, error: null, searchSkill: '', sortBy: 'id' },
            matchRequest: { incomingRequests: [], outgoingRequests: [], loading: false, error: null }
        };

        renderWithProviders(
            <AppContent />,
            { initialState, includeRouter: true }
        );
        
        // Should not show mentee-specific navigation
        expect(screen.queryByText('멘토 찾기')).not.toBeInTheDocument();
        expect(screen.getByText('받은 요청')).toBeInTheDocument();
    });
});
