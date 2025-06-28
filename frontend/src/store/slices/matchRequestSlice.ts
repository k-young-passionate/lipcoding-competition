import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface MatchRequest {
    id: number;
    mentorId?: number;
    menteeId?: number;
    message?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
    mentorProfile?: {
        name: string;
        skills: string[];
    };
    menteeProfile?: {
        name: string;
    };
}

interface MatchRequestState {
    incomingRequests: MatchRequest[];
    outgoingRequests: MatchRequest[];
    loading: boolean;
    error: string | null;
}

const initialState: MatchRequestState = {
    incomingRequests: [],
    outgoingRequests: [],
    loading: false,
    error: null,
};

export const createMatchRequest = createAsyncThunk(
    'matchRequest/create',
    async (requestData: { mentorId: number; menteeId: number; message: string }, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const token = state.auth.token;

        const response = await axios.post(`${API_BASE_URL}/match-requests`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    }
);

export const fetchIncomingRequests = createAsyncThunk(
    'matchRequest/fetchIncoming',
    async (_, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const token = state.auth.token;

        const response = await axios.get(`${API_BASE_URL}/match-requests/incoming`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
);

export const fetchOutgoingRequests = createAsyncThunk(
    'matchRequest/fetchOutgoing',
    async (_, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const token = state.auth.token;

        const response = await axios.get(`${API_BASE_URL}/match-requests/outgoing`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
);

export const acceptMatchRequest = createAsyncThunk(
    'matchRequest/accept',
    async (requestId: number, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const token = state.auth.token;

        const response = await axios.put(`${API_BASE_URL}/match-requests/${requestId}/accept`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
);

export const rejectMatchRequest = createAsyncThunk(
    'matchRequest/reject',
    async (requestId: number, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const token = state.auth.token;

        const response = await axios.put(`${API_BASE_URL}/match-requests/${requestId}/reject`, {}, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
);

export const cancelMatchRequest = createAsyncThunk(
    'matchRequest/cancel',
    async (requestId: number, { getState }) => {
        const state = getState() as { auth: { token: string } };
        const token = state.auth.token;

        const response = await axios.delete(`${API_BASE_URL}/match-requests/${requestId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    }
);

const matchRequestSlice = createSlice({
    name: 'matchRequest',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create match request
            .addCase(createMatchRequest.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createMatchRequest.fulfilled, (state, action) => {
                state.loading = false;
                state.outgoingRequests.push(action.payload);
            })
            .addCase(createMatchRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create match request';
            })
            // Fetch incoming requests
            .addCase(fetchIncomingRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchIncomingRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.incomingRequests = action.payload;
            })
            .addCase(fetchIncomingRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch incoming requests';
            })
            // Fetch outgoing requests
            .addCase(fetchOutgoingRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOutgoingRequests.fulfilled, (state, action) => {
                state.loading = false;
                state.outgoingRequests = action.payload;
            })
            .addCase(fetchOutgoingRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch outgoing requests';
            })
            // Accept match request
            .addCase(acceptMatchRequest.fulfilled, (state, action) => {
                const requestIndex = state.incomingRequests.findIndex(req => req.id === action.payload.id);
                if (requestIndex !== -1) {
                    state.incomingRequests[requestIndex].status = 'accepted';
                }
            })
            // Reject match request
            .addCase(rejectMatchRequest.fulfilled, (state, action) => {
                const requestIndex = state.incomingRequests.findIndex(req => req.id === action.payload.id);
                if (requestIndex !== -1) {
                    state.incomingRequests[requestIndex].status = 'rejected';
                }
            })
            // Cancel match request
            .addCase(cancelMatchRequest.fulfilled, (state, action) => {
                const requestIndex = state.outgoingRequests.findIndex(req => req.id === action.payload.id);
                if (requestIndex !== -1) {
                    state.outgoingRequests[requestIndex].status = 'cancelled';
                }
            });
    },
});

export const { clearError } = matchRequestSlice.actions;
export default matchRequestSlice.reducer;
