import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface Mentor {
    id: number;
    profile: {
        name: string;
        skills: string[];
        imageUrl?: string;
    };
}

interface MentorState {
    mentors: Mentor[];
    loading: boolean;
    error: string | null;
    searchSkill: string;
    sortBy: 'name' | 'skill' | 'id';
}

const initialState: MentorState = {
    mentors: [],
    loading: false,
    error: null,
    searchSkill: '',
    sortBy: 'id',
};

export const fetchMentors = createAsyncThunk(
    'mentor/fetchMentors',
    async (params: { skill?: string; order_by?: string }, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const token = state.auth.token;

        const queryParams = new URLSearchParams();
        if (params.skill) {
            queryParams.append('skill', params.skill);
        }
        if (params.order_by) {
            queryParams.append('order_by', params.order_by);
        }

        const url = `${API_BASE_URL}/mentors${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
);

const mentorSlice = createSlice({
    name: 'mentor',
    initialState,
    reducers: {
        setSearchSkill: (state, action) => {
            state.searchSkill = action.payload;
        },
        setSortBy: (state, action) => {
            state.sortBy = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMentors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMentors.fulfilled, (state, action) => {
                state.loading = false;
                state.mentors = action.payload;
            })
            .addCase(fetchMentors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch mentors';
            });
    },
});

export const { setSearchSkill, setSortBy, clearError } = mentorSlice.actions;
export default mentorSlice.reducer;
