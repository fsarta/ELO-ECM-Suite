import Fastify from "fastify";

const app = Fastify({
  logger: true
});

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

const start = async (): Promise<void> => {
  try {
    await app.listen({
      port: 3001,
      host: "127.0.0.1"
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

void start();
