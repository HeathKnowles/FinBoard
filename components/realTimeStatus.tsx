"use client";

import { Badge } from "@/components/ui/badge";
import { useRealTimeConnection } from "@/hooks/useRealTimeWidget";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";

export default function RealTimeStatus() {
  const { isConnected, clientId } = useRealTimeConnection();

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              className={`text-xs px-2 py-1 ${
                isConnected 
                  ? 'bg-green-900/30 text-green-400 border border-green-700/50' 
                  : 'bg-red-900/30 text-red-400 border border-red-700/50'
              }`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`} />
              {isConnected ? 'Real-time ON' : 'Real-time OFF'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="text-xs">
            Client ID: {clientId}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}