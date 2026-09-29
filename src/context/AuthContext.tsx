import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile, UnitPreference } from '../types/gym';

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isCloudConnected: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, fullName: string, unit: UnitPreference) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ error: any }>;
}

const LOCAL_USER_KEY = 'gymlog_guest_user';
const LOCAL_PROFILE_KEY = 'gymlog_guest_profile';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUser({ id: session.user.id, email: session.user.email });
            await fetchCloudProfile(session.user.id);
          } else {
            loadLocalUser();
          }

          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
              setUser({ id: session.user.id, email: session.user.email });
              await fetchCloudProfile(session.user.id);
            } else {
              loadLocalUser();
            }
          });

          return () => subscription.unsubscribe();
        } else {
          loadLocalUser();
        }
      } catch (err) {
        console.warn('Auth initialization fallback:', err);
        loadLocalUser();
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  function loadLocalUser() {
    const savedUser = localStorage.getItem(LOCAL_USER_KEY);
    const savedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);

    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser));
      setProfile(JSON.parse(savedProfile));
    } else {
      const defaultUser = { id: 'local-member-1', email: 'member@gymlog.app' };
      const defaultProfile: Profile = {
        id: 'local-member-1',
        full_name: 'Gym Member',
        unit_preference: 'kg',
        created_at: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(defaultUser));
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(defaultProfile));
      setUser(defaultUser);
      setProfile(defaultProfile);
    }
  }

  async function fetchCloudProfile(userId: string) {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      } else {
        // Fallback create profile if missing
        const newProf: Profile = {
          id: userId,
          full_name: 'Gym Member',
          unit_preference: 'kg',
          created_at: new Date().toISOString()
        };
        await supabase.from('profiles').upsert(newProf);
        setProfile(newProf);
      }
    } catch (e) {
      console.warn('Could not fetch cloud profile:', e);
    }
  }

  const signIn = async (email: string, pass: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Cloud database not configured. Working in offline guest mode.') };
    }
    const res = await supabase.auth.signInWithPassword({ email, password: pass });
    return { error: res.error };
  };

  const signUp = async (email: string, pass: string, fullName: string, unit: UnitPreference) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Cloud database not configured. Working in offline guest mode.') };
    }
    const res = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: fullName,
          unit_preference: unit
        }
      }
    });
    return { error: res.error };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    loadLocalUser();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const updated = { ...profile, ...updates } as Profile;
    setProfile(updated);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase && user?.id) {
      try {
        await supabase.from('profiles').update(updates).eq('id', user.id);
      } catch (err) {
        console.warn('Cloud profile update queued/failed:', err);
      }
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Cloud database not configured.') };
    }
    return await supabase.auth.resetPasswordForEmail(email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isCloudConnected: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        updateProfile,
        resetPasswordForEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

