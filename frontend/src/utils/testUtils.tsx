import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../store/slices/authSlice';
import userSlice from '../store/slices/userSlice';
import mentorSlice from '../store/slices/mentorSlice';
import matchRequestSlice from '../store/slices/matchRequestSlice';

// Create a test store factory
export const createTestStore = (preloadedState = {}) => {
    const store = configureStore({
        reducer: {
            auth: authSlice,
            user: userSlice,
            mentor: mentorSlice,
            matchRequest: matchRequestSlice,
        },
        preloadedState,
    });
    
    return store;
};

// Test wrapper component that provides Redux store and Router
export const TestWrapper = ({ 
    children, 
    initialState = {},
    store = createTestStore(initialState),
    includeRouter = true
}: {
    children: React.ReactNode;
    initialState?: any;
    store?: any;
    includeRouter?: boolean;
}) => {
    const content = (
        <Provider store={store}>
            {children}
        </Provider>
    );

    if (includeRouter) {
        return (
            <BrowserRouter>
                {content}
            </BrowserRouter>
        );
    }

    return content;
};

// Custom render function that includes providers
export const renderWithProviders = (
    ui: React.ReactElement,
    {
        initialState = {},
        store = createTestStore(initialState),
        includeRouter = true,
        ...renderOptions
    } = {}
) => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <TestWrapper store={store} includeRouter={includeRouter}>{children}</TestWrapper>
    );
    
    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock user data for testing
export const mockMentorUser = {
    id: 1,
    email: 'mentor@test.com',
    role: 'mentor' as const,
    profile: {
        name: 'Test Mentor',
        bio: 'Test mentor bio',
        skills: ['React', 'Node.js'],
        imageUrl: '/images/mentor/1'
    }
};

export const mockMenteeUser = {
    id: 2,
    email: 'mentee@test.com',
    role: 'mentee' as const,
    profile: {
        name: 'Test Mentee',
        bio: 'Test mentee bio',
        imageUrl: '/images/mentee/2'
    }
};

export const mockAuthState = {
    token: 'mock-jwt-token',
    isAuthenticated: true,
    user: mockMenteeUser,
    loading: false,
    error: null,
};

export const mockMentors = [
    {
        id: 1,
        profile: {
            name: 'John Doe',
            skills: ['React', 'TypeScript'],
            imageUrl: '/images/mentor/1'
        }
    },
    {
        id: 2,
        profile: {
            name: 'Jane Smith',
            skills: ['Python', 'Django'],
            imageUrl: '/images/mentor/2'
        }
    }
];

export const mockMatchRequests = [
    {
        id: 1,
        mentorId: 1,
        menteeId: 2,
        message: 'Hello, I would like mentoring',
        status: 'pending' as const,
        mentorProfile: {
            name: 'John Doe',
            skills: ['React', 'TypeScript']
        }
    }
];
