"use client";

import { useState } from "react";
import {
  useSuspenseWhiteboards,
  useCreateWhiteboard,
  useRemoveWhiteboard,
} from "@/hooks/whiteboard-hooks";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Plus, Trash2, ArrowRight, Clock, Box } from "lucide-react";
import Link from "next/link";

export function WhiteboardList() {
  const [name, setName] = useState("");

  // 1. Fetch data with Suspense
  const [whiteboards] = useSuspenseWhiteboards();

  // 2. Mutations
  const { mutateAsync: createBoard, isPending: isCreating } =
    useCreateWhiteboard();
  const { mutateAsync: deleteBoard, isPending: isDeleting } =
    useRemoveWhiteboard();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      await createBoard({ name: name.trim() });
      setName("");
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl leading-tight font-black tracking-tight text-slate-900">
            Project Canvas
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Create and manage your collaborative drawing spaces.
          </p>
        </div>

        {/* 1. Create New Section */}
        <form
          onSubmit={handleCreate}
          className="group flex max-w-xl flex-col gap-3 rounded-2xl border bg-white p-2 shadow-sm transition-all focus-within:ring-4 focus-within:ring-blue-500/5 sm:flex-row"
        >
          <Input
            placeholder="New whiteboard name (e.g. System Design)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border-none text-base shadow-none focus-visible:ring-0"
            required
          />
          <Button
            disabled={isCreating}
            className="rounded-xl bg-blue-600 px-6 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
          >
            {isCreating ? (
              "Creating..."
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Board
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* 2. List Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!whiteboards || whiteboards.length === 0 ? (
          <div className="col-span-full rounded-3xl border-2 border-dashed bg-slate-50/50 py-20 text-center">
            <div className="mx-auto max-w-xs space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Box className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-600">No projects yet</p>
                <p className="text-sm font-medium text-slate-400">
                  Give your first project a name and click "Create Board" to
                  begin.
                </p>
              </div>
            </div>
          </div>
        ) : (
          whiteboards.map((board) => (
            <Card
              key={board.id}
              className="group relative overflow-hidden rounded-3xl border-slate-100 bg-white transition-all duration-300 hover:translate-y-[-4px] hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5"
            >
              <CardHeader className="pb-10">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-bold tracking-tight uppercase transition-colors group-hover:text-blue-600">
                    {board.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                    onClick={() => deleteBoard({ id: board.id })}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-1.5 text-[10px] font-medium tracking-widest text-slate-400 uppercase">
                  <Clock className="h-3 w-3" />
                  Updated {new Date(board.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/whiteboard/${board.id}`}>
                  <Button
                    day-board-btn="true"
                    className="h-12 w-full rounded-2xl bg-slate-900 font-bold text-white shadow-xl shadow-slate-950/5 ring-blue-500/10 ring-offset-2 transition-all hover:bg-blue-600 focus:ring-4"
                  >
                    Enter Workspace
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardContent>
              <div className="absolute right-0 bottom-0 left-0 h-1 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
