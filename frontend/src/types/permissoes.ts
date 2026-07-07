// ---------------------------------------------------------------------------
// Tipos alinhados com os serializers do backend:
//   - PermissaoUsuarioReadSerializer  → PermissaoUsuario
//   - PermissaoUsuarioCreateSerializer → PermissaoUsuarioPayload
//   - UsuarioBuscaSerializer          → UsuarioBusca
// ---------------------------------------------------------------------------

export type NivelPermissao = "ADMIN" | "APROVADOR" | "USUARIO" | "PONTO_FOCAL";

/** Resposta do GET /api/permissoes/ (ReadSerializer) */
export interface PermissaoUsuario {
  id: string;
  email: string;
  nome: string;
  departamento: string;
  email_area: string;
  cargo: string;
  nivel_permissao: NivelPermissao;
  nivel_permissao_display: string;
  data_atribuicao: string;
  pode_excluir: boolean;
}

/** Payload do POST /api/permissoes/ (CreateSerializer — Snapshot) */
export interface PermissaoUsuarioPayload {
  email: string;
  nome: string;
  departamento: string;
  email_area: string;
  cargo: string;
  nivel_permissao: NivelPermissao;
}

/** Payload do PATCH /api/permissoes/{id}/ (UpdateSerializer) */
export interface PermissaoUsuarioUpdatePayload {
  nivel_permissao: NivelPermissao;
  email?: string;
  email_area?: string;
  departamento?: string;
}

/** Resposta do GET /api/usuarios/buscar/?q= (UsuarioBuscaSerializer) */
export interface UsuarioBusca {
  nome: string;
  email: string;
  departamento: string;
  email_area: string;
  cargo: string;
  ja_possui_permissao: boolean;
}
