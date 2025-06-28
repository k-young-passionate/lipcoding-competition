import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import userSlice from './slices/userSlice';
import mentorSlice from './slices/mentorSlice';
import matchRequestSlice from './slices/matchRequestSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        user: userSlice,
        mentor: mentorSlice,
        matchRequest: matchRequestSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
