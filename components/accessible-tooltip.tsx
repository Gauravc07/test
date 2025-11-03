"use client"

import type React from "react"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface AccessibleTooltipProps {
  content: string
  id: string
  children?: React.ReactNode
}

export default function AccessibleTooltip({ content, id, children }: AccessibleTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-describedby={id}
            className="inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            type="button"
          >
            {children || <Info className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />}
          </button>
        </TooltipTrigger>
        <TooltipContent id={id} role="tooltip">
          <p className="text-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
