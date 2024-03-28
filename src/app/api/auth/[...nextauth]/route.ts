import NextAuth from "next-auth";
import SteamProvider from 'next-auth-steam'
import { NextRequest } from "next/server";
import { env } from "~/env";

import { authOptions } from "~/server/auth";

const handler = async (req: NextRequest, ctx: { params: { nextauth: string[] } }) => {
  return NextAuth(req, ctx, {
    ...authOptions,
    providers: [
      ...authOptions.providers,
      SteamProvider(req, {
        clientSecret: env.STEAM_API_KEY,
        callbackUrl: `${env.NEXTAUTH_URL}/api/auth/callback`,
      }),
    ]
  });
}

export { handler as GET, handler as POST };
