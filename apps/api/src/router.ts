import { cookbookRouter } from "./cookbook";
import { os } from "./orpc";

export const router = os.router({
  cookbook: cookbookRouter,
});
