import { prisma } from "@workspace/db"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

export * from "better-auth/node"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_FRONTEND_URL!,
    process.env.NEXT_PUBLIC_API_URL!,
  ],
})

export type Session = typeof auth.$Infer.Session