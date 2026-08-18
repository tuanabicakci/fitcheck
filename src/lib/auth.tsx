import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { getSupabase } from './supabase';

interface AuthContextValue {
  session: Session | null;
  userId: string | null;
  ready: boolean;
  error: string | null;
  retry: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);
    const supabase = getSupabase();

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        setSession(data.session);
        setReady(true);
        return;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
      if (cancelled) return;

      if (signInError) {
        setError(signInError.message);
        setReady(true);
        return;
      }

      setSession(signInData.session);
      setReady(true);
    })();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, [attempt]);

  const value: AuthContextValue = {
    session,
    userId: session?.user.id ?? null,
    ready,
    error,
    retry: () => setAttempt((a) => a + 1),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
