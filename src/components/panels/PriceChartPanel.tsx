"use client";
import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  BarChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { useSymbolData } from "@/hooks/useWebSocketData";
import { Trade } from "@/types";
import { sub, startOfMinute, startOfHour, startOfDay } from "date-fns";

const generateMockTrades = (count: number): Trade[] => {
  const trades: Trade[] = [];
  let lastPrice = 108000;
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const timestamp = now.getTime() - (count - i) * 60 * 1000;
    const priceChange = (Math.random() - 0.49) * (lastPrice * 0.001);
    const price = lastPrice + priceChange;
    const amount = Math.random() * 0.5 + 0.01;

    trades.push({
      id: `mock-${timestamp}`,
      timestamp,
      datetime: new Date(timestamp).toISOString(),
      symbol: "BTC/USDT",
      side: price > lastPrice ? "buy" : "sell",
      price,
      amount,
      cost: price * amount,
      exchange: "mock",
    });
    lastPrice = price;
  }
  return trades;
};

type TimeRange = "1H" | "1D" | "7D" | "1M" | "ALL";

const timeRanges: TimeRange[] = ["1H", "1D", "7D", "1M", "ALL"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 bg-opacity-80 text-white p-2 rounded border border-gray-700">
        <p className="label">{`${new Date(label).toLocaleString()}`}</p>
        <p className="intro">{`Price: ${data.price.toFixed(2)}`}</p>
        <p className="intro">{`Volume: ${data.volume.toFixed(4)}`}</p>
      </div>
    );
  }
  return null;
};

const aggregateTrades = (trades: Trade[], timeRange: TimeRange) => {
  if (trades.length === 0) return [];

  let getBucket: (date: Date) => Date;

  switch (timeRange) {
    case "1H":
    case "1D":
      getBucket = (date) => {
        const rounded = new Date(date);
        rounded.setSeconds(Math.floor(rounded.getSeconds() / 10) * 10, 0);
        return rounded;
      };
      break;
    case "7D":
      getBucket = (date) => startOfMinute(date);
      break;
    case "1M":
    case "ALL":
    default:
      getBucket = (date) => startOfHour(date);
      break;
  }

  const sortedTrades = [...trades].sort((a, b) => a.timestamp - b.timestamp);

  const aggregated = sortedTrades.reduce(
    (acc, trade) => {
      const bucketTs = getBucket(new Date(trade.timestamp)).getTime();

      if (!acc[bucketTs]) {
        acc[bucketTs] = {
          timestamp: bucketTs,
          price: trade.price,
          volume: 0,
          open: trade.price,
          close: trade.price,
        };
      }
      acc[bucketTs].volume += trade.amount;
      acc[bucketTs].close = trade.price;
      return acc;
    },
    {} as Record<
      number,
      {
        timestamp: number;
        price: number;
        volume: number;
        open: number;
        close: number;
      }
    >
  );

  return Object.values(aggregated).sort((a, b) => a.timestamp - b.timestamp);
};

const PriceChartPanel: React.FC = () => {
  const { trades } = useSymbolData("BTC/USDT");
  const [timeRange, setTimeRange] = useState<TimeRange>("1H");

  const chartData = useMemo(
    () => aggregateTrades(trades, timeRange),
    [trades, timeRange]
  );

  return (
    <div className="h-full w-full flex flex-col p-4 bg-gray-800 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-bold">Price Chart (BTC/USDT)</div>
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-md">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:bg-gray-700"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      {chartData.length > 0 ? (
        <div className="flex-grow flex flex-col">
          <div style={{ flex: "3 1 0%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                syncId="priceVolumeChart"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  hide={true}
                />
                <YAxis
                  orientation="right"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    `$${(value as number).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  }
                  domain={["auto", "auto"]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#34D399"
                  fill="#34D399"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: "1 1 0%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                syncId="priceVolumeChart"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) => {
                    const date = new Date(ts);
                    if (timeRange === "1H" || timeRange === "1D")
                      return date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      });
                    return date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  orientation="right"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value as number).toFixed(2)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="volume" isAnimationActive={false}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.close >= entry.open ? "#34D399" : "#F43F5E"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex items-center justify-center text-gray-400">
          <div>Waiting for data...</div>
        </div>
      )}
    </div>
  );
};

export default PriceChartPanel;
