import { buildApp } from "./app";

const start = async (): Promise<void> => {
  const app = await buildApp();
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

