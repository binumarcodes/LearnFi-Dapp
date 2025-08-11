'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAbstraxionAccount } from '@burnt-labs/abstraxion';

interface AuthContextType {
  user: { bech32Address: string } | null;
  loading: boolean;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isGuest: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: account, isConnected } = useAbstraxionAccount();
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (isConnected !== undefined) {
      setLoading(false);
    }
  }, [isConnected]);

  const value = {
    user: account ? { bech32Address: account.bech32Address } : null,
    loading,
    isGuest,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);