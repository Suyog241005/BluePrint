import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@workspace/better-auth/server";

export const requireAuth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/signin");
  }
  return session;
};

export const requireUnauth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (session) {
    redirect("/");
  }
};
