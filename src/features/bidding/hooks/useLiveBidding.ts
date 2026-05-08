/**
 * useLiveBidding Hook
 *
 * Manages real-time bidding connection using WebSocket
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { LiveBiddingState, WSMessage } from '../types/bidding.types';

const WS_BASE_URL = process.env.VITE_WS_BASE_URL || 'ws://localhost:3000';

interface UseLiveBiddingOptions {
  auctionId: number;
  enabled?: boolean;
  onBidPlaced?: (bid: any) => void;
  onAuctionEnded?: () => void;
  onError?: (error: string) => void;
}

export const useLiveBidding = ({
  auctionId,
  enabled = true,
  onBidPlaced,
  onAuctionEnded,
  onError,
}: UseLiveBiddingOptions) => {
  const [state, setState] = useState<LiveBiddingState>({
    isConnected: false,
    currentBid: 0,
    bidCount: 0,
    timeRemaining: 0,
    bids: [],
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  // Use refs for callback props to avoid reconnect loops
  const onBidPlacedRef = useRef(onBidPlaced);
  onBidPlacedRef.current = onBidPlaced;
  const onAuctionEndedRef = useRef(onAuctionEnded);
  onAuctionEndedRef.current = onAuctionEnded;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const connect = useCallback(() => {
    if (!enabled) return;

    try {
      const ws = new WebSocket(`${WS_BASE_URL}/bidding/${auctionId}`);

      ws.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true }));
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'bid_placed':
              setState(prev => ({
                ...prev,
                currentBid: message.data.amount,
                bidCount: prev.bidCount + 1,
                bids: [message.data, ...prev.bids].slice(0, 50),
              }));
              onBidPlacedRef.current?.(message.data);
              break;

            case 'price_updated':
              setState(prev => ({
                ...prev,
                currentBid: message.data.currentBid,
              }));
              break;

            case 'timer_update':
              setState(prev => ({
                ...prev,
                timeRemaining: message.data.timeRemaining,
              }));
              break;

            case 'auction_ended':
              setState(prev => ({ ...prev, isConnected: false }));
              ws.close();
              onAuctionEndedRef.current?.();
              break;

            case 'error':
              onErrorRef.current?.(message.data.message);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WS message:', error);
        }
      };

      ws.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false }));

        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onErrorRef.current?.('Connection error');
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      onErrorRef.current?.('Failed to connect');
    }
  }, [auctionId, enabled]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  const sendBid = useCallback((amount: number, maxAmount?: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'place_bid',
        data: { amount, maxAmount },
      }));
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    ...state,
    sendBid,
    disconnect,
    reconnect: connect,
  };
};
