"use client"

import { useState } from "react"
import { trpc } from "@/lib/trpc"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Plus, Trash2, ArrowRight, Clock, Box } from "lucide-react"
import Link from "next/link"

export function WhiteboardList() {
  const [name, setName] = useState("")
  const utils = trpc.useUtils()
  
  // Queries & Mutations
  const { data: whiteboards, isLoading } = trpc.getWhiteboards.useQuery()
  
  const createMutation = trpc.createWhiteboard.useMutation({
    onSuccess: () => {
      setName("")
      utils.getWhiteboards.invalidate()
    }
  })

  const deleteMutation = trpc.deleteWhiteboard.useMutation({
    onSuccess: () => {
      utils.getWhiteboards.invalidate()
    }
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      createMutation.mutate({ name })
    }
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Project Canvas</h2>
          <p className="text-slate-500 text-sm font-medium">Create and manage your collaborative drawing spaces.</p>
        </div>

        {/* 1. Create New Section */}
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 p-2 bg-white border rounded-2xl shadow-sm max-w-xl group focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
          <Input
            placeholder="New whiteboard name (e.g. System Design)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 border-none shadow-none focus-visible:ring-0 text-base"
            required
          />
          <Button 
            disabled={createMutation.isPending} 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
             {createMutation.isPending ? "Creating..." : (
               <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Board
               </span>
             )}
          </Button>
        </form>
      </div>

      {/* 2. List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1,2,3].map(i => (
             <Card key={i} className="rounded-3xl border-slate-100 h-[220px]">
                <CardHeader className="gap-2">
                   <Skeleton className="h-6 w-3/4 rounded-md" />
                   <Skeleton className="h-4 w-1/4 rounded-md" />
                </CardHeader>
                <CardContent>
                   <Skeleton className="h-10 w-full rounded-xl" />
                </CardContent>
             </Card>
          ))
        ) : !whiteboards || whiteboards.length === 0 ? (
           <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
              <div className="max-w-xs mx-auto space-y-4">
                 <div className="h-12 w-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                    <Box className="h-6 w-6" />
                 </div>
                 <div className="space-y-1">
                    <p className="font-bold text-slate-600">No projects yet</p>
                    <p className="text-sm text-slate-400">Give your first project a name and click "Create Board" to begin.</p>
                 </div>
              </div>
           </div>
        ) : (
          whiteboards.map((board) => (
            <Card 
              key={board.id} 
              className="group relative rounded-3xl border-slate-100 bg-white hover:border-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/5 hover:translate-y-[-4px] transition-all duration-300 overflow-hidden"
            >
              <CardHeader className="pb-10">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold tracking-tight group-hover:text-blue-600 transition-colors uppercase">
                    {board.name}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-lg"
                    onClick={() => deleteMutation.mutate({ id: board.id })}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription className="flex items-center gap-1.5 font-medium text-[10px] tracking-widest uppercase text-slate-400">
                  <Clock className="h-3 w-3" />
                  Updated {new Date(board.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                 <Link href={`/whiteboard/${board.id}`}>
                    <Button className="w-full h-12 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-slate-950/5 transition-all ring-offset-2 ring-blue-500/10 focus:ring-4">
                       Enter Workspace
                       <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                 </Link>
              </CardContent>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
