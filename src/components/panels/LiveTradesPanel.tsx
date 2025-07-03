"use client";

import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { useTrades } from "@/store/dashboardStore";
import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";

const LiveTradesPanel: React.FC = React.memo(() => {
  const trades = useTrades();
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const tableRef = useRef<any>(null);
  const lastUpdateRef = useRef<number>(0);

  const throttledData = useMemo(() => {
    const now = Date.now();
    if (now - lastUpdateRef.current < 500) {
      return null;
    }
    lastUpdateRef.current = now;

    return trades.slice(0, 100).map((trade) => ({
      symbol: trade.symbol,
      side: trade.side,
      price: Number(trade.price),
      amount: Number(trade.amount),
      cost: Number(trade.cost || 0),
      time: trade.datetime,
    }));
  }, [trades]);

  useEffect(() => {
    let mounted = true;

    const initViewer = async () => {
      if (!containerRef.current || viewerRef.current) return;

      try {
        const perspective = await import("@finos/perspective");
        await import("@finos/perspective-viewer");
        // @ts-ignore
        await import("@finos/perspective-viewer-datagrid");

        if (!mounted) return;

        const worker = perspective.default.worker();
        const table = await worker.table({
          symbol: "string",
          side: "string",
          price: "float",
          amount: "float",
          cost: "float",
          time: "string",
        });

        tableRef.current = table;

        const viewer = document.createElement("perspective-viewer");
        viewer.setAttribute("plugin", "Datagrid");
        viewer.style.height = "100%";
        viewer.style.width = "100%";
        viewer.style.backgroundColor = "#1f2937";

        // Add responsive styles for mobile
        viewer.style.fontSize = window.innerWidth < 640 ? "12px" : "14px";

        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(viewer);
        await viewer.load(table);
        viewerRef.current = viewer;

        console.log("Perspective initialized");
      } catch (err) {
        console.error("Perspective failed:", err);
        if (containerRef.current && mounted) {
          containerRef.current.innerHTML =
            '<div class="p-2 sm:p-4 text-red-400 text-sm">Perspective failed to load</div>';
        }
      }
    };

    initViewer();
    return () => {
      mounted = false;
    };
  }, []);

  const updateData = useCallback(async (data: any[]) => {
    if (!tableRef.current || !data || data.length === 0) return;

    try {
      await tableRef.current.replace(data);
    } catch (err) {
      console.warn("Data update failed:", err);
    }
  }, []);

  useEffect(() => {
    if (throttledData) {
      updateData(throttledData);
    }
  }, [throttledData, updateData]);

  return (
    <div className="h-full w-full flex flex-col bg-gray-800">
      {/* Responsive header */}
      <div className="flex-shrink-0 p-2 sm:p-3 bg-gray-800 text-white border-b border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-medium">
              Live Trades
            </span>
            <span className="text-xs text-gray-400 bg-gray-700/50 px-2 py-0.5 rounded">
              {trades.length}
            </span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Perspective viewer container - Responsive */}
      <div
        ref={containerRef}
        className="flex-1 min-h-0 relative"
        style={{ height: "calc(100% - 50px)" }}
      >
        {/* Loading state with responsive design */}
        <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 text-gray-400">
          <div className="text-center">
            <div className="text-sm sm:text-base mb-1">Loading trades...</div>
            <div className="text-xs text-gray-500">
              Live data will appear here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

LiveTradesPanel.displayName = "LiveTradesPanel";

export default LiveTradesPanel;
