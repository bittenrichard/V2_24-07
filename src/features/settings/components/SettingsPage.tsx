import React from 'react';
import UpdateProfileForm from './UpdateProfileForm';
import UpdatePasswordForm from './UpdatePasswordForm';
import { useAuth } from '../../auth/hooks/useAuth';
import { UserProfile } from '../../auth/types';

const SettingsPage: React.FC = () => {
    const { profile, updateProfile } = useAuth();

    const handleProfileUpdate = (newProfileData: Partial<UserProfile>) => {
        updateProfile(newProfileData);
        console.log('Perfil atualizado. Novos dados:', newProfileData);
    };

    if (!profile) {
        return <div>Carregando perfil...</div>;
    }

    return (
        <div className="fade-in max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações da Conta</h1>
            <UpdateProfileForm profile={profile} onProfileUpdate={handleProfileUpdate} />
            <UpdatePasswordForm />
        </div>
    );
};

export default SettingsPage;