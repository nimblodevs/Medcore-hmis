import app from "./app.js";
import env from "./config/env.js";
import prisma from "./config/prisma.js";

let server;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    server = app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed.");
    console.error(error.message);
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
};

const gracefulShutdown = async () => {
  if (server) {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
    return;
  }

  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

startServer();
