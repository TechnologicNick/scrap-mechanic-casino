import { and, eq, gte, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { deposits, users } from "~/server/db/schema";

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

  addCredits: protectedProcedure
    .input(
      z.object({
        amount: z.number().int().positive(),
        seed: z.number().int().gt(0).lte(0xffffffff),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        await db.transaction(async (tx) => {
          await tx.insert(deposits).values({
            depositedById: ctx.session.user.id,
            seed: input.seed,
            amount: input.amount,
          });
          await tx
            .update(users)
            .set({ credits: sql`${users.credits} + ${input.amount}` })
            .where(eq(users.id, ctx.session.user.id));
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("UNIQUE constraint failed")) {
            throw new Error("This save file has already been deposited!");
          }
        }
        throw error;
      }
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
