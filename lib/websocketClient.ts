"use client";

interface RealTimeMessage {
  type: 'widget_update' | 'connection_status' | 'error' | 'heartbeat';
  widgetId?: string;
  data?: any;
  message?: string;
  clientId?: string;
  timestamp?: number;
}

interface WidgetUpdateCallback {
  (widgetId: string, data: any): void;
}

class RealTimeClient {
  private clientId: string = '';
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private callbacks: Map<string, WidgetUpdateCallback> = new Map();
  private connectionCallbacks: Set<(connected: boolean) => void> = new Set();
  private isConnected = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastUpdate: number = 0;

  constructor() {
    this.clientId = this.generateClientId();
  }

  private generateClientId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return 'client_' + crypto.randomUUID();
    }
    return 'client_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
  
  connect() {
    if (this.isConnected) {
      return;
    }

    try {
        const sseUrl = `/api/websocket?clientId=${this.clientId}`;
      this.eventSource = new EventSource(sseUrl);

      this.eventSource.onopen = () => {
        console.log('Real-time connection established');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionCallbacks(true);
        this.startPolling();
      };

      this.eventSource.onmessage = (event) => {
        try {
          const message: RealTimeMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Failed to parse real-time message:', error);
        }
      };

      this.eventSource.onerror = () => {
        console.log('Real-time connection error');
        this.isConnected = false;
        this.notifyConnectionCallbacks(false);
        this.stopPolling();
        this.scheduleReconnect();
      };

    } catch (error) {
      console.error('Failed to create real-time connection:', error);
      this.scheduleReconnect();
    }
  }

  private startPolling() {

    this.pollingInterval = setInterval(async () => {
      await this.pollForUpdates();
    }, 2000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async pollForUpdates() {
    try {
      const response = await fetch('/api/websocket', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: this.clientId,
          lastUpdate: this.lastUpdate || Date.now() - 60000, 
        }),
      });

      if (response.ok) {
        const responseText = await response.text();
        
        if (!responseText.trim()) {
          return;
        }
        
        const { updates } = JSON.parse(responseText);
        
        if (updates && updates.length > 0) {
          console.log(`📦 Polling received ${updates.length} updates:`, updates);
        }
        
        updates?.forEach((update: any) => {
          const callback = this.callbacks.get(update.widgetId);
          if (callback) {
            callback(update.widgetId, update.data);
            this.lastUpdate = Math.max(this.lastUpdate, update.timestamp);
          }
        });
      } else {
        console.error('📡 Polling response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
    }
  }

  private handleMessage(message: RealTimeMessage) {
    switch (message.type) {
      case 'widget_update':
        if (message.widgetId && message.data) {
          const callback = this.callbacks.get(message.widgetId);
          if (callback) {
            callback(message.widgetId, message.data);
          }
        }
        break;
      case 'connection_status':
        if (message.clientId) {
          this.clientId = message.clientId;
        }
        break;
      case 'heartbeat':
        // Keep connection alive
        break;
      case 'error':
        console.error('Real-time server error:', message.message);
        break;
    }
  }

  private scheduleReconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private notifyConnectionCallbacks(connected: boolean) {
    this.connectionCallbacks.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection callback:', error);
      }
    });
  }

  async subscribeToWidget(widgetId: string, callback: WidgetUpdateCallback) {
    this.callbacks.set(widgetId, callback);
    
    try {
      const response = await fetch('/api/websocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'subscribe',
          widgetId: widgetId,
          clientId: this.clientId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to subscribe to widget:', widgetId);
      }
    } catch (error) {
      console.error('Error subscribing to widget:', error);
    }
  }

  async unsubscribeFromWidget(widgetId: string) {
    this.callbacks.delete(widgetId);
    
    try {
      const response = await fetch('/api/websocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'unsubscribe',
          widgetId: widgetId,
          clientId: this.clientId,
        }),
      });

      if (!response.ok) {
        console.error('Failed to unsubscribe from widget:', widgetId);
      }
    } catch (error) {
      console.error('Error unsubscribing from widget:', error);
    }
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.add(callback);
    
    callback(this.isConnected);
    
    return () => {
      this.connectionCallbacks.delete(callback);
    };
  }

  disconnect() {
    this.stopPolling();
    
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.isConnected = false;
    this.notifyConnectionCallbacks(false);
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  getClientId() {
    return this.clientId;
  }
}

export const realTimeClient = new RealTimeClient();

if (typeof window !== 'undefined') {
  realTimeClient.connect();
}