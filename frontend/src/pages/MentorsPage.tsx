import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchMentors, setSearchSkill, setSortBy } from '../store/slices/mentorSlice';
import { createMatchRequest } from '../store/slices/matchRequestSlice';

const MentorsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { mentors, loading, error, searchSkill, sortBy } = useAppSelector(state => state.mentor);
    const { outgoingRequests } = useAppSelector(state => state.matchRequest);
    
    const [searchInput, setSearchInput] = useState('');
    const [selectedMentor, setSelectedMentor] = useState<number | null>(null);
    const [message, setMessage] = useState<{[key: number]: string}>({});

    useEffect(() => {
        dispatch(fetchMentors({ skill: searchSkill, order_by: sortBy === 'id' ? undefined : sortBy }));
    }, [dispatch, searchSkill, sortBy]);

    const handleSearch = () => {
        dispatch(setSearchSkill(searchInput.trim()));
    };

    const handleSortChange = (newSortBy: 'name' | 'skill' | 'id') => {
        dispatch(setSortBy(newSortBy));
    };

    const handleSendRequest = async (mentorId: number) => {
        if (!user || !message[mentorId]?.trim()) {
            alert('메시지를 입력해주세요.');
            return;
        }

        try {
            await dispatch(createMatchRequest({
                mentorId,
                menteeId: user.id,
                message: message[mentorId].trim()
            })).unwrap();
            
            alert('매칭 요청이 성공적으로 전송되었습니다.');
            setMessage(prev => ({ ...prev, [mentorId]: '' }));
            setSelectedMentor(null);
        } catch (error) {
            console.error('Failed to send match request:', error);
            alert('매칭 요청 전송에 실패했습니다.');
        }
    };

    const getRequestStatus = (mentorId: number) => {
        const request = outgoingRequests.find(req => req.mentorId === mentorId);
        return request?.status || null;
    };

    const isRequestPending = (mentorId: number) => {
        return getRequestStatus(mentorId) === 'pending';
    };

    if (!user || user.role !== 'mentee') {
        return <div className="text-center text-red-600">멘티만 접근할 수 있는 페이지입니다.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">멘토 찾기</h1>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="flex">
                            <input
                                id="search"
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="기술 스택으로 검색 (예: React, Python)"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <button
                                onClick={handleSearch}
                                className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                                검색
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button
                            id="name"
                            onClick={() => handleSortChange('name')}
                            className={`px-3 py-2 text-sm rounded-md ${
                                sortBy === 'name'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            이름순
                        </button>
                        <button
                            id="skill"
                            onClick={() => handleSortChange('skill')}
                            className={`px-3 py-2 text-sm rounded-md ${
                                sortBy === 'skill'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            스킬순
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-8">
                        <div className="text-gray-600">멘토 목록을 불러오는 중...</div>
                    </div>
                )}

                {!loading && mentors.length === 0 && (
                    <div className="text-center py-8 text-gray-600">
                        조건에 맞는 멘토가 없습니다.
                    </div>
                )}

                {/* Mentors List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mentors.map((mentor) => {
                        const requestStatus = getRequestStatus(mentor.id);
                        const isPending = isRequestPending(mentor.id);
                        
                        return (
                            <div key={mentor.id} className="mentor bg-gray-50 rounded-lg p-4 border">
                                <div className="flex items-center space-x-4 mb-4">
                                    <img
                                        src={mentor.profile.imageUrl 
                                            ? `http://localhost:8080/api${mentor.profile.imageUrl}`
                                            : 'https://placehold.co/500x500.jpg?text=MENTOR'
                                        }
                                        alt={mentor.profile.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {mentor.profile.name}
                                        </h3>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {mentor.profile.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {requestStatus && (
                                    <div className={`mb-3 px-3 py-2 rounded-md text-sm ${
                                        requestStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        requestStatus === 'accepted' ? 'bg-green-100 text-green-800' :
                                        requestStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>
                                        {requestStatus === 'pending' && '요청 대기 중'}
                                        {requestStatus === 'accepted' && '요청 수락됨'}
                                        {requestStatus === 'rejected' && '요청 거절됨'}
                                        {requestStatus === 'cancelled' && '요청 취소됨'}
                                    </div>
                                )}

                                {selectedMentor === mentor.id ? (
                                    <div className="space-y-3">
                                        <textarea
                                            id="message"
                                            data-mentor-id={mentor.id}
                                            data-testid={`message-${mentor.id}`}
                                            value={message[mentor.id] || ''}
                                            onChange={(e) => setMessage(prev => ({ ...prev, [mentor.id]: e.target.value }))}
                                            rows={3}
                                            placeholder="멘토링 요청 메시지를 작성해주세요..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                id="request"
                                                onClick={() => handleSendRequest(mentor.id)}
                                                className="flex-1 px-3 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                            >
                                                요청 보내기
                                            </button>
                                            <button
                                                onClick={() => setSelectedMentor(null)}
                                                className="px-3 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setSelectedMentor(mentor.id)}
                                        disabled={isPending}
                                        className={`w-full px-3 py-2 text-sm rounded-md ${
                                            isPending
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                                        }`}
                                    >
                                        {isPending ? '요청 대기 중' : '멘토링 요청'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MentorsPage;
