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

        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(viewer);
        await viewer.load(table);
        viewerRef.current = viewer;

        console.log("Perspective initialized");
      } catch (err) {
        console.error("Perspective failed:", err);
        if (containerRef.current && mounted) {
          containerRef.current.innerHTML =
            '<div class="p-4 text-red-400">Perspective failed to load</div>';
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
    <div className="h-full w-full flex flex-col bg-gray-900">
      <div className="p-2 bg-gray-800 text-white text-sm flex justify-between">
        <span>Live Trades ({trades.length})</span>
        <span className="text-green-400 text-xs">● LIVE</span>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-0"
        style={{ height: "calc(100% - 40px)" }}
      >
        <div className="p-4 text-gray-400 text-sm">Loading trades...</div>
      </div>
    </div>
  );
});

LiveTradesPanel.displayName = "LiveTradesPanel";

export default LiveTradesPanel;
