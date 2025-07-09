import { initTRPC } from "@trpc/server";
import { getSession } from "next-auth/react";
import type { NextApiRequest, NextApiResponse } from "next";

const t = initTRPC.context<{
  req: NextApiRequest;
  res: NextApiResponse;
}>().create();

export const createRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = await getSession({ req: ctx.req });
  if (!session) throw new Error("Unauthorized");
  return next({ ctx: { session } });
});
