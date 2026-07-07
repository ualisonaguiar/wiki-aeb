import { NivelPermissao } from "./permissoes";

export interface AuthUser {
  id: string | number;
  /** PK de eve_usuarios (usu_id). Usado para comparar autoria de solicitações. */
  usu_id: string | number | null;
  username: string;
  email: string;
  nome: string;
  nivel_permissao: NivelPermissao | null;
  is_admin: boolean;
}

/** Resposta do POST /api/token/ (simplejwt padrão) */
export interface LoginResponse {
  access: string;
  refresh: string;
}

/** Resposta do GET /api/me/ (flat, não nested) */
export interface MeResponse {
  id: string | number;
  /** PK de eve_usuarios (usu_id). Usado para comparar autoria de solicitações. */
  usu_id: string | number | null;
  username: string;
  email: string;
  nome: string;
  nivel_permissao: NivelPermissao | null;
  is_admin: boolean;
}
