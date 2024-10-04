import { appendFile, mkdir } from 'node:fs/promises';

export const logger = (next) => async (request, response) => {
  try {
    const log = `[${new Date().toString()}] 'request: '${JSON.stringify(request)}\n[${new Date().toString()}] 'response: ' ${JSON.stringify(response).substring(0, 1000)}\n`;
    const logFilePath = `./log/app.log`;

    await mkdir(`./log`, { recursive: true });

    await appendFile(logFilePath, log);
  } catch (error) {
    console.error("Failed to write logs:", error);
  }

  next(request, response);
};
