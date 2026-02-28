import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { z } from "zod";
import type { DocumentState } from "@ecm/shared";
import { createStore } from "./store";

const documentStateEnum = z.enum(["DRAFT", "IN_REVIEW", "APPROVED", "ARCHIVED", "DELETED"]);

const repositoryFilterSchema = z.object({
  q: z.string().optional(),
  state: documentStateEnum.optional(),
  onlyMine: z.coerce.boolean().optional(),
  onlyDueSoon: z.coerce.boolean().optional(),
  user: z.string().optional()
});

const patchDocumentSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().max(2000).optional(),
    state: documentStateEnum.optional(),
    metadata: z.record(z.string()).optional(),
    tags: z.array(z.string().min(1).max(50)).max(50).optional()
  })
  .refine((payload) => Object.keys(payload).length > 0, "Body cannot be empty");

const actorSchema = z.object({
  actor: z.string().min(1).max(120).optional()
});

const commentSchema = z.object({
  actor: z.string().min(1).max(120).optional(),
  message: z.string().min(1).max(2000)
});

const checkinSchema = z.object({
  actor: z.string().min(1).max(120).optional(),
  comment: z.string().min(1).max(2000)
});

const safeActor = (actor?: string): string => actor?.trim() || "Mario Rossi";

export const buildApp = async (): Promise<FastifyInstance> => {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true
  });

  const store = createStore();

  app.get("/api/v1/health", async () => {
    return {
      service: "ecm-api",
      status: "ok",
      timestamp: new Date().toISOString()
    };
  });

  app.get("/api/v1/system/info", async () => {
    return {
      mode: "local",
      ui: "desktop-explorer",
      apiVersion: "v1",
      address: "127.0.0.1:3001"
    };
  });

  app.get("/api/v1/repositories/tree", async () => {
    return {
      items: store.getTree()
    };
  });

  app.get("/api/v1/repositories/:nodeId/content", async (request, reply) => {
    const { nodeId } = request.params as { nodeId: string };
    const parsed = repositoryFilterSchema.safeParse(request.query);
    if (!parsed.success) {
      reply.code(400);
      return {
        error: "INVALID_QUERY",
        details: parsed.error.flatten()
      };
    }

    const content = store.getRepositoryContent(nodeId, {
      query: parsed.data.q,
      state: parsed.data.state as DocumentState | undefined,
      onlyMine: parsed.data.onlyMine,
      onlyDueSoon: parsed.data.onlyDueSoon,
      user: parsed.data.user
    });

    if (!content) {
      reply.code(404);
      return {
        error: "NODE_NOT_FOUND"
      };
    }

    return content;
  });

  app.get("/api/v1/documents/:documentId", async (request, reply) => {
    const { documentId } = request.params as { documentId: string };
    const detail = store.getDocument(documentId);
    if (!detail) {
      reply.code(404);
      return {
        error: "DOCUMENT_NOT_FOUND"
      };
    }

    return detail;
  });

  app.patch("/api/v1/documents/:documentId", async (request, reply) => {
    const { documentId } = request.params as { documentId: string };
    const actorParsed = actorSchema.safeParse(request.query);
    const bodyParsed = patchDocumentSchema.safeParse(request.body);

    if (!actorParsed.success) {
      reply.code(400);
      return {
        error: "INVALID_INPUT",
        details: actorParsed.error.flatten()
      };
    }

    if (!bodyParsed.success) {
      reply.code(400);
      return {
        error: "INVALID_INPUT",
        details: bodyParsed.error.flatten()
      };
    }

    const updated = store.patchDocument(documentId, bodyParsed.data, safeActor(actorParsed.data.actor));
    if (!updated) {
      reply.code(404);
      return {
        error: "DOCUMENT_NOT_FOUND"
      };
    }

    return updated;
  });

  app.post("/api/v1/documents/:documentId/comments", async (request, reply) => {
    const { documentId } = request.params as { documentId: string };
    const parsed = commentSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return {
        error: "INVALID_BODY",
        details: parsed.error.flatten()
      };
    }

    const updated = store.addComment(documentId, safeActor(parsed.data.actor), parsed.data.message);
    if (!updated) {
      reply.code(404);
      return {
        error: "DOCUMENT_NOT_FOUND"
      };
    }
    return updated;
  });

  app.post("/api/v1/documents/:documentId/check-out", async (request, reply) => {
    const { documentId } = request.params as { documentId: string };
    const parsed = actorSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return {
        error: "INVALID_BODY",
        details: parsed.error.flatten()
      };
    }

    const updated = store.checkoutDocument(documentId, safeActor(parsed.data.actor));
    if (!updated) {
      reply.code(404);
      return {
        error: "DOCUMENT_NOT_FOUND"
      };
    }
    return updated;
  });

  app.post("/api/v1/documents/:documentId/check-in", async (request, reply) => {
    const { documentId } = request.params as { documentId: string };
    const parsed = checkinSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return {
        error: "INVALID_BODY",
        details: parsed.error.flatten()
      };
    }

    const updated = store.checkinDocument(documentId, safeActor(parsed.data.actor), parsed.data.comment);
    if (!updated) {
      reply.code(404);
      return {
        error: "DOCUMENT_NOT_FOUND"
      };
    }
    return updated;
  });

  app.delete("/api/v1/documents/:documentId", async (request, reply) => {
    const { documentId } = request.params as { documentId: string };
    const parsed = actorSchema.safeParse(request.query);
    if (!parsed.success) {
      reply.code(400);
      return {
        error: "INVALID_QUERY",
        details: parsed.error.flatten()
      };
    }

    const updated = store.deleteDocument(documentId, safeActor(parsed.data.actor));
    if (!updated) {
      reply.code(404);
      return {
        error: "DOCUMENT_NOT_FOUND"
      };
    }
    return updated;
  });

  app.post("/api/v1/documents/:documentId/restore", async (request, reply) => {
    const { documentId } = request.params as { documentId: string };
    const parsed = actorSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.code(400);
      return {
        error: "INVALID_BODY",
        details: parsed.error.flatten()
      };
    }

    const updated = store.restoreDocument(documentId, safeActor(parsed.data.actor));
    if (!updated) {
      reply.code(404);
      return {
        error: "DOCUMENT_NOT_FOUND"
      };
    }
    return updated;
  });

  app.get("/api/v1/search/global", async (request, reply) => {
    const parsed = z
      .object({
        q: z.string().min(1)
      })
      .safeParse(request.query);
    if (!parsed.success) {
      reply.code(400);
      return {
        error: "INVALID_QUERY",
        details: parsed.error.flatten()
      };
    }
    return store.searchGlobal(parsed.data.q);
  });

  app.get("/api/v1/workflow/tasks/my", async (request) => {
    const parsed = z
      .object({
        user: z.string().optional()
      })
      .parse(request.query);

    return {
      items: store.getMyTasks(parsed.user ?? "Mario Rossi")
    };
  });

  app.get("/api/v1/dashboard/summary", async (request) => {
    const parsed = z
      .object({
        user: z.string().optional()
      })
      .parse(request.query);

    return store.dashboardSummary(parsed.user ?? "Mario Rossi");
  });

  return app;
};
