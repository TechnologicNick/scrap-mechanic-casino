import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { users } from "~/server/db/schema";

export const creditsRouter = createTRPCRouter({
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    // simulate a slow db call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = await ctx.db.query.users.findFirst({
      where: (user, { eq }) => eq(user.id, ctx.session.user.id),
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user.credits;
  }),

  winCredits: protectedProcedure
    .input(
      z.object({
        amount: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await ctx.db
        .update(users)
        .set({ credits: sql`${users.credits} + ${input.amount}` })
        .where(
          and(
            eq(users.id, ctx.session.user.id),
            gte(sql`${users.credits} + ${input.amount}`, 0),
          ),
        );

      if (res.changes === 0) {
        throw new Error("Not enough credits");
      }
    }),
});
