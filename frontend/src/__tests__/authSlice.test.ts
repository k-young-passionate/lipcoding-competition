import authReducer, { 
    login, 
    signup, 
    logout, 
    clearError, 
    getCurrentUser 
} from '../store/slices/authSlice';

// Mock axios
jest.mock('axios');

describe('authSlice', () => {
    const initialState = {
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
    };

    test('should return the initial state', () => {
        expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    test('should handle logout', () => {
        const previousState = {
            token: 'mock-token',
            isAuthenticated: true,
            user: { id: 1, email: 'test@test.com', role: 'mentee' as const },
            loading: false,
            error: null,
        };

        expect(authReducer(previousState, logout())).toEqual(initialState);
    });

    test('should handle clearError', () => {
        const previousState = {
            ...initialState,
            error: 'Some error',
        };

        expect(authReducer(previousState, clearError())).toEqual({
            ...previousState,
            error: null,
        });
    });

    test('should handle login pending', () => {
        const action = { type: login.pending.type };
        const state = authReducer(initialState, action);
        
        expect(state).toEqual({
            ...initialState,
            loading: true,
            error: null,
        });
    });

    test('should handle login fulfilled', () => {
        const mockToken = 'mock-jwt-token';
        const action = { 
            type: login.fulfilled.type, 
            payload: { token: mockToken }
        };
        const state = authReducer(initialState, action);
        
        expect(state).toEqual({
            ...initialState,
            loading: false,
            token: mockToken,
            isAuthenticated: true,
        });
    });

    test('should handle login rejected', () => {
        const mockError = 'Login failed';
        const action = { 
            type: login.rejected.type, 
            error: { message: mockError }
        };
        const state = authReducer(initialState, action);
        
        expect(state).toEqual({
            ...initialState,
            loading: false,
            error: mockError,
        });
    });

    test('should handle signup pending', () => {
        const action = { type: signup.pending.type };
        const state = authReducer(initialState, action);
        
        expect(state).toEqual({
            ...initialState,
            loading: true,
            error: null,
        });
    });

    test('should handle signup fulfilled', () => {
        const action = { type: signup.fulfilled.type };
        const state = authReducer(initialState, action);
        
        expect(state).toEqual({
            ...initialState,
            loading: false,
        });
    });

    test('should handle signup rejected', () => {
        const mockError = 'Signup failed';
        const action = { 
            type: signup.rejected.type, 
            error: { message: mockError }
        };
        const state = authReducer(initialState, action);
        
        expect(state).toEqual({
            ...initialState,
            loading: false,
            error: mockError,
        });
    });

    test('should handle getCurrentUser pending', () => {
        const action = { type: getCurrentUser.pending.type };
        const state = authReducer(initialState, action);
        
        expect(state).toEqual({
            ...initialState,
            loading: true,
        });
    });

    test('should handle getCurrentUser fulfilled', () => {
        const mockUser = {
            id: 1,
            email: 'test@test.com',
            role: 'mentee' as const,
            profile: {
                name: 'Test User',
                bio: 'Test bio'
            }
        };
        const action = { 
            type: getCurrentUser.fulfilled.type, 
            payload: mockUser
        };
        const state = authReducer(initialState, action);
        
        expect(state).toEqual({
            ...initialState,
            loading: false,
            user: mockUser,
        });
    });

    test('should handle getCurrentUser rejected with 401 error', () => {
        const previousState = {
            token: 'invalid-token',
            isAuthenticated: true,
            user: { id: 1, email: 'test@test.com', role: 'mentee' as const },
            loading: false,
            error: null,
        };

        const action = { 
            type: getCurrentUser.rejected.type, 
            error: { message: '401 Unauthorized' }
        };
        const state = authReducer(previousState, action);
        
        expect(state).toEqual({
            token: null,
            isAuthenticated: false,
            user: null,
            loading: false,
            error: '401 Unauthorized',
        });
    });
});
