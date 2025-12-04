"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateWidgetData } from '@/store/widgetsSlice';
import { realTimeClient } from '@/lib/websocketClient';

export function useRealTimeWidget(widgetId: string, enabled: boolean = true) {
  const dispatch = useAppDispatch();
  const isSubscribedRef = useRef(false);
  const [isClient, setIsClient] = useState(false);

  const handleWidgetUpdate = useCallback((receivedWidgetId: string, data: any) => {
    if (receivedWidgetId === widgetId) {
      const preparedData = Array.isArray(data) ? data : [data];
    
      const flattenedKeys: string[] = [];
      if (preparedData.length > 0) {
        const sample = preparedData[0];
        Object.keys(sample).forEach(key => {
          if (typeof sample[key] !== 'object') {
            flattenedKeys.push(key);
          }
        });
      }
      
      dispatch(updateWidgetData({
        id: widgetId,
        data: preparedData,
        flattened: flattenedKeys,
        cached: false,
        stale: false,
        fromFallback: false,
      }));
    }
  }, [widgetId, dispatch]);

  useEffect(() => {
    
    setIsClient(true);
    
    if (enabled && !isSubscribedRef.current) {
      realTimeClient.subscribeToWidget(widgetId, handleWidgetUpdate);
      isSubscribedRef.current = true;
    } else if (!enabled && isSubscribedRef.current) {
      realTimeClient.unsubscribeFromWidget(widgetId);
      isSubscribedRef.current = false;
    }

    return () => {
      if (isSubscribedRef.current) {
        realTimeClient.unsubscribeFromWidget(widgetId);
        isSubscribedRef.current = false;
      }
    };
  }, [widgetId, enabled, handleWidgetUpdate]);

  return {
    isConnected: isClient ? realTimeClient.getConnectionStatus() : false,
  };
}

export function useRealTimeConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const unsubscribe = realTimeClient.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    return unsubscribe;
  }, []);

  return {
    isConnected: isClient ? isConnected : false,
    clientId: isClient ? realTimeClient.getClientId() : '',
  };
}