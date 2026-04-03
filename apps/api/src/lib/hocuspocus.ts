import { Hocuspocus } from "@hocuspocus/server";
import * as Y from "yjs";

import { prisma, Role } from "@workspace/db";
import { auth, fromNodeHeaders } from "@workspace/better-auth/server";
import { WHITEBOARD_KEYS } from "@workspace/whiteboard";

/**
 * Initialize Hocuspocus Server with Persistence
 */
export const hocuspocus = new Hocuspocus({
  debounce: 2000,

  async onConnect({ request, documentName }) {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) {
      console.error(
        `❌ Connection rejected: No session found for board ${documentName}`
      );
      throw new Error("Unauthorized");
    }

    const board = await prisma.whiteboard.findUnique({
      where: { id: documentName },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!board) {
      throw new Error(`Board ${documentName} not found`);
    }

    let role: Role = Role.VIEWER;
    if (board.userId === session.user.id) {
      role = Role.ADMIN;
      console.log(`👑 Owner detected: ${session.user.id} -> ADMIN`);
    } else if (board.members.length > 0 && board.members[0]) {
      role = board.members[0].role;
      console.log(`👥 Member detected: ${session.user.id} -> ${role}`);
    } else {
      console.log(`👀 Visitor detected: ${session.user.id} -> VIEWER`);
    }

    return { user: session, role };
  },

  /**
   * KEY FIX: Apply the stored binary state to the document Hocuspocus provides.
   * Do NOT return raw bytes — you must call Y.applyUpdate on the provided document.
   */
  async onLoadDocument({ document, documentName }) {
    console.log(`📂 Loading document: ${documentName}`);

    const whiteboard = await prisma.whiteboard.findUnique({
      where: { id: documentName },
      select: { data: true },
    });

    if (!whiteboard?.data) {
      console.log("✨ New document — no data in DB yet");
      return document;
    }

    const uint8 = new Uint8Array(whiteboard.data);

    // Apply the stored state to the server's Y.Doc instance
    Y.applyUpdate(document, uint8);

    const shapeCount = document.getMap(WHITEBOARD_KEYS.SHAPES).size;
    console.log(
      `📦 Loaded ${whiteboard.data.length} bytes for ${documentName}. Shapes: ${shapeCount}`
    );

    return document;
  },

  async onStoreDocument({ documentName, document, context }) {
    if (context?.role === Role.VIEWER) {
      console.log("🚫 View-only access: Skipping save");
      return;
    }

    try {
      const state = Y.encodeStateAsUpdate(document);
      const buffer = Buffer.from(state);
      const shapeCount = document.getMap(WHITEBOARD_KEYS.SHAPES).size;

      console.log(
        `💾 Saving ${documentName}: ${buffer.length} bytes, ${shapeCount} shapes`
      );

      await prisma.whiteboard.update({
        where: { id: documentName },
        data: { data: buffer },
      });

      console.log(`✅ Persisted ${documentName} successfully`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`❌ Failed to store document ${documentName}:`, message);
    }
  },
});
