import { api } from "../config/api";
import type { AuthUser, LoginResponse, MeResponse } from "../types/auth";

const TOKEN_KEY = "token";
const REFRESH_KEY = "refresh_token";

export const login = async (
  username: string,
  password: string,
): Promise<AuthUser> => {
  const { data } = await api.post<LoginResponse>(
    import.meta.env.VITE_SERVER_UML + "/admin/login",
    {
      username,
      password,
    },
  );

  localStorage.setItem(TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_KEY, data.refresh);

  // Aplica o token imediatamente na instância do Axios
  api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

  // Hidrata dados do usuário
  return await getMe();
};

/**
 * GET /api/me/ — retorna dados flat do usuário logado
 */
export const getMe = async (): Promise<AuthUser> => {
  const { data } = await api.get<MeResponse>(
    import.meta.env.VITE_SERVER_UML + "/admin/token/me",
  );

  return {
    id: data.id,
    usu_id: data.usu_id ?? null,
    username: data.username,
    email: data.email,
    nome: data.nome,
    nivel_permissao: data.nivel_permissao,
    is_admin: data.is_admin,
  };
};

/**
 * POST /api/token/refresh/ — renova access token
 */
export const refreshToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  try {
    const { data } = await api.post<{ access: string }>(
      import.meta.env.VITE_SERVER_UML + "/admin/token/refresh/",
      {
        refresh,
      },
    );
    localStorage.setItem(TOKEN_KEY, data.access);
    api.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;
    return data.access;
  } catch {
    logout();
    return null;
  }
};

/**
 * Logout — limpa tokens e header Authorization
 */
export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  delete api.defaults.headers.common["Authorization"];
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};
