/**
 * useGlobalTicker Hook
 *
 * Manages real-time global bid ticker connection using WebSocket.
 * Falls back to polling (30s) if WebSocket connection fails.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TickerEvent, TickerWSMessage } from '../types/ticker.types';

const WS_API_URL = process.env.VITE_WS_API_URL || '';
const MAX_EVENTS = 200;
const POLL_INTERVAL = 30000;

interface UseGlobalTickerOptions {
  enabled?: boolean;
  maxEvents?: number;
  onEvent?: (event: TickerEvent) => void;
  onError?: (error: string) => void;
}

const wsMessageTypeToTickerEvent: Record<string, TickerEvent['type']> = {
  'ticker:bid': 'bid_placed',
  'ticker:auction_sold': 'auction_sold',
  'ticker:auction_ended': 'auction_ended',
  'ticker:auction_cancelled': 'auction_cancelled',
  'ticker:auction_ending': 'auction_ending',
  'ticker:auction_updated': 'auction_updated',
};

export const useGlobalTicker = ({
  enabled = true,
  maxEvents = MAX_EVENTS,
  onEvent,
  onError,
}: UseGlobalTickerOptions = {}) => {
  const [events, setEvents] = useState<TickerEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const pingIntervalRef = useRef<NodeJS.Timeout>();
  const MAX_RECONNECT = 10;

  // Use refs for callback props to avoid reconnect loops
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const maxEventsRef = useRef(maxEvents);
  maxEventsRef.current = maxEvents;

  const startPing = useCallback(() => {
    if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action: 'ping' }));
      }
    }, 30000);
  }, []);

  const stopPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = undefined;
    }
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !WS_API_URL) return;

    try {
      const ws = new WebSocket(WS_API_URL);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        startPing();
        ws.send(JSON.stringify({ action: 'ticker:join' }));
      };

      ws.onmessage = (event) => {
        try {
          const message: TickerWSMessage = JSON.parse(event.data);

          if (message.type === 'ticker:joined' || message.type === 'pong') {
            return;
          }

          const eventType = wsMessageTypeToTickerEvent[message.type];
          if (!eventType) return;

          const tickerEvent: TickerEvent = {
            type: eventType,
            auctionId: message.auctionId || message.data?.auctionId,
            auctionTitle: message.data?.auctionTitle,
            categoryName: message.data?.categoryName,
            bidId: message.data?.bidId,
            bidderId: message.data?.bidderId,
            bidderName: message.data?.bidderName,
            amount: message.data?.amount,
            previousBid: message.data?.previousBid,
            winnerId: message.data?.winnerId,
            minutesLeft: message.data?.minutesLeft,
            timestamp: message.data?.timestamp || new Date().toISOString(),
          };

          setEvents((prev) => [tickerEvent, ...prev].slice(0, maxEventsRef.current));
          onEventRef.current?.(tickerEvent);
        } catch (err) {
          console.error('Failed to parse ticker WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        stopPing();

        if (reconnectAttempts.current < MAX_RECONNECT) {
          reconnectAttempts.current += 1;
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttempts.current),
            30000,
          );
          reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
        } else {
          setError('WebSocket connection lost. Using polling fallback.');
          onErrorRef.current?.('WebSocket connection lost');
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
        onErrorRef.current?.('Connection error');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to initialize WebSocket');
      onErrorRef.current?.('Failed to connect');
    }
  }, [enabled, startPing, stopPing]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    stopPing();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [stopPing]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    events,
    isConnected,
    error,
    clearEvents,
    disconnect,
    reconnect: connect,
  };
};
