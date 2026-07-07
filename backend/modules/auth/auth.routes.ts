import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";

import {
  authenticateToken,
  authenticateWithLdap,
  issueTokens,
  getUserFromRefreshToken,
  type AuthUser,
} from "../../shared/http/auth.middleware.js";

const router = Router();

/**
 * Executa handlers assíncronos e encaminha exceções para o middleware de erro do Express.
 */
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

interface AuthRequest extends Request {
  user?: AuthUser;
}

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const username =
      typeof req.body?.username === "string" ? req.body.username : "";

    const password =
      typeof req.body?.password === "string" ? req.body.password : "";

    if (!username || !password) {
      res.status(400).json({
        error: "Usuário e senha são obrigatórios",
        code: "INVALID_CREDENTIALS",
      });
      return;
    }

    try {
      const user = await authenticateWithLdap(username, password);
      const tokens = issueTokens(user);

      res.json({
        access: tokens.access,
        refresh: tokens.refresh,
        user,
      });
    } catch (error: any) {
      console.error("Erro na autenticação LDAP:", error);

      if (
        error?.name === "InvalidCredentialsError" ||
        error?.code === 49 ||
        error?.message === "Usuário não encontrado no LDAP"
      ) {
        res.status(401).json({
          error: "Usuário ou senha inválidos",
          code: "INVALID_CREDENTIALS",
        });
        return;
      }

      res.status(500).json({
        error: "Erro interno do servidor",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }),
);

router.post(
  "/token/refresh",
  asyncHandler(async (req, res) => {
    const refreshToken =
      typeof req.body?.refresh === "string" ? req.body.refresh : "";

    const user = getUserFromRefreshToken(refreshToken);

    if (!user) {
      res.status(401).json({
        error: "Refresh token inválido",
        code: "AUTH_REQUIRED",
      });
      return;
    }

    const tokens = issueTokens(user);

    res.json({
      access: tokens.access,
      refresh: tokens.refresh,
    });
  }),
);

router.get(
  "/token/me",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    if (!req.user) {
      res.status(401).json({
        error: "Usuário não autenticado",
        code: "AUTH_REQUIRED",
      });
      return;
    }

    res.json(req.user);
  },
);

router.get(
  "/token/protected",
  authenticateToken,
  (_req: Request, res: Response) => {
    res.json({
      ok: true,
      message: "Rota autenticada acessada com sucesso",
    });
  },
);

export default router;
