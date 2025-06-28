import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';

// Components
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import MentorsPage from './pages/MentorsPage';
import RequestsPage from './pages/RequestsPage';
import Navbar from './components/Navbar';
import './App.css';

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

function App() {
    return (
        <Provider store={store}>
            <Router>
                <AppContent />
            </Router>
        </Provider>
    );
}

export default App;
