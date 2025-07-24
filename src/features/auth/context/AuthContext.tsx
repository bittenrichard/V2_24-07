import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, LoginCredentials, SignUpCredentials, UserProfile } from '../types';
import { baserow } from '../../../shared/services/baserowClient';
import bcrypt from 'bcryptjs';

const USERS_TABLE_ID = '209';
const SALT_ROUNDS = 10;

interface AuthContextType extends AuthState {
  error: string | null;
  signUp: (credentials: SignUpCredentials) => Promise<UserProfile | null>;
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  signOut: () => void;
  updateProfile: (newProfileData: Partial<UserProfile>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    profile: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        setAuthState({
          profile: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Falha ao carregar perfil do localStorage", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateProfile = (newProfileData: Partial<UserProfile>) => {
    setAuthState(prev => {
        if (!prev.profile) return prev;
        const updatedProfile = { ...prev.profile, ...newProfileData };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        return { ...prev, profile: updatedProfile };
    });
  };

  const signUp = async (credentials: SignUpCredentials): Promise<UserProfile | null> => {
    setAuthError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const emailLowerCase = credentials.email.toLowerCase();
      const { results: allUsers } = await baserow.get(USERS_TABLE_ID, '');
      const existingUser = allUsers.find(user => 
        user.Email && user.Email.toLowerCase() === emailLowerCase
      );

      if (existingUser) {
        throw new Error('Este e-mail já está cadastrado.');
      }

      const hashedPassword = await bcrypt.hash(credentials.password, SALT_ROUNDS);
      const dataToPost = {
        nome: credentials.nome,
        empresa: credentials.empresa,
        Email: emailLowerCase,
        senha_hash: hashedPassword,
      };

      const createdUser = await baserow.post(USERS_TABLE_ID, dataToPost);

      const userProfile: UserProfile = {
        id: createdUser.id,
        nome: createdUser.nome,
        email: createdUser.Email,
        empresa: createdUser.empresa,
        avatar_url: createdUser.avatar_url || null,
      };
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return userProfile;

    } catch (error: any) {
      setAuthError(error.message || 'Ocorreu um erro. Tente novamente.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  };

  // --- FUNÇÃO signIn ATUALIZADA COM LÓGICA ROBUSTA E LOGS ---
  const signIn = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const emailLowerCase = credentials.email.toLowerCase();
      
      // 1. Buscamos TODOS os usuários, sem filtro.
      const { results: allUsers } = await baserow.get(USERS_TABLE_ID, '');

      // 2. Encontramos o usuário na nossa lista.
      const user = allUsers.find(u => u.Email && u.Email.toLowerCase() === emailLowerCase);

      // 3. Se o usuário não for encontrado, o e-mail está errado.
      if (!user) {
        console.error("Login falhou: Nenhum usuário encontrado com o e-mail:", emailLowerCase);
        throw new Error('E-mail ou senha inválidos.');
      }

      const storedHash = user.senha_hash;
      if (!storedHash) {
          throw new Error('Conta inválida. Por favor, contate o suporte ou crie uma nova conta.');
      }

      // --- LOGS DE DEPURAÇÃO ---
      console.log("--- TENTANDO COMPARAR SENHAS ---");
      console.log("Senha digitada:", credentials.password);
      console.log("Hash armazenado no DB:", storedHash);
      
      const passwordMatches = await bcrypt.compare(credentials.password, storedHash);
      
      console.log("As senhas correspondem?", passwordMatches);
      // --- FIM DOS LOGS ---

      if (passwordMatches) {
        const userProfile: UserProfile = {
          id: user.id,
          nome: user.nome,
          email: user.Email,
          empresa: user.empresa,
          avatar_url: user.avatar_url || null,
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        setAuthState({ profile: userProfile, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        throw new Error('E-mail ou senha inválidos.');
      }
    } catch (error: any) {
      setAuthError(error.message || 'Ocorreu um erro. Tente novamente.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const signOut = () => {
    localStorage.clear();
    setAuthState({ profile: null, isAuthenticated: false, isLoading: false });
  };

  const value = {
    ...authState,
    error: authError,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};