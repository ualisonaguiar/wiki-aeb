import crypto from "node:crypto";
import { createRequire } from "node:module";
import type { NextFunction, Request, Response } from "express";

export interface AuthUser {
  id: string;
  usu_id: string | null;
  username: string;
  email: string;
  nome: string;
  nivel_permissao: number;
  is_admin: boolean;
}

interface TokenRecord {
  user: AuthUser;
  refreshToken: string;
  expiresAt: number;
}

const accessTokens = new Map<string, TokenRecord>();
const refreshTokens = new Map<string, TokenRecord>();

function escapeLdapFilterValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\*/g, "\\2a")
    .replace(/\(/g, "\\28")
    .replace(/\)/g, "\\29")
    .replace(/\0/g, "\\00");
}

function getLdapConfig() {
  return {
    host: process.env.LDAP_HOST?.trim(),
    port: Number(process.env.LDAP_PORT ?? 389),
    bindDn: process.env.LDAP_BIND_DN?.trim(),
    bindPassword: process.env.LDAP_BIND_PASSWORD?.trim(),
    baseDn: process.env.LDAP_BASE_DN?.trim(),
  };
}

/**
 * Normaliza o retorno de uma entry do ldapjs (entry.pojo ou entry.object)
 * para um objeto flat, tipo { cn: 'x', mail: 'y', sAMAccountName: 'z' }.
 *
 * No ldapjs 2.x/3.x, `entry.pojo.attributes` vem como array:
 *   [{ type: 'cn', values: ['Fulano'] }, { type: 'mail', values: ['a@b.com'] }]
 * então precisamos "achatar" isso antes de usar.
 */
function normalizeLdapEntry(entry: any): Record<string, string> {
  const raw = entry?.pojo ?? entry?.object ?? {};
  const user: Record<string, string> = {};

  if (Array.isArray(raw.attributes)) {
    for (const attr of raw.attributes) {
      const value = Array.isArray(attr.values) ? attr.values[0] : attr.values;
      user[attr.type] = value;
    }
  } else {
    // fallback para formato já flat (versões antigas do ldapjs)
    Object.assign(user, raw);
  }

  // distinguishedName às vezes só vem em objectName, não em attributes
  if (!user.distinguishedName && raw.objectName) {
    user.distinguishedName = raw.objectName;
  }
  if (!user.dn && raw.dn) {
    user.dn = raw.dn;
  }

  return user;
}

export async function authenticateWithLdap(
  username: string,
  password: string,
): Promise<AuthUser> {
  const ldapConfig = getLdapConfig();

  if (
    !ldapConfig.host ||
    !ldapConfig.bindDn ||
    !ldapConfig.bindPassword ||
    !ldapConfig.baseDn
  ) {
    throw new Error("Configuração LDAP incompleta");
  }

  const require = createRequire(import.meta.url);
  const ldap = require("ldapjs") as {
    createClient: (options: Record<string, unknown>) => any;
  };
  const client = ldap.createClient({
    url: ldapConfig.host,
    reconnect: false,
    connectTimeout: 5000,
    timeout: 5000,
  });

  try {
    await new Promise<void>((resolve, reject) => {
      client.bind(
        ldapConfig.bindDn,
        ldapConfig.bindPassword,
        (error: unknown) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        },
      );
    });

    const searchResult = await new Promise<Record<string, string> | null>(
      (resolve, reject) => {
        const entries: Record<string, string>[] = [];
        const searchFilter = `(sAMAccountName=${escapeLdapFilterValue(username)})`;

        client.search(
          ldapConfig.baseDn,
          {
            scope: "sub",
            filter: searchFilter,
            attributes: [
              "cn",
              "mail",
              "displayName",
              "sAMAccountName",
              "distinguishedName",
            ],
          },
          (error: unknown, res: any) => {
            if (error) {
              reject(error);
              return;
            }

            res.on("searchEntry", (entry: any) => {
              const user = normalizeLdapEntry(entry);
              entries.push(user);
            });

            res.on("error", (searchError: unknown) => {
              reject(searchError);
            });

            res.on("end", () => {
              resolve(entries[0] ?? null);
            });
          },
        );
      },
    );

    if (!searchResult?.dn && !searchResult?.distinguishedName) {
      throw new Error("Usuário não encontrado no LDAP");
    }

    const userDn = searchResult.dn ?? searchResult.distinguishedName;

    await new Promise<void>((resolve, reject) => {
      client.bind(userDn, password, (error: unknown) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    return {
      id: searchResult.sAMAccountName ?? username,
      usu_id: searchResult.sAMAccountName ?? username,
      username,
      email: searchResult.mail,
      nome: searchResult.displayName ?? searchResult.cn ?? username,
      nivel_permissao: 1,
      is_admin: true,
    };
  } finally {
    client.unbind(() => undefined);
  }
}

export function issueTokens(user: AuthUser) {
  const accessToken = crypto.randomBytes(24).toString("hex");
  const refreshToken = crypto.randomBytes(24).toString("hex");
  const now = Date.now();

  accessTokens.set(accessToken, {
    user,
    refreshToken,
    expiresAt: now + 15 * 60 * 1000,
  });

  refreshTokens.set(refreshToken, {
    user,
    refreshToken,
    expiresAt: now + 7 * 24 * 60 * 60 * 1000,
  });

  return { access: accessToken, refresh: refreshToken };
}

function getUserFromAccessToken(token: string): AuthUser | null {
  const record = accessTokens.get(token);
  if (!record) {
    return null;
  }

  if (record.expiresAt <= Date.now()) {
    accessTokens.delete(token);
    return null;
  }

  return record.user;
}

export function getUserFromRefreshToken(token: string): AuthUser | null {
  const record = refreshTokens.get(token);
  if (!record) {
    return null;
  }

  if (record.expiresAt <= Date.now()) {
    refreshTokens.delete(token);
    return null;
  }

  return record.user;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const configuredToken = process.env.API_AUTH_TOKEN?.trim();
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : null;

  if (!token) {
    res.status(401).json({
      error: "Token de autenticacao ausente ou invalido",
      code: "AUTH_REQUIRED",
    });
    return;
  }

  const user = getUserFromAccessToken(token);
  if (user) {
    (req as Request & { user?: AuthUser }).user = user;
    next();
    return;
  }

  if (configuredToken && token === configuredToken) {
    next();
    return;
  }

  res.status(401).json({
    error: "Token de autenticacao ausente ou invalido",
    code: "AUTH_REQUIRED",
  });
}
