import { z } from "zod";
import { createRouter } from "../trpc";
import prisma from "../../../prisma";
import { ServiceType } from "@prisma/client";

export const pricingRouter = createRouter()
  .query("getPrice", {
    input: z.object({
      serviceType: z.nativeEnum(ServiceType),
      size: z.string(),
      colorCount: z.number(),
      qty: z.number(),
      userId: z.string(),
    }),
    async resolve({ input }) {
      const rule = await prisma.pricingRule.findFirst({
        where: { serviceType: input.serviceType, size: input.size, colorCount: input.colorCount },
      });
      if (!rule) throw new Error("No pricing rule found");
      const user = await prisma.user.findUnique({ where: { id: input.userId } });
      const subtotal = rule.basePrice * input.qty;
      const discount = user?.discountRate ?? 0;
      const total = subtotal * (1 - discount);
      return { base: rule.basePrice, subtotal, discount, total };
    },
  });
