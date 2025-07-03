"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDashboardStore } from "@/store/dashboardStore";
import {
  BinanceWebSocketService,
  Trade as BinanceTrade,
  TickerInfo as BinanceTickerInfo,
} from "@/services/binanceWebSocket";
import { Trade, Ticker, ConnectionStatus, ApiError } from "@/types";

// Binance WebSocket endpoint for trades (BTCUSDT)
const BINANCE_WS_URL = "wss://stream.binance.com:9443/ws/btcusdt@trade";

/**
 * WebSocket Data Management Hook
 * Simulates real-time cryptocurrency data streams
 * In production, this would connect to actual exchange WebSocket APIs
 */

interface UseWebSocketDataOptions {
  autoStart?: boolean;
  tradeInterval?: number;
  tickerInterval?: number;
  enableTrades?: boolean;
  enableTickers?: boolean;
  symbols?: string[];
}

interface UseWebSocketDataReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  retryCount: number;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
}

export function useWebSocketData(): UseWebSocketDataReturn {
  const {
    setConnectionStatus,
    setError,
    addTrade,
    updateTicker,
    updateLastUpdate,
    clearAllData,
  } = useDashboardStore();

  const binanceServiceRef = useRef<BinanceWebSocketService | null>(null);
  const retryCountRef = useRef(0);

  // Convert Binance trade to our Trade interface
  const convertBinanceTradeToTrade = (binanceTrade: BinanceTrade): Trade => {
    const datetime = new Date(binanceTrade.timestamp).toISOString();
    const cost = binanceTrade.price * binanceTrade.amount;

    return {
      id: `${binanceTrade.symbol}-${binanceTrade.timestamp}`,
      timestamp: binanceTrade.timestamp,
      datetime,
      symbol: binanceTrade.symbol
        .replace("USDT", "/USDT")
        .replace("BTC", "BTC")
        .replace("ETH", "ETH"),
      side: binanceTrade.side,
      amount: binanceTrade.amount,
      price: binanceTrade.price,
      cost,
      exchange: binanceTrade.exchange.toLowerCase(),
    };
  };

  // Convert Binance ticker to our Ticker interface
  const convertBinanceTickerToTicker = (
    binanceTicker: BinanceTickerInfo
  ): Ticker => {
    return {
      symbol: binanceTicker.symbol
        .replace("USDT", "/USDT")
        .replace("BTC", "BTC")
        .replace("ETH", "ETH"),
      timestamp: binanceTicker.timestamp,
      datetime: binanceTicker.datetime,
      high: binanceTicker.high,
      low: binanceTicker.low,
      bid: binanceTicker.bid,
      ask: binanceTicker.ask,
      last: binanceTicker.last,
      close: binanceTicker.close,
      change: binanceTicker.change,
      percentage: binanceTicker.percentage,
      average: binanceTicker.average,
      baseVolume: binanceTicker.baseVolume,
      quoteVolume: binanceTicker.quoteVolume,
    };
  };

  const connect = useCallback(() => {
    if (!binanceServiceRef.current) {
      binanceServiceRef.current = new BinanceWebSocketService();
      clearAllData();
    }

    setConnectionStatus("connecting");
    setError(null);

    binanceServiceRef.current.connect(
      (binanceTrade: BinanceTrade) => {
        const trade = convertBinanceTradeToTrade(binanceTrade);
        addTrade(trade);
        updateLastUpdate();
        retryCountRef.current = 0; // Reset retry count on successful data
      },
      (status: "connected" | "disconnected" | "error") => {
        const connectionStatus: ConnectionStatus =
          status === "error"
            ? "error"
            : status === "connected"
            ? "connected"
            : "disconnected";

        setConnectionStatus(connectionStatus);

        if (status === "error") {
          retryCountRef.current += 1;
          const error: ApiError = {
            code: "WS_ERROR",
            message: `WebSocket connection error (attempt ${retryCountRef.current})`,
            timestamp: Date.now(),
          };
          setError(error);
        } else if (status === "connected") {
          retryCountRef.current = 0;
        }
      },
      (binanceTicker: BinanceTickerInfo) => {
        const ticker = convertBinanceTickerToTicker(binanceTicker);
        updateTicker(ticker);
        updateLastUpdate();
      }
    );
  }, [
    setConnectionStatus,
    setError,
    addTrade,
    updateTicker,
    updateLastUpdate,
    clearAllData,
  ]);

  const disconnect = useCallback(() => {
    if (binanceServiceRef.current) {
      binanceServiceRef.current.disconnect();
    }
    setConnectionStatus("disconnected");
  }, [setConnectionStatus]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 1000);
  }, [connect, disconnect]);

  // Auto-connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (binanceServiceRef.current) {
        binanceServiceRef.current.disconnect();
      }
    };
  }, [connect]);

  const currentState = useDashboardStore.getState();

  return {
    isConnected: currentState.connectionStatus === "connected",
    isConnecting: currentState.connectionStatus === "connecting",
    error: currentState.error?.message || null,
    retryCount: retryCountRef.current,
    connect,
    disconnect,
    reconnect,
    subscribe: () => {}, // Not needed for this implementation
    unsubscribe: () => {}, // Not needed for this implementation
  };
}

/**
 * Hook for component-specific WebSocket data
 */
export function useSymbolData(symbol: string) {
  useWebSocketData();
  const trades = useDashboardStore((state) =>
    state.trades.filter((trade) => trade.symbol === symbol)
  );

  return {
    trades,
  };
}
