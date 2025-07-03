"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTrades } from "@/store/dashboardStore";

// Import Perspective viewer components to register custom elements
import "@finos/perspective-viewer";
import "@finos/perspective-viewer-datagrid";

const LiveTradesPanel: React.FC = () => {
  const trades = useTrades();
  const viewerRef = useRef<any>(null);
  const tableRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Perspective only on client side
  useEffect(() => {
    if (!isClient) return;

    let mounted = true;

    const initializePerspective = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamically import Perspective modules only on client side
        const perspective = await import("@finos/perspective");

        // Import viewer components for side effects (registering custom elements)
        await import("@finos/perspective-viewer");
        // @ts-ignore - Import for side effects only, type resolution not needed
        await import("@finos/perspective-viewer-datagrid");

        if (!mounted) return;

        // Create worker and table
        const worker = perspective.default.worker();
        const table = await worker.table([]);
        tableRef.current = table;

        // Create the perspective-viewer element
        const viewer = document.createElement("perspective-viewer");
        viewerRef.current = viewer;

        // Configure the viewer
        viewer.setAttribute("theme", "Pro Dark");
        viewer.setAttribute("plugin", "Datagrid");
        viewer.setAttribute("editable", "false");
        viewer.setAttribute("settings", "true");

        // Style the viewer
        viewer.style.height = "100%";
        viewer.style.width = "100%";
        viewer.style.setProperty("--plugin--background", "#1f2937");
        viewer.style.setProperty("--inactive--color", "#9ca3af");

        // Add to container
        if (containerRef.current) {
          containerRef.current.appendChild(viewer);
        }

        // Load the table
        await viewer.load(table);

        // Configure columns and sorting
        await viewer.restore({
          plugin: "Datagrid",
          columns: [
            "datetime",
            "symbol",
            "side",
            "price",
            "amount",
            "cost",
            "exchange",
          ],
          sort: [["timestamp", "desc"]],
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize Perspective:", err);
        if (mounted) {
          setError(
            `Failed to initialize Perspective: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
          setIsLoading(false);
        }
      }
    };

    initializePerspective();

    return () => {
      mounted = false;
      if (tableRef.current) {
        tableRef.current.delete();
        tableRef.current = null;
      }
      if (viewerRef.current && containerRef.current) {
        containerRef.current.removeChild(viewerRef.current);
        viewerRef.current = null;
      }
    };
  }, [isClient]);

  // Update table with new trades
  useEffect(() => {
    if (!isClient || !tableRef.current || trades.length === 0) return;

    try {
      // Prepare data for Perspective - keep last 1000 trades
      const recentTrades = trades.slice(0, 1000).map((trade) => ({
        id: trade.id,
        timestamp: trade.timestamp,
        datetime: trade.datetime,
        symbol: trade.symbol,
        side: trade.side,
        price: trade.price,
        amount: trade.amount,
        cost: trade.cost,
        exchange: trade.exchange,
      }));

      // Replace the entire dataset
      tableRef.current.replace(recentTrades);
    } catch (err) {
      console.error("Failed to update Perspective table:", err);
      setError("Failed to update data");
    }
  }, [trades, isClient]);

  // Don't render anything on server side
  if (!isClient) {
    return (
      <div className="h-full w-full flex flex-col bg-gray-900 text-white">
        <div className="p-3 bg-gray-800 border-b border-gray-700">
          <h3 className="text-sm font-semibold">Live Trades</h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex flex-col bg-gray-900 text-white">
        <div className="p-3 bg-gray-800 border-b border-gray-700">
          <h3 className="text-sm font-semibold">Live Trades</h3>
        </div>
        <div className="p-4 bg-red-900 text-red-200">
          <h3 className="text-sm font-semibold">Error</h3>
          <p className="text-xs">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="p-3 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h3 className="text-sm font-semibold">Live Trades</h3>
          <span className="text-xs text-gray-400">
            ({trades.length} trades)
          </span>
        </div>
        {isLoading && (
          <div className="text-xs text-gray-400">Loading Perspective...</div>
        )}
      </div>

      {/* Perspective Viewer Container */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-gray-400">
              <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mb-2 mx-auto"></div>
              <p className="text-sm">Initializing Perspective...</p>
            </div>
          </div>
        ) : (
          <div ref={containerRef} className="h-full w-full" />
        )}
      </div>
    </div>
  );
};

export default LiveTradesPanel;
