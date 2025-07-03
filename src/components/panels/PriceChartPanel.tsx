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
import { startOfMinute, startOfHour } from "date-fns";

type TimeRange = "1H" | "1D" | "7D" | "1M" | "ALL";

const timeRanges: TimeRange[] = ["1H", "1D", "7D", "1M", "ALL"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 bg-opacity-90 text-white p-2 sm:p-3 rounded border border-gray-700 text-xs sm:text-sm shadow-lg">
        <p className="label font-medium mb-1">{`${new Date(
          label
        ).toLocaleString()}`}</p>
        <p className="intro text-emerald-400">{`Price: $${data.price.toFixed(
          2
        )}`}</p>
        <p className="intro text-blue-400">{`Volume: ${data.volume.toFixed(
          4
        )}`}</p>
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
    <div className="h-full w-full flex flex-col p-2 sm:p-4 bg-gray-800 text-white">
      {/* Responsive header with mobile-friendly controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
        <div className="text-base sm:text-lg font-bold">
          Price Chart (BTC/USDT)
        </div>

        {/* Mobile-responsive time range selector */}
        <div className="flex flex-wrap gap-1 bg-gray-700/50 p-1 rounded-md sm:rounded-lg">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded transition-all duration-200 flex-1 sm:flex-none min-w-0 touch-manipulation ${
                timeRange === range
                  ? "bg-blue-600 text-white font-medium shadow-md"
                  : "text-gray-300 hover:bg-gray-600/50 hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <div className="flex-grow flex flex-col gap-2 sm:gap-3 min-h-0">
          {/* Price Chart - Responsive height */}
          <div className="flex-1 min-h-0" style={{ minHeight: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{
                  top: 5,
                  right: window.innerWidth < 640 ? 15 : 30,
                  left: window.innerWidth < 640 ? 5 : 20,
                  bottom: 5,
                }}
                syncId="priceVolumeChart"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(ts) =>
                    new Date(ts).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  stroke="#9CA3AF"
                  tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  hide={true}
                />
                <YAxis
                  orientation="right"
                  stroke="#9CA3AF"
                  tick={{ fontSize: window.innerWidth < 640 ? 10 : 12 }}
                  tickFormatter={(value) =>
                    `$${(value as number).toLocaleString(undefined, {
                      minimumFractionDigits: window.innerWidth < 640 ? 0 : 2,
                      maximumFractionDigits: window.innerWidth < 640 ? 0 : 2,
                    })}`
                  }
                  domain={["auto", "auto"]}
                  width={window.innerWidth < 640 ? 50 : 80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#34D399"
                  fill="#34D399"
                  fillOpacity={0.2}
                  strokeWidth={window.innerWidth < 640 ? 1.5 : 2}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Volume Chart - Responsive height */}
          <div className="h-24 sm:h-32 md:h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: window.innerWidth < 640 ? 15 : 30,
                  left: window.innerWidth < 640 ? 5 : 20,
                  bottom: window.innerWidth < 640 ? 15 : 20,
                }}
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
                  tick={{ fontSize: window.innerWidth < 640 ? 9 : 12 }}
                  interval={window.innerWidth < 640 ? "preserveStartEnd" : 0}
                />
                <YAxis
                  orientation="right"
                  stroke="#9CA3AF"
                  tick={{ fontSize: window.innerWidth < 640 ? 9 : 12 }}
                  tickFormatter={(value) => {
                    const num = value as number;
                    if (window.innerWidth < 640) {
                      if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
                      return num.toFixed(1);
                    }
                    return num.toFixed(2);
                  }}
                  width={window.innerWidth < 640 ? 40 : 60}
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
          <div className="text-center">
            <div className="text-base sm:text-lg mb-2">Waiting for data...</div>
            <div className="text-xs sm:text-sm text-gray-500">
              Chart will appear once trade data is received
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceChartPanel;
