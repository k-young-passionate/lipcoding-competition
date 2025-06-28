import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../pages/ProfilePage';
import { renderWithProviders, mockMenteeUser, mockMentorUser } from '../utils/testUtils';

describe('ProfilePage Component', () => {
    const initialMenteeState = {
        auth: {
            token: 'mock-token',
            isAuthenticated: true,
            user: mockMenteeUser,
            loading: false,
            error: null,
        },
        user: {
            profile: null,
            loading: false,
            error: null,
        }
    };

    const initialMentorState = {
        auth: {
            token: 'mock-token',
            isAuthenticated: true,
            user: mockMentorUser,
            loading: false,
            error: null,
        },
        user: {
            profile: null,
            loading: false,
            error: null,
        }
    };

    test('renders profile page elements', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMenteeState
        });
        
        expect(screen.getByText('프로필 관리')).toBeInTheDocument();
        expect(screen.getByLabelText('이름')).toBeInTheDocument();
        expect(screen.getByLabelText('소개')).toBeInTheDocument();
        expect(screen.getByLabelText('프로필 이미지')).toBeInTheDocument();
        expect(screen.getByText('프로필 저장')).toBeInTheDocument();
    });

    test('has correct input field IDs for testing', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMenteeState
        });
        
        expect(screen.getByLabelText('이름')).toHaveAttribute('id', 'name');
        expect(screen.getByLabelText('소개')).toHaveAttribute('id', 'bio');
        expect(screen.getByLabelText('프로필 이미지').closest('input')).toHaveAttribute('id', 'profile');
        expect(screen.getByText('프로필 저장')).toHaveAttribute('id', 'save');
    });

    test('shows profile photo with correct ID', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMenteeState
        });
        
        const profilePhoto = screen.getByAltText('프로필 이미지');
        expect(profilePhoto).toHaveAttribute('id', 'profile-photo');
    });

    test('shows skills field for mentor users', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMentorState
        });
        
        expect(screen.getByLabelText('기술 스택')).toBeInTheDocument();
        expect(screen.getByLabelText('기술 스택')).toHaveAttribute('id', 'skillsets');
        expect(screen.getByPlaceholderText('React, Node.js, Python (쉼표로 구분)')).toBeInTheDocument();
    });

    test('does not show skills field for mentee users', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMenteeState
        });
        
        expect(screen.queryByLabelText('기술 스택')).not.toBeInTheDocument();
    });

    test('displays user role and email as read-only', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMenteeState
        });
        
        expect(screen.getByText('멘티')).toBeInTheDocument();
        expect(screen.getByText('mentee@test.com')).toBeInTheDocument();
    });

    test('allows user to edit name and bio', async () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMenteeState
        });
        
        const nameInput = screen.getByLabelText('이름');
        const bioTextarea = screen.getByLabelText('소개');
        
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');
        
        await userEvent.clear(bioTextarea);
        await userEvent.type(bioTextarea, 'Updated bio description');
        
        expect(nameInput).toHaveValue('Updated Name');
        expect(bioTextarea).toHaveValue('Updated bio description');
    });

    test('allows mentor to edit skills', async () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMentorState
        });
        
        const skillsInput = screen.getByLabelText('기술 스택');
        
        await userEvent.clear(skillsInput);
        await userEvent.type(skillsInput, 'React, Vue, Angular');
        
        expect(skillsInput).toHaveValue('React, Vue, Angular');
    });

    test('shows loading state when updating profile', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: {
                ...initialMenteeState,
                user: {
                    ...initialMenteeState.user,
                    loading: true,
                }
            }
        });
        
        expect(screen.getByText('저장 중...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /저장 중.../i })).toBeDisabled();
    });

    test('shows error message when update fails', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: {
                ...initialMenteeState,
                user: {
                    ...initialMenteeState.user,
                    error: 'Profile update failed',
                }
            }
        });
        
        expect(screen.getByText('Profile update failed')).toBeInTheDocument();
    });

    test('displays default placeholder image for mentee', () => {
        const testState = {
            ...initialMenteeState,
            auth: {
                ...initialMenteeState.auth,
                user: {
                    ...initialMenteeState.auth.user,
                    profile: {
                        ...initialMenteeState.auth.user.profile,
                        imageUrl: null
                    }
                }
            }
        };
        
        renderWithProviders(<ProfilePage />, {
            initialState: testState
        });
        
        const profileImage = screen.getByAltText('프로필 이미지');
        expect(profileImage).toHaveAttribute('src', 'https://placehold.co/500x500.jpg?text=MENTEE');
    });

    test('displays default placeholder image for mentor', () => {
        const testState = {
            ...initialMentorState,
            auth: {
                ...initialMentorState.auth,
                user: {
                    ...initialMentorState.auth.user,
                    profile: {
                        ...initialMentorState.auth.user.profile,
                        imageUrl: null
                    }
                }
            }
        };
        
        renderWithProviders(<ProfilePage />, {
            initialState: testState
        });
        
        const profileImage = screen.getByAltText('프로필 이미지');
        expect(profileImage).toHaveAttribute('src', 'https://placehold.co/500x500.jpg?text=MENTOR');
    });

    test('shows file input validation message', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMenteeState
        });
        
        expect(screen.getByText('JPG 또는 PNG, 최대 1MB, 권장 크기: 500x500px')).toBeInTheDocument();
    });

    test('accepts only specific file types for profile image', () => {
        renderWithProviders(<ProfilePage />, {
            initialState: initialMenteeState
        });
        
        const fileInput = screen.getByLabelText('프로필 이미지').closest('input');
        expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/jpg,image/png');
    });
});
