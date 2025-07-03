export interface Trade {
  timestamp: number;
  symbol: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
  exchange: string;
}

export interface BinanceTradeData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  t: number; // Trade ID
  p: string; // Price
  q: string; // Quantity
  b: number; // Buyer order ID
  a: number; // Seller order ID
  T: number; // Trade time
  m: boolean; // Is the buyer the market maker?
  M: boolean; // Ignore
}

export interface BinanceTickerData {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // Previous day's close price
  c: string; // Current day's close price
  Q: string; // Close trades quantity
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade ID
  n: number; // Total number of trades
}

export interface TickerInfo {
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

export class BinanceWebSocketService {
  private tradeWs: WebSocket | null = null;
  private tickerWs: WebSocket | null = null;
  private onTradeCallback: ((trade: Trade) => void) | null = null;
  private onTickerCallback: ((ticker: TickerInfo) => void) | null = null;
  private onStatusCallback:
    | ((status: "connected" | "disconnected" | "error") => void)
    | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isConnecting = false;

  private symbols = ["btcusdt", "ethusdt", "adausdt", "dotusdt", "linkusdt"];

  constructor() {}

  public connect(
    onTrade: (trade: Trade) => void,
    onStatus: (status: "connected" | "disconnected" | "error") => void,
    onTicker?: (ticker: TickerInfo) => void
  ) {
    this.onTradeCallback = onTrade;
    this.onTickerCallback = onTicker || null;
    this.onStatusCallback = onStatus;
    this.connectTradeWebSocket();
    if (onTicker) {
      this.connectTickerWebSocket();
    }
  }

  private connectTradeWebSocket() {
    if (
      this.isConnecting ||
      (this.tradeWs && this.tradeWs.readyState === WebSocket.OPEN)
    ) {
      return;
    }

    this.isConnecting = true;

    const streams = this.symbols.map((symbol) => `${symbol}@trade`).join("/");
    const wsUrl = `wss://stream.binance.com:9443/ws/${streams}`;

    try {
      this.tradeWs = new WebSocket(wsUrl);

      this.tradeWs.onopen = () => {
        this.isConnecting = false;
        console.log("Binance Trade WebSocket connected");
        this.onStatusCallback?.("connected");
      };

      this.tradeWs.onmessage = (event) => {
        try {
          const data: BinanceTradeData = JSON.parse(event.data);

          const trade: Trade = {
            timestamp: data.T,
            symbol: data.s,
            price: parseFloat(data.p),
            amount: parseFloat(data.q),
            side: data.m ? "sell" : "buy",
            exchange: "Binance",
          };

          this.onTradeCallback?.(trade);
        } catch (error) {
          console.error("Error parsing trade data:", error);
        }
      };

      this.tradeWs.onclose = () => {
        this.isConnecting = false;
        console.log("Binance Trade WebSocket disconnected");
        this.onStatusCallback?.("disconnected");
        this.scheduleReconnect();
      };

      this.tradeWs.onerror = (error) => {
        this.isConnecting = false;
        console.error("Binance Trade WebSocket error:", error);
        this.onStatusCallback?.("error");
        this.scheduleReconnect();
      };
    } catch (error) {
      this.isConnecting = false;
      console.error("Failed to create Trade WebSocket connection:", error);
      this.onStatusCallback?.("error");
      this.scheduleReconnect();
    }
  }

  private connectTickerWebSocket() {
    const tickerStreams = this.symbols
      .map((symbol) => `${symbol}@ticker`)
      .join("/");
    const tickerWsUrl = `wss://stream.binance.com:9443/ws/${tickerStreams}`;

    try {
      this.tickerWs = new WebSocket(tickerWsUrl);

      this.tickerWs.onopen = () => {
        console.log("Binance Ticker WebSocket connected");
      };

      this.tickerWs.onmessage = (event) => {
        try {
          const data: BinanceTickerData = JSON.parse(event.data);

          const ticker: TickerInfo = {
            symbol: data.s,
            timestamp: data.C,
            datetime: new Date(data.C).toISOString(),
            high: parseFloat(data.h),
            low: parseFloat(data.l),
            bid: parseFloat(data.b),
            ask: parseFloat(data.a),
            last: parseFloat(data.c),
            close: parseFloat(data.c),
            change: parseFloat(data.p),
            percentage: parseFloat(data.P),
            average: parseFloat(data.w),
            baseVolume: parseFloat(data.v),
            quoteVolume: parseFloat(data.q),
          };

          this.onTickerCallback?.(ticker);
        } catch (error) {
          console.error("Error parsing ticker data:", error);
        }
      };

      this.tickerWs.onclose = () => {
        console.log("Binance Ticker WebSocket disconnected");
      };

      this.tickerWs.onerror = (error) => {
        console.error("Binance Ticker WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create Ticker WebSocket connection:", error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      console.log("Attempting to reconnect to Binance WebSocket...");
      this.connectTradeWebSocket();
      if (this.onTickerCallback) {
        this.connectTickerWebSocket();
      }
    }, 3000);
  }

  public disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.tradeWs) {
      this.tradeWs.close();
      this.tradeWs = null;
    }

    if (this.tickerWs) {
      this.tickerWs.close();
      this.tickerWs = null;
    }

    this.onTradeCallback = null;
    this.onTickerCallback = null;
    this.onStatusCallback = null;
    this.isConnecting = false;
  }

  public isConnected(): boolean {
    return this.tradeWs?.readyState === WebSocket.OPEN;
  }
}
