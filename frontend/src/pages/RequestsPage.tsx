import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
    fetchIncomingRequests, 
    fetchOutgoingRequests, 
    acceptMatchRequest, 
    rejectMatchRequest, 
    cancelMatchRequest 
} from '../store/slices/matchRequestSlice';

const RequestsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { incomingRequests, outgoingRequests, loading, error } = useAppSelector(state => state.matchRequest);

    useEffect(() => {
        if (user?.role === 'mentor') {
            dispatch(fetchIncomingRequests());
        } else if (user?.role === 'mentee') {
            dispatch(fetchOutgoingRequests());
        }
    }, [dispatch, user?.role]);

    const handleAccept = async (requestId: number) => {
        try {
            await dispatch(acceptMatchRequest(requestId)).unwrap();
            alert('요청을 수락했습니다.');
        } catch (error) {
            console.error('Failed to accept request:', error);
            alert('요청 수락에 실패했습니다.');
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            await dispatch(rejectMatchRequest(requestId)).unwrap();
            alert('요청을 거절했습니다.');
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert('요청 거절에 실패했습니다.');
        }
    };

    const handleCancel = async (requestId: number) => {
        if (window.confirm('정말로 요청을 취소하시겠습니까?')) {
            try {
                await dispatch(cancelMatchRequest(requestId)).unwrap();
                alert('요청을 취소했습니다.');
            } catch (error) {
                console.error('Failed to cancel request:', error);
                alert('요청 취소에 실패했습니다.');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: '대기 중', className: 'bg-yellow-100 text-yellow-800' },
            accepted: { label: '수락됨', className: 'bg-green-100 text-green-800' },
            rejected: { label: '거절됨', className: 'bg-red-100 text-red-800' },
            cancelled: { label: '취소됨', className: 'bg-gray-100 text-gray-800' },
        } as const;

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                {config.label}
            </span>
        );
    };

    if (!user) {
        return <div className="text-center">로딩 중...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    {user.role === 'mentor' ? '받은 매칭 요청' : '보낸 매칭 요청'}
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="text-center py-8">
                        <div className="text-gray-600">요청 목록을 불러오는 중...</div>
                    </div>
                )}

                {/* Mentor View - Incoming Requests */}
                {user.role === 'mentor' && !loading && (
                    <div className="space-y-4">
                        {incomingRequests.length === 0 ? (
                            <div className="text-center py-8 text-gray-600">
                                받은 매칭 요청이 없습니다.
                            </div>
                        ) : (
                            incomingRequests.map((request: any) => (
                                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {request.menteeProfile?.name || '알 수 없는 멘티'}
                                            </h3>
                                            <div className="mt-1">
                                                {getStatusBadge(request.status)}
                                            </div>
                                        </div>
                                        <div id="request-status" className="text-sm text-gray-500">
                                            #{request.id}
                                        </div>
                                    </div>
                                    
                                    {request.message && (
                                        <div className="request-message bg-gray-50 p-3 rounded-md mb-4" data-mentee={request.menteeId}>
                                            <p className="text-gray-700">{request.message}</p>
                                        </div>
                                    )}
                                    
                                    {request.status === 'pending' && (
                                        <div className="flex gap-3">
                                            <button
                                                id="accept"
                                                onClick={() => handleAccept(request.id)}
                                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                            >
                                                수락
                                            </button>
                                            <button
                                                id="reject"
                                                onClick={() => handleReject(request.id)}
                                                className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                거절
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Mentee View - Outgoing Requests */}
                {user.role === 'mentee' && !loading && (
                    <div className="space-y-4">
                        {outgoingRequests.length === 0 ? (
                            <div className="text-center py-8 text-gray-600">
                                보낸 매칭 요청이 없습니다.
                            </div>
                        ) : (
                            outgoingRequests.map((request: any) => (
                                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {request.mentorProfile?.name || '알 수 없는 멘토'}
                                            </h3>
                                            {request.mentorProfile?.skills && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {request.mentorProfile.skills.map((skill: string, index: number) => (
                                                        <span
                                                            key={index}
                                                            className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="mt-2">
                                                {getStatusBadge(request.status)}
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            #{request.id}
                                        </div>
                                    </div>
                                    
                                    {request.message && (
                                        <div className="bg-gray-50 p-3 rounded-md mb-4">
                                            <p className="text-gray-700">{request.message}</p>
                                        </div>
                                    )}
                                    
                                    {request.status === 'pending' && (
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => handleCancel(request.id)}
                                                className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                            >
                                                요청 취소
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestsPage;
