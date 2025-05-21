import { PopulatedAccountType } from "./types";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
