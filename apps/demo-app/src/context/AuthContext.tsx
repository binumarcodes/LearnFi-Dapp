// context/AuthContext.tsx
import React, { createContext, useContext, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../components/util/firebase"; // adjust if needed

type AuthContextType = {
  user: any;
  isGuest: boolean;
  logout: () => Promise<void>;  // ✅ add logout
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isGuest: true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isGuest, setIsGuest] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsGuest(true);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
