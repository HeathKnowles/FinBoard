"use client";

import { memo, useEffect } from "react";
import { useRealTimeWidget } from "@/hooks/useRealTimeWidget";

interface RealTimeWidgetWrapperProps {
  widget: any;
  children: React.ReactNode;
}

const RealTimeWidgetWrapper = memo(function RealTimeWidgetWrapper({ 
  widget, 
  children 
}: RealTimeWidgetWrapperProps) {
  const { isConnected } = useRealTimeWidget(widget.id, true);

  useEffect(() => {
    if (isConnected) {
      console.log(`Widget ${widget.id} is receiving real-time updates`);
    }
  }, [isConnected, widget.id]);

  return (
    <>
      {children}
      {isConnected && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" 
             title="Real-time updates active" />
      )}
    </>
  );
});

export default RealTimeWidgetWrapper;