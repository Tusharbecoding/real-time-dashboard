import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { Trade, ConnectionStatus, ApiError, Ticker } from "@/types";

interface DashboardState {
  connectionStatus: ConnectionStatus;
  lastUpdate: number;
  error: ApiError | null;
  trades: Trade[];
  tickers: Record<string, Ticker>;
  setConnectionStatus: (status: ConnectionStatus) => void;
  setError: (error: ApiError | null) => void;
  addTrade: (trade: Trade) => void;
  updateTicker: (ticker: Ticker) => void;
  updateLastUpdate: () => void;
  clearAllData: () => void;
}

export const useDashboardStore = create<DashboardState>()(
  subscribeWithSelector((set, get) => ({
    connectionStatus: "disconnected",
    lastUpdate: Date.now(),
    error: null,
    trades: [],
    tickers: {},
    setConnectionStatus: (status) =>
      set({ connectionStatus: status, lastUpdate: Date.now() }),
    setError: (error) => set({ error, lastUpdate: Date.now() }),
    addTrade: (trade) =>
      set((state) => ({
        trades: [trade, ...state.trades],
        lastUpdate: Date.now(),
      })),
    updateTicker: (ticker) =>
      set((state) => ({
        tickers: { ...state.tickers, [ticker.symbol]: ticker },
        lastUpdate: Date.now(),
      })),
    updateLastUpdate: () => set({ lastUpdate: Date.now() }),
    clearAllData: () =>
      set({ trades: [], tickers: {}, error: null, lastUpdate: Date.now() }),
  }))
);

export const useConnectionStatus = () =>
  useDashboardStore((state) => state.connectionStatus);
export const useTrades = () => useDashboardStore((state) => state.trades);
export const useTickers = () => useDashboardStore((state) => state.tickers);
export const useError = () => useDashboardStore((state) => state.error);
export const useLastUpdate = () =>
  useDashboardStore((state) => state.lastUpdate);
