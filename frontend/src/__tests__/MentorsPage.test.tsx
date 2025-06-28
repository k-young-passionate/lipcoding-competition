import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MentorsPage from '../pages/MentorsPage';
import { renderWithProviders, mockMenteeUser, mockMentors, mockMentorUser } from '../utils/testUtils';

describe('MentorsPage Component', () => {
    const initialMenteeState = {
        auth: {
            token: 'mock-token',
            isAuthenticated: true,
            user: mockMenteeUser,
            loading: false,
            error: null,
        },
        mentor: {
            mentors: mockMentors,
            loading: false,
            error: null,
            searchSkill: '',
            sortBy: 'id' as const,
        },
        matchRequest: {
            incomingRequests: [],
            outgoingRequests: [],
            loading: false,
            error: null,
        }
    };

    test('renders mentors page for mentee user', () => {
        renderWithProviders(<MentorsPage />, {
            initialState: initialMenteeState
        });
        
        expect(screen.getByText('멘토 찾기')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('기술 스택으로 검색 (예: React, Python)')).toBeInTheDocument();
        expect(screen.getByText('검색')).toBeInTheDocument();
        expect(screen.getByText('이름순')).toBeInTheDocument();
        expect(screen.getByText('스킬순')).toBeInTheDocument();
    });

    test('displays mentor cards with correct information', () => {
        renderWithProviders(<MentorsPage />, {
            initialState: initialMenteeState
        });
        
        // Check if mentor names are displayed
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        
        // Check if skills are displayed
        expect(screen.getByText('React')).toBeInTheDocument();
        expect(screen.getByText('TypeScript')).toBeInTheDocument();
        expect(screen.getByText('Python')).toBeInTheDocument();
        expect(screen.getByText('Django')).toBeInTheDocument();
        
        // Check if mentor class is applied
        const mentorCards = screen.getAllByText(/멘토링 요청/);
        expect(mentorCards).toHaveLength(2);
    });

    test('has correct search input ID for testing', () => {
        renderWithProviders(<MentorsPage />, {
            initialState: initialMenteeState
        });
        
        expect(screen.getByPlaceholderText('기술 스택으로 검색 (예: React, Python)')).toHaveAttribute('id', 'search');
    });

    test('has correct sort button IDs for testing', () => {
        renderWithProviders(<MentorsPage />, {
            initialState: initialMenteeState
        });
        
        expect(screen.getByText('이름순')).toHaveAttribute('id', 'name');
        expect(screen.getByText('스킬순')).toHaveAttribute('id', 'skill');
    });

    test('allows searching by skill', async () => {
        renderWithProviders(<MentorsPage />, {
            initialState: initialMenteeState
        });
        
        const searchInput = screen.getByPlaceholderText('기술 스택으로 검색 (예: React, Python)');
        const searchButton = screen.getByText('검색');
        
        await userEvent.type(searchInput, 'React');
        await userEvent.click(searchButton);
        
        expect(searchInput).toHaveValue('React');
    });

    test('shows message request dialog when mentor card is clicked', async () => {
        renderWithProviders(<MentorsPage />, {
            initialState: initialMenteeState
        });
        
        const mentorCards = screen.getAllByText('멘토링 요청');
        await userEvent.click(mentorCards[0]);
        
        // Should show message textarea
        expect(screen.getByPlaceholderText('멘토링 요청 메시지를 작성해주세요...')).toBeInTheDocument();
        expect(screen.getByText('요청 보내기')).toBeInTheDocument();
        expect(screen.getByText('취소')).toBeInTheDocument();
    });

    test('message textarea has correct attributes for testing', async () => {
        renderWithProviders(<MentorsPage />, {
            initialState: initialMenteeState
        });
        
        const mentorCards = screen.getAllByText('멘토링 요청');
        await userEvent.click(mentorCards[0]);
        
        const messageTextarea = screen.getByPlaceholderText('멘토링 요청 메시지를 작성해주세요...');
        expect(messageTextarea).toHaveAttribute('id', 'message');
        expect(messageTextarea).toHaveAttribute('data-mentor-id', '1');
        expect(messageTextarea).toHaveAttribute('data-testid', 'message-1');
        
        const requestButton = screen.getByText('요청 보내기');
        expect(requestButton).toHaveAttribute('id', 'request');
    });

    test('shows access denied message for non-mentee users', () => {
        renderWithProviders(<MentorsPage />, {
            initialState: {
                auth: {
                    token: 'mock-token',
                    isAuthenticated: true,
                    user: mockMentorUser,
                    loading: false,
                    error: null,
                },
                mentor: {
                    mentors: [],
                    loading: false,
                    error: null,
                    searchSkill: '',
                    sortBy: 'id' as const,
                },
                matchRequest: {
                    incomingRequests: [],
                    outgoingRequests: [],
                    loading: false,
                    error: null,
                }
            }
        });
        
        expect(screen.getByText('멘티만 접근할 수 있는 페이지입니다.')).toBeInTheDocument();
    });

    test('shows loading state', () => {
        renderWithProviders(<MentorsPage />, {
            initialState: {
                ...initialMenteeState,
                mentor: {
                    ...initialMenteeState.mentor,
                    loading: true,
                }
            }
        });
        
        expect(screen.getByText('멘토 목록을 불러오는 중...')).toBeInTheDocument();
    });

    test('shows empty state when no mentors found', () => {
        renderWithProviders(<MentorsPage />, {
            initialState: {
                ...initialMenteeState,
                mentor: {
                    mentors: [], // Empty array for empty state
                    loading: false,
                    error: null,
                    searchSkill: '',
                    sortBy: 'id' as const
                }
            }
        });
        
        expect(screen.getByText('조건에 맞는 멘토가 없습니다.')).toBeInTheDocument();
    });

    test('shows error state when error occurs', () => {
        renderWithProviders(<MentorsPage />, {
            initialState: {
                ...initialMenteeState,
                mentor: {
                    mentors: [], // No mentors when there's an error
                    loading: false,
                    error: 'Failed to fetch mentors',
                    searchSkill: '',
                    sortBy: 'id' as const
                }
            }
        });
        
        expect(screen.getByText('Failed to fetch mentors')).toBeInTheDocument();
    });
});
