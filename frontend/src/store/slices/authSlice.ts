import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    user: {
        id: number;
        email: string;
        role: 'mentor' | 'mentee';
        profile?: {
            name: string;
            bio?: string;
            skills?: string[];
            imageUrl?: string;
        };
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    user: null,
    loading: false,
    error: null,
};

// Async thunks
export const signup = createAsyncThunk(
    'auth/signup',
    async (userData: {
        email: string;
        password: string;
        name: string;
        role: 'mentor' | 'mentee';
    }) => {
        const response = await axios.post(`${API_BASE_URL}/signup`, userData);
        return response.data;
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: { email: string; password: string }) => {
        const response = await axios.post(`${API_BASE_URL}/login`, credentials);
        return response.data;
    }
);

export const getCurrentUser = createAsyncThunk(
    'auth/getCurrentUser',
    async (_, { getState }) => {
        const state = getState() as { auth: AuthState };
        const token = state.auth.token;
        
        if (!token) {
            throw new Error('No token found');
        }

        const response = await axios.get(`${API_BASE_URL}/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
            localStorage.removeItem('token');
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Signup
            .addCase(signup.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signup.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(signup.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Signup failed';
            })
            // Login
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                localStorage.setItem('token', action.payload.token);
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Login failed';
            })
            // Get current user
            .addCase(getCurrentUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(getCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to get user data';
                // If token is invalid, logout
                if (action.error.message?.includes('401')) {
                    state.token = null;
                    state.isAuthenticated = false;
                    state.user = null;
                    localStorage.removeItem('token');
                }
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
