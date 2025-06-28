import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';

const Navbar: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAppSelector(state => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-4">
                        <Link to="/profile" className="text-xl font-bold text-primary-600">
                            멘토-멘티 매칭
                        </Link>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                        <Link 
                            to="/profile" 
                            className="text-gray-700 hover:text-primary-600 transition-colors"
                        >
                            프로필
                        </Link>
                        
                        {user?.role === 'mentee' && (
                            <Link 
                                to="/mentors" 
                                className="text-gray-700 hover:text-primary-600 transition-colors"
                            >
                                멘토 찾기
                            </Link>
                        )}
                        
                        <Link 
                            to="/requests" 
                            className="text-gray-700 hover:text-primary-600 transition-colors"
                        >
                            {user?.role === 'mentor' ? '받은 요청' : '보낸 요청'}
                        </Link>
                        
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                {user?.profile?.name || user?.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition-colors"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
