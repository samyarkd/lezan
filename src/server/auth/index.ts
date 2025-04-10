import { cache } from "react";
import { createMiddleware } from "hono/factory";
import NextAuth from "next-auth";

import { authConfig } from "./config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

const verifyAuth = createMiddleware(async (c, next) => {
  const authData = await auth();

  if (authData) {
    await next();
  }
  c.res = Response.json({ message: "Unauthorized" }, { status: 401 });
});

export { auth, handlers, signIn, signOut, verifyAuth };
