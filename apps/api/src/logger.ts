import pino from "pino";

const transport = process.env.NODE_ENV === "production"
  ? undefined
  : pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname"
      }
    });

export const logger = pino({
  name: "api",
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    source: "api"
  }
}, transport);
