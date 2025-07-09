import { z } from "zod";
import { createRouter } from "../trpc";
import prisma from "../../../prisma";

export const quoteRouter = createRouter()
  .mutation("createQuote", {
    input: z.object({
      userId: z.string(),
      inputs: z.any(),
      lineItems: z.any(),
      total: z.number(),
    }),
    resolve: ({ input }) => {
      return prisma.quote.create({ data: input });
    },
  })
  .query("getQuotes", {
    input: z.object({ userId: z.string() }),
    resolve: ({ input }) => {
      return prisma.quote.findMany({ where: { userId: input.userId }, orderBy: { createdAt: "desc" } });
    },
  });
