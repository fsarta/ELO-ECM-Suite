import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app";

describe("ECM API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it("returns health status", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/health"
    });
    expect(response.statusCode).toBe(200);
    const payload = response.json();
    expect(payload.status).toBe("ok");
    expect(payload.service).toBe("ecm-api");
  });

  it("returns repository tree", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/repositories/tree"
    });
    expect(response.statusCode).toBe(200);
    const payload = response.json() as { items: Array<{ id: string }> };
    expect(payload.items.some((node) => node.id === "repo-root")).toBe(true);
  });

  it("returns filtered content for contracts node", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/repositories/repo-contracts-2025/content?state=IN_REVIEW"
    });
    expect(response.statusCode).toBe(200);
    const payload = response.json() as { documents: Array<{ state: string }> };
    expect(payload.documents.length).toBeGreaterThan(0);
    expect(payload.documents.every((document) => document.state === "IN_REVIEW")).toBe(true);
  });

  it("updates document metadata", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: "/api/v1/documents/doc-contract-abc?actor=Test%20User",
      payload: {
        description: "Descrizione aggiornata test"
      }
    });

    expect(response.statusCode).toBe(200);
    const payload = response.json() as { description: string; author: string };
    expect(payload.description).toBe("Descrizione aggiornata test");
    expect(payload.author).toBe("Test User");
  });

  it("supports check-out and check-in flow", async () => {
    const checkout = await app.inject({
      method: "POST",
      url: "/api/v1/documents/doc-contract-xyz/check-out",
      payload: {
        actor: "Tester Workflow"
      }
    });
    expect(checkout.statusCode).toBe(200);
    expect((checkout.json() as { inCheckoutBy: string }).inCheckoutBy).toBe("Tester Workflow");

    const checkin = await app.inject({
      method: "POST",
      url: "/api/v1/documents/doc-contract-xyz/check-in",
      payload: {
        actor: "Tester Workflow",
        comment: "Check-in da test automatico"
      }
    });
    expect(checkin.statusCode).toBe(200);
    const payload = checkin.json() as { inCheckoutBy: string | null; version: string };
    expect(payload.inCheckoutBy).toBeNull();
    expect(payload.version).toMatch(/^\d+\.\d+$/);
  });

  it("finds document with global search", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/search/global?q=contratto"
    });
    expect(response.statusCode).toBe(200);
    const payload = response.json() as { documents: Array<{ name: string }> };
    expect(payload.documents.length).toBeGreaterThan(0);
    expect(payload.documents.some((document) => document.name.toLowerCase().includes("contratto"))).toBe(true);
  });
});
