import { useState, useEffect, useCallback } from 'react';
import { UserAccount } from '../types';
import { GoogleProfile, getGoogleClientId, parseGoogleJwt, loadGoogleGsiScript } from '../services/googleAuth';
import { formatBrasiliaShortDate } from '../utils/dateUtils';

const AUTH_USER_KEY = 'nutrink_user_account';
const REGISTERED_USERS_KEY = 'nutrink_registered_users';

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from local storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Erro ao carregar sessão do usuário:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session
  const saveSession = useCallback((user: UserAccount) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Erro ao persistir sessão:', e);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_USER_KEY);
    } catch (e) {
      console.error('Erro ao remover sessão:', e);
    }
  }, []);

  // Handle GIS Google login response directly
  const loginWithGoogleCredential = useCallback((credentialJwt: string): UserAccount | null => {
    const profile = parseGoogleJwt(credentialJwt);
    if (!profile || !profile.email) return null;

    const email = profile.email.trim().toLowerCase();
    const name = profile.name || 'Profissional de Saúde';
    const avatarUrl = profile.picture || '';

    // Search local database
    let registeredUsers: any[] = [];
    try {
      const raw = localStorage.getItem(REGISTERED_USERS_KEY);
      if (raw) registeredUsers = JSON.parse(raw);
    } catch {}

    const existing = registeredUsers.find((u: any) => u.email?.trim().toLowerCase() === email);

    let userAccount: UserAccount;
    if (existing) {
      userAccount = {
        ...existing,
        name: existing.name || name,
        avatarUrl: avatarUrl || existing.avatarUrl,
        authProvider: 'google',
        googleId: profile.sub || profile.id || existing.googleId
      };
    } else {
      userAccount = {
        id: `usr-g-${Date.now()}`,
        name: name,
        email: email,
        crn: 'CRN Provisório',
        specialty: 'Nutrição Clínica',
        plan: 'free',
        isSubscribed: false,
        dailyMessageCount: 0,
        dailyMessageLimit: 30,
        monthlyMessageCount: 0,
        monthlyMessageLimit: 50,
        activeSince: formatBrasiliaShortDate(),
        avatarUrl: avatarUrl || undefined,
        authProvider: 'google',
        googleId: profile.sub || profile.id
      };
      registeredUsers.push(userAccount);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
    }

    saveSession(userAccount);
    return userAccount;
  }, [saveSession]);

  return {
    currentUser,
    isLoading,
    saveSession,
    logout,
    loginWithGoogleCredential
  };
}

export default useAuth;
