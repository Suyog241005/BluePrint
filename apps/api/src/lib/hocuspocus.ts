import { Hocuspocus } from "@hocuspocus/server";
import * as Y from "yjs";

import { prisma, Role } from "@workspace/db";
import { auth, fromNodeHeaders } from "@workspace/better-auth/server";

/**
 * Initialize Hocuspocus Server with Persistence
 */
export const hocuspocus = new Hocuspocus({
  // Step 1: Authentication & Context
  async onConnect({ request, documentName }) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // C. Verify Board Access (Owner or Member)
    const board = await prisma.whiteboard.findUnique({
      where: { id: documentName },
      include: {
        members: {
          where: {
            whiteboardId: documentName,
            userId: session.user.id,
          },
        },
      },
    });
    if (!board) {
      throw new Error("Forbidden");
    }

    const role = board.members.find(
      (member) => member.userId === session.user.id
    )?.role;

    console.log(`User role: ${role}`);
    console.log(`User: ${session.user}`);

    // Store user info in context for other hooks
    return {
      user: session.user,
      role,
    };
  },

  // Step 2: Load from Database
  async onLoadDocument({ documentName, context }) {
    console.log(`📂 Loading document: ${documentName}`);

    // Find the whiteboard in Prisma
    const whiteboard = await prisma.whiteboard.findUniqueOrThrow({
      where: { id: documentName },
    });

    // Return the binary data to Yjs
    return whiteboard.data;
  },

  // Step 3: Save to Database
  async onStoreDocument({ documentName, document, context }) {
    if (context.role === Role.VIEWER) {
      console.log("Viewer cannot save document");
      return;
    }
    const data = Buffer.from(Y.encodeStateAsUpdate(document));
    console.log(data);
    await prisma.whiteboard
      .update({
        where: { id: documentName },
        data: {
          data: data,
        },
      })
      .catch((err) => {
        console.error("❌ Failed to save whiteboard:", err.message);
      });
    console.log(`💾 Saving document: ${documentName}`);
  },
});
