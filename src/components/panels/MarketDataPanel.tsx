"use client";

import React, { useState, useMemo } from "react";
import { useTickers } from "@/store/dashboardStore";
import {
  Search,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

const MarketDataPanel: React.FC = () => {
  const tickers = useTickers();
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const tickersList = useMemo(() => {
    const filtered = Object.values(tickers).filter(
      (ticker) =>
        ticker.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticker.symbol
          .replace("/USDT", "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => b.quoteVolume - a.quoteVolume);
  }, [tickers, searchTerm]);

  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    } else if (price >= 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(6);
    }
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    } else {
      return volume.toFixed(2);
    }
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-emerald-400";
    if (change < 0) return "text-red-400";
    return "text-slate-400";
  };

  const getChangeBgColor = (change: number) => {
    if (change > 0) return "bg-emerald-500/10 border-emerald-500/20";
    if (change < 0) return "bg-red-500/10 border-red-500/20";
    return "bg-slate-500/10 border-slate-500/20";
  };

  const toggleFavorite = (symbol: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(symbol)) {
      newFavorites.delete(symbol);
    } else {
      newFavorites.add(symbol);
    }
    setFavorites(newFavorites);
  };

  if (tickersList.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-800 text-slate-400 p-4">
        <div className="text-center">
          <div className="relative mb-4">
            <Activity className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-blue-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full animate-ping"></div>
          </div>
          <div className="text-lg sm:text-xl font-semibold mb-2 text-slate-200">
            Loading Market Data
          </div>
          <div className="text-sm text-slate-500">
            Establishing connection to live data streams...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-800 text-white flex flex-col overflow-hidden">
      <div className="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3 bg-gray-800 backdrop-blur-sm border-b border-slate-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-slate-100">
                Market Overview
              </h2>
              <p className="text-xs text-slate-500">Live market data</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-slate-400">Live</span>
            </div>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">{tickersList.length} pairs</span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all touch-manipulation"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600">
        <div className="p-1 sm:p-2 space-y-1 sm:space-y-2">
          {tickersList.map((ticker) => {
            const symbol = ticker.symbol.replace("/USDT", "");
            const isPositive = ticker.change >= 0;

            return (
              <div
                key={ticker.symbol}
                className="group relative bg-slate-900/30 backdrop-blur-sm border border-slate-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-slate-800/40 hover:border-slate-700/50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => toggleFavorite(ticker.symbol)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-0 -m-1 sm:m-0 touch-manipulation"
                        >
                          <Star
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              favorites.has(ticker.symbol)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-slate-500 hover:text-slate-400"
                            }`}
                          />
                        </button>
                        <div className="min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="text-base sm:text-lg font-bold text-slate-100 truncate">
                              {symbol}
                            </span>
                            <span className="text-xs text-slate-500 bg-slate-800/50 px-1.5 sm:px-2 py-0.5 rounded text-nowrap">
                              {ticker.symbol}
                            </span>
                          </div>
                          <div className="text-lg sm:text-xl font-mono font-semibold text-slate-100">
                            ${formatPrice(ticker.last)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-1 sm:gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div
                        className={`flex items-center gap-1 ${getChangeColor(
                          ticker.change
                        )}`}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        )}
                        <span className="font-semibold text-sm sm:text-base">
                          {isPositive ? "+" : ""}
                          {ticker.percentage.toFixed(2)}%
                        </span>
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-mono ${getChangeColor(
                          ticker.change
                        )}`}
                      >
                        {isPositive ? "+" : ""}${formatPrice(ticker.change)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs mb-2 sm:mb-3">
                  <div className="bg-slate-800/30 rounded-md sm:rounded-lg p-1.5 sm:p-2">
                    <div className="text-slate-500 mb-0.5 sm:mb-1">
                      24h High
                    </div>
                    <div className="font-semibold text-emerald-400 font-mono text-xs sm:text-sm">
                      ${formatPrice(ticker.high)}
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-md sm:rounded-lg p-1.5 sm:p-2">
                    <div className="text-slate-500 mb-0.5 sm:mb-1">24h Low</div>
                    <div className="font-semibold text-red-400 font-mono text-xs sm:text-sm">
                      ${formatPrice(ticker.low)}
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-md sm:rounded-lg p-1.5 sm:p-2">
                    <div className="text-slate-500 mb-0.5 sm:mb-1">Volume</div>
                    <div className="font-semibold text-slate-300 font-mono text-xs sm:text-sm">
                      ${formatVolume(ticker.quoteVolume)}
                    </div>
                  </div>

                  <div className="bg-slate-800/30 rounded-md sm:rounded-lg p-1.5 sm:p-2">
                    <div className="text-slate-500 mb-0.5 sm:mb-1">Spread</div>
                    <div className="font-semibold text-slate-300 font-mono text-xs sm:text-sm">
                      {(((ticker.ask - ticker.bid) / ticker.bid) * 100).toFixed(
                        3
                      )}
                      %
                    </div>
                  </div>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-slate-800/50">
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Bid</span>
                        <span className="text-red-400 font-mono font-semibold text-xs sm:text-sm">
                          ${formatPrice(ticker.bid)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Ask</span>
                        <span className="text-emerald-400 font-mono font-semibold text-xs sm:text-sm">
                          ${formatPrice(ticker.ask)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute left-0 top-0 w-1 h-full rounded-l-lg sm:rounded-l-xl ${
                    getChangeBgColor(ticker.change).split(" ")[0]
                  }`}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MarketDataPanel;
