import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@workspace/trpc";

export const trpc = createTRPCReact<AppRouter>();
