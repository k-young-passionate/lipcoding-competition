import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateProfile } from '../store/slices/userSlice';
import { getCurrentUser } from '../store/slices/authSlice';

const ProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector(state => state.auth);
    const { loading, error } = useAppSelector(state => state.user);
    
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [skills, setSkills] = useState<string>('');
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        if (user?.profile) {
            setName(user.profile.name || '');
            setBio(user.profile.bio || '');
            if (user.role === 'mentor' && user.profile.skills) {
                setSkills(user.profile.skills.join(', '));
            }
            if (user.profile.imageUrl) {
                setImagePreview(`http://localhost:8080/api${user.profile.imageUrl}`);
            } else {
                const defaultImage = user.role === 'mentor' 
                    ? 'https://placehold.co/500x500.jpg?text=MENTOR'
                    : 'https://placehold.co/500x500.jpg?text=MENTEE';
                setImagePreview(defaultImage);
            }
        } else if (user) {
            const defaultImage = user.role === 'mentor' 
                ? 'https://placehold.co/500x500.jpg?text=MENTOR'
                : 'https://placehold.co/500x500.jpg?text=MENTEE';
            setImagePreview(defaultImage);
        }
    }, [user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.match(/image\/(jpeg|jpg|png)$/)) {
                alert('JPG 또는 PNG 파일만 업로드할 수 있습니다.');
                return;
            }
            
            // Validate file size (1MB = 1024 * 1024 bytes)
            if (file.size > 1024 * 1024) {
                alert('파일 크기는 1MB 이하여야 합니다.');
                return;
            }
            
            setProfileImage(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove data:image/jpeg;base64, or data:image/png;base64, prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!user) return;
        
        try {
            let imageBase64: string | undefined;
            
            if (profileImage) {
                imageBase64 = await convertFileToBase64(profileImage);
            }
            
            const profileData = {
                id: user.id,
                name: name.trim(),
                role: user.role,
                bio: bio.trim(),
                ...(imageBase64 && { image: imageBase64 }),
                ...(user.role === 'mentor' && { 
                    skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0)
                }),
            };
            
            await dispatch(updateProfile(profileData)).unwrap();
            
            // Refresh user data
            await dispatch(getCurrentUser());
            
            alert('프로필이 성공적으로 업데이트되었습니다.');
        } catch (error) {
            console.error('Profile update failed:', error);
        }
    };

    if (!user) {
        return <div className="text-center">로딩 중...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">프로필 관리</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Image */}
                    <div className="flex items-center space-x-6">
                        <div className="shrink-0">
                            <img
                                id="profile-photo"
                                className="h-24 w-24 object-cover rounded-full border-2 border-gray-300"
                                src={imagePreview || 'https://placehold.co/500x500.jpg?text=USER'}
                                alt="프로필 이미지"
                            />
                        </div>
                        <div>
                            <label htmlFor="profile" className="block text-sm font-medium text-gray-700 mb-2">
                                프로필 이미지
                            </label>
                            <input
                                id="profile"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleImageChange}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                JPG 또는 PNG, 최대 1MB, 권장 크기: 500x500px
                            </p>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            이름
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="이름을 입력하세요"
                        />
                    </div>

                    {/* Bio */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            소개
                        </label>
                        <textarea
                            id="bio"
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            placeholder="자신을 간단히 소개해 주세요"
                        />
                    </div>

                    {/* Skills (Mentor only) */}
                    {user.role === 'mentor' && (
                        <div>
                            <label htmlFor="skillsets" className="block text-sm font-medium text-gray-700">
                                기술 스택
                            </label>
                            <input
                                id="skillsets"
                                type="text"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder="React, Node.js, Python (쉼표로 구분)"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                보유한 기술을 쉼표로 구분해서 입력하세요
                            </p>
                        </div>
                    )}

                    {/* Role Display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            역할
                        </label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
                            {user.role === 'mentor' ? '멘토' : '멘티'}
                        </div>
                    </div>

                    {/* Email Display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            이메일
                        </label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-700">
                            {user.email}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            id="save"
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '저장 중...' : '프로필 저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
