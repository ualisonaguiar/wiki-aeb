import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  login as loginService,
  logout as logoutService,
  getMe,
  getStoredToken,
} from "../services/authService";
import { AuthUser } from "../types/auth";
import { NivelPermissao } from "../types/permissoes";

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  hasPermission: (...niveis: NivelPermissao[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehidratar sessão no mount (F5)
  useEffect(() => {
    const rehydrate = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await getMe();
        setUser(userData);
      } catch {
        logoutService();
      } finally {
        setIsLoading(false);
      }
    };

    rehydrate();
  }, []);

  const login = useCallback(
    async (credentials: {
      username: string;
      password: string;
    }): Promise<AuthUser> => {
      const userData = await loginService(
        credentials.username,
        credentials.password,
      );
      setUser(userData);
      return userData;
    },
    [],
  );

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (...niveis: NivelPermissao[]) => {
      if (!user || !user.nivel_permissao) return false;
      if (user.is_admin) return true;
      return niveis.includes(user.nivel_permissao);
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return ctx;
};
