import { NextRequest, NextResponse } from 'next/server';

const widgetUpdates = new Map<string, {
  data: any;
  timestamp: number;
  subscribers: Set<string>;
}>();

const activeSubscriptions = new Map<string, Set<string>>(); // clientId -> Set of widgetIds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('clientId') || crypto.randomUUID();
  
  const stream = new ReadableStream({
    start(controller) {
        controller.enqueue(`data: ${JSON.stringify({
        type: 'connection_status',
        message: 'Connected to FinBoard real-time updates',
        clientId: clientId
      })}\n\n`);

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: Date.now()
          })}\n\n`);
        } catch (error) {
          clearInterval(heartbeat);
        }
      }, 30000); 

      const cleanup = () => {
        clearInterval(heartbeat);
        const subscriptions = activeSubscriptions.get(clientId);
        if (subscriptions) {
          subscriptions.forEach(widgetId => {
            const update = widgetUpdates.get(widgetId);
            if (update) {
              update.subscribers.delete(clientId);
              if (update.subscribers.size === 0) {
                widgetUpdates.delete(widgetId);
              }
            }
          });
          activeSubscriptions.delete(clientId);
        }
      };

      request.signal.addEventListener('abort', cleanup);
      
      return cleanup;
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, widgetId, clientId, data } = body;

    switch (type) {
      case 'subscribe':
        if (widgetId && clientId) {

            if (!activeSubscriptions.has(clientId)) {
            activeSubscriptions.set(clientId, new Set());
          }
          activeSubscriptions.get(clientId)!.add(widgetId);

          if (!widgetUpdates.has(widgetId)) {
            widgetUpdates.set(widgetId, {
              data: null,
              timestamp: Date.now(),
              subscribers: new Set()
            });
          }
          widgetUpdates.get(widgetId)!.subscribers.add(clientId);

          return NextResponse.json({ 
            success: true, 
            message: `Subscribed to widget ${widgetId}` 
          });
        }
        break;

      case 'unsubscribe':
        if (widgetId && clientId) {

            const subscriptions = activeSubscriptions.get(clientId);
          if (subscriptions) {
            subscriptions.delete(widgetId);
            if (subscriptions.size === 0) {
              activeSubscriptions.delete(clientId);
            }
          }
          const update = widgetUpdates.get(widgetId);
          if (update) {
            update.subscribers.delete(clientId);
            if (update.subscribers.size === 0) {
              widgetUpdates.delete(widgetId);
            }
          }

          return NextResponse.json({ 
            success: true, 
            message: `Unsubscribed from widget ${widgetId}` 
          });
        }
        break;

      case 'update':
        if (widgetId && data) {

            if (!widgetUpdates.has(widgetId)) {
            widgetUpdates.set(widgetId, {
              data: null,
              timestamp: Date.now(),
              subscribers: new Set()
            });
          }
          
          const update = widgetUpdates.get(widgetId)!;
          update.data = data;
          update.timestamp = Date.now();



          return NextResponse.json({ 
            success: true, 
            message: `Updated widget ${widgetId}`,
            subscribers: update.subscribers.size,
            timestamp: update.timestamp
          });
        }
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          error: `Unknown message type: ${type}` 
        }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Missing required parameters' 
    }, { status: 400 });

  } catch (error) {
    console.error('WebSocket API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, lastUpdate } = body;

    if (!clientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing clientId' 
      }, { status: 400 });
    }

    const subscriptions = activeSubscriptions.get(clientId);
    if (!subscriptions) {
      return NextResponse.json({ updates: [] });
    }

    const updates: any[] = [];
    const lastUpdateTime = lastUpdate ? new Date(lastUpdate).getTime() : 0;

    subscriptions.forEach(widgetId => {
      const update = widgetUpdates.get(widgetId);
      if (update && update.data && update.timestamp > lastUpdateTime) {
        updates.push({
          widgetId,
          data: update.data,
          timestamp: update.timestamp
        });
      }
    });
    return NextResponse.json({ updates });

  } catch (error) {
    console.error('Get updates error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}