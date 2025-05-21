import { rateLimit } from "express-rate-limit";

export const routerLimiter = (time: number, limit: number) => {
  const limiter = rateLimit({
    windowMs: time * 600 * 1000, //time
    limit,
  });
  return limiter;
};
