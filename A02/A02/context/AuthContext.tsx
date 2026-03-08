import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "../lib/auth";
import * as authApi from "../lib/auth";

const TOKEN_KEY = "@kebook_token";
const USER_KEY = "@kebook_user";

type AuthState = {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  isReady: boolean;
};

type AuthContextType = AuthState & {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (token: string, user: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    isLoading: false,
    isReady: false,
  });

  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        const user = userJson ? (JSON.parse(userJson) as User) : null;
        setState((s) => ({ ...s, token, user, isReady: true }));
      } catch {
        setState((s) => ({ ...s, isReady: true }));
      }
    })();
  }, []);

  const setAuth = async (token: string, user: User) => {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, token),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
    ]);
    setState({ token, user, isLoading: false, isReady: true });
  };

  const login = async (username: string, password: string) => {
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const res = await authApi.login(username, password);
      await setAuth(res.access_token, res.user);
    } finally {
      setState((s) => ({ ...s, isLoading: false }));
    }
  };

  const logout = async () => {
    await Promise.all([
      AsyncStorage.removeItem(TOKEN_KEY),
      AsyncStorage.removeItem(USER_KEY),
    ]);
    setState({ token: null, user: null, isLoading: false, isReady: true });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
