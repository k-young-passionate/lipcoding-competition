import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface UserState {
    profile: {
        id: number;
        name: string;
        bio?: string;
        skills?: string[];
        imageUrl?: string;
        role: 'mentor' | 'mentee';
    } | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    profile: null,
    loading: false,
    error: null,
};

export const updateProfile = createAsyncThunk(
    'user/updateProfile',
    async (profileData: {
        id: number;
        name: string;
        role: 'mentor' | 'mentee';
        bio?: string;
        image?: string;
        skills?: string[];
    }, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const token = state.auth.token;

        const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setProfile: (state, action) => {
            state.profile = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update profile';
            });
    },
});

export const { clearError, setProfile } = userSlice.actions;
export default userSlice.reducer;
