import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { Server } from "node:http";

describe("rotas autenticadas", () => {
  const originalToken = process.env.API_AUTH_TOKEN;
  process.env.API_AUTH_TOKEN = "test-secret";

  let server: Server;
  let baseUrl: string;

  before(async () => {
    const { default: app } = await import("../app.js");

    server = app.listen(0, "127.0.0.1");
    await new Promise<void>((resolve) => server.once("listening", resolve));

    const address = server.address();
    if (typeof address !== "object" || address === null) {
      throw new Error("Não foi possível obter a porta do servidor de teste");
    }

    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });

    if (originalToken === undefined) {
      delete process.env.API_AUTH_TOKEN;
    } else {
      process.env.API_AUTH_TOKEN = originalToken;
    }
  });

  it("bloqueia o acesso sem token bearer", async () => {
    const response = await fetch(`${baseUrl}/api/protected`);

    assert.equal(response.status, 401);
    const body = (await response.json()) as { error: string };
    assert.equal(body.error, "Token de autenticacao ausente ou invalido");
  });

  it("permite o acesso com token bearer valido", async () => {
    const response = await fetch(`${baseUrl}/api/protected`, {
      headers: {
        Authorization: "Bearer test-secret",
      },
    });

    assert.equal(response.status, 200);
    const body = (await response.json()) as { ok: boolean; message: string };
    assert.equal(body.ok, true);
    assert.equal(body.message, "Rota autenticada acessada com sucesso");
  });
});
