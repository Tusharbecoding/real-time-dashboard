// Core Data Types
export interface Trade {
  id: string;
  timestamp: number;
  datetime: string;
  symbol: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  cost: number;
  exchange: string;
}

export interface OHLCV {
  timestamp: number;
  datetime: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Ticker {
  symbol: string;
  timestamp: number;
  datetime: string;
  high: number;
  low: number;
  bid: number;
  ask: number;
  last: number;
  close: number;
  change: number;
  percentage: number;
  average: number;
  baseVolume: number;
  quoteVolume: number;
}

export interface OrderBookEntry {
  price: number;
  amount: number;
}

export interface OrderBook {
  symbol: string;
  timestamp: number;
  datetime: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

// WebSocket Connection Types
export type ConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error"
  | "reconnecting";

export interface WebSocketState {
  status: ConnectionStatus;
  lastUpdate: number;
  error: string | null;
  retryCount: number;
  maxRetries: number;
}

export interface ExchangeConfig {
  id: string;
  name: string;
  testnet: boolean;
  apiKey?: string;
  secret?: string;
  sandbox?: boolean;
  urls?: {
    api?: string;
    test?: string;
  };
}

// Panel Types
export type PanelType = "trades" | "chart" | "market-data" | "orderbook";

export interface PanelConfig {
  id: string;
  type: PanelType;
  title: string;
  symbol?: string;
  timeframe?: string;
  exchange?: string;
}

// Chart Types
export interface ChartConfig {
  symbol: string;
  timeframe: "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d" | "1w";
  exchange: string;
  indicators?: string[];
}

// Dashboard Layout Types
export interface LayoutConfig {
  version: string;
  panels: PanelConfig[];
  layout: any; // dockview layout object
}

// Market Data Types
export interface MarketSummary {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap?: number;
  rank?: number;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
  timestamp: number;
  exchange?: string;
  symbol?: string;
}

// Store State Types
export interface TradesState {
  trades: Trade[];
  isLoading: boolean;
  error: ApiError | null;
  lastUpdate: number;
}

export interface ChartState {
  ohlcv: OHLCV[];
  isLoading: boolean;
  error: ApiError | null;
  lastUpdate: number;
  symbol: string;
  timeframe: string;
}

export interface MarketState {
  tickers: Record<string, Ticker>;
  watchlist: CryptoAsset[];
  isLoading: boolean;
  error: ApiError | null;
  lastUpdate: number;
}

export interface AppState {
  trades: TradesState;
  chart: ChartState;
  market: MarketState;
  websocket: WebSocketState;
  layout: LayoutConfig | null;
}

// Hook Return Types
export interface UseWebSocketDataReturn {
  trades: Trade[];
  ohlcv: OHLCV[];
  tickers: Record<string, Ticker>;
  connectionStatus: ConnectionStatus;
  error: ApiError | null;
  subscribe: (symbol: string, type: "trades" | "ohlcv" | "ticker") => void;
  unsubscribe: (symbol: string, type: "trades" | "ohlcv" | "ticker") => void;
  reconnect: () => void;
}

// Component Props Types
export interface DashboardProps {
  initialLayout?: LayoutConfig;
}

export interface TradePanelProps {
  symbol?: string;
  exchange?: string;
  maxTrades?: number;
}

export interface ChartPanelProps {
  symbol: string;
  timeframe: string;
  exchange: string;
  height?: number;
}

export interface MarketDataPanelProps {
  watchlist?: string[];
  showOrderBook?: boolean;
}

// Utility Types
export type TimeRange = "1h" | "4h" | "1d" | "1w" | "1m" | "3m" | "1y";
export type DataUpdateFrequency = "realtime" | "fast" | "normal" | "slow";

export interface DataThrottleConfig {
  trades: number; // milliseconds
  ohlcv: number;
  ticker: number;
  orderbook: number;
}

// Constants
export const DEFAULT_SYMBOLS = [
  "BTC/USDT",
  "ETH/USDT",
  "BNB/USDT",
  "ADA/USDT",
  "SOL/USDT",
  "XRP/USDT",
  "DOT/USDT",
  "AVAX/USDT",
] as const;

export const DEFAULT_EXCHANGES = [
  "binance",
  "coinbase",
  "kraken",
  "bybit",
  "okx",
] as const;

export const TIMEFRAMES = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "4h",
  "1d",
  "1w",
] as const;

export type DefaultSymbol = (typeof DEFAULT_SYMBOLS)[number];
export type DefaultExchange = (typeof DEFAULT_EXCHANGES)[number];
export type Timeframe = (typeof TIMEFRAMES)[number];
