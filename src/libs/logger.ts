import { config } from "dotenv";

config();

const log = (message: any, color: string) => {
  if (process.env.NODE_ENV === "development") {
    // with color 
    const content = typeof message === "string" ? message : JSON.stringify(message);
    console.log(`\x1b[${color}m${content}\x1b[0m`);
  }
}
export const logger = {
  log: (message: any) => {
    log(message, "34");
  },
  info: (message: any) => {
    log(message, "32");
  },
  warn: (message: any) => {
    log(message, "33");
  },
  error: (message: any) => {
    log(message, "31");
  },
};