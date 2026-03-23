"use client"

import { useParams, useRouter } from "next/navigation"
import { WhiteboardEditor } from "@/components/whiteboard-editor"
import { Button } from "@workspace/ui/components/button"
import { ChevronLeft, Share2, MoreHorizontal } from "lucide-react"

export default function WhiteboardPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  if (!id) return null

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* 1. Editor Sub-Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/")}
            className="hover:bg-white rounded-xl font-bold text-slate-500 hover:text-slate-900 transition-all active:scale-95"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Workspace
          </Button>
          
          <div className="flex flex-col">
            <h1 className="font-black text-xs uppercase tracking-widest text-slate-800">
               Canvas #{id.slice(0, 6)}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold">LIFETIME AUTO-SAVE ACTIVE</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="rounded-xl text-slate-400">
             <MoreHorizontal className="h-4 w-4" />
           </Button>
           <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/10 font-bold px-4">
             <Share2 className="h-3.5 w-3.5 mr-2" />
             Invite
           </Button>
        </div>
      </div>

      {/* 2. The Real-time Canvas */}
      <main className="flex-1 relative">
         <WhiteboardEditor id={id} />
      </main>
    </div>
  )
}
