import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

type AuthContextType = {
  user: User | null;
  profile: any | null;
  isManager: boolean;
  loading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isWelcomeModalOpen: boolean;
  closeWelcomeModal: () => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Manager role is now determined from the 'role' column in the profiles table.
// To make someone a manager, run in Supabase SQL Editor:
//   UPDATE profiles SET role = 'MANAGER' WHERE email = 'their@email.com';
const MANAGER_EMAILS = ['laxmikant.p@genziitian.com', 'genziitian@gmail.com', 'lkiitmng2428@gmail.com'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) syncProfile(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) syncProfile(session.user);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncProfile = async (u: User) => {
    try {
      // Use maybeSingle() so it returns null (instead of throwing an error) if the profile doesn't exist
      const { data: existingProfile, error: fetchError } = await supabase.from('profiles').select('id').eq('id', u.id).maybeSingle();
      
      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
      }

      const isNewUser = !existingProfile;

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: u.id,
          email: u.email,
          name: u.user_metadata.full_name || u.email?.split('@')[0],
        })
        .select()
        .single();

      if (!error) {
        setProfile(data);
        if (isNewUser) {
          console.log('[AuthContext] Brand new user detected, triggering welcome email and auto-enrollment...');
          
          // Trigger welcome email
          fetch('/api/welcome-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: u.email, name: u.user_metadata.full_name || u.email?.split('@')[0] })
          }).catch(err => console.warn('Welcome email trigger failed:', err));

          // Trigger auto-enrollment in default course
          fetch('/api/auto-enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: u.email, name: u.user_metadata.full_name || u.email?.split('@')[0] })
          })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setIsWelcomeModalOpen(true);
            }
          })
          .catch(err => console.warn('Auto-enrollment trigger failed:', err));
        }
      } else {
        console.error('Error upserting profile:', error);
      }
    } catch (err) {
      console.warn('Silent Profile Sync Failed:', err);
      // We don't throw here so the user can still browse the site
    }
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const value = {
    user,
    profile,
    isManager: profile?.role === 'MANAGER' || (user?.email ? MANAGER_EMAILS.includes(user.email) : false),
    loading,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    isWelcomeModalOpen,
    closeWelcomeModal: () => setIsWelcomeModalOpen(false),
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
