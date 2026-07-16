import { oc } from "@orpc/contract";
import { z } from "zod";

export const recipesContract = {
  list: oc.output(z.array(z.never())),
};
