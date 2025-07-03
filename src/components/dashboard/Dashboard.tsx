"use client";

import React, { useRef } from "react";
import { Activity, Wifi, WifiOff, AlertCircle, RotateCcw } from "lucide-react";
import { DashboardProps } from "@/types";
import { useWebSocketData } from "@/hooks/useWebSocketData";
import {
  useConnectionStatus,
  useError,
  useLastUpdate,
  useTrades,
} from "@/store/dashboardStore";
import { format } from "date-fns";
import DockviewLayout, { DockviewLayoutRef } from "./DockviewLayout";

/**
 * Main Dashboard Component - Now with Real-Time Data
 */
export default function Dashboard({ initialLayout }: DashboardProps) {
  const dockviewLayoutRef = useRef<DockviewLayoutRef>(null);

  // Initialize WebSocket connection
  const webSocket = useWebSocketData();
  const connectionStatus = useConnectionStatus();
  const error = useError();
  const lastUpdate = useLastUpdate();
  const trades = useTrades();

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case "connected":
        return { icon: Wifi, color: "text-green-400", label: "Connected" };
      case "connecting":
      case "reconnecting":
        return { icon: Wifi, color: "text-yellow-400", label: "Connecting..." };
      case "disconnected":
        return { icon: WifiOff, color: "text-gray-400", label: "Disconnected" };
      case "error":
        return { icon: AlertCircle, color: "text-red-400", label: "Error" };
      default:
        return { icon: WifiOff, color: "text-gray-400", label: "Unknown" };
    }
  };

  const handleResetLayout = () => {
    if (dockviewLayoutRef.current) {
      dockviewLayoutRef.current.resetLayout();
    }
  };

  const statusInfo = getConnectionStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="h-screen w-full bg-gray-900 text-white flex flex-col">
      <header className="h-12 bg-gray-800 border-b border-gray-700 flex items-center px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Crypto Trading Dashboard</h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button
            onClick={handleResetLayout}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 rounded-md transition-all duration-200 text-gray-300 hover:text-white"
            title="Reset Layout"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Layout</span>
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <DockviewLayout ref={dockviewLayoutRef} />
      </div>
      <footer className="h-6 bg-gray-800 border-t border-gray-700 flex items-center px-4 text-xs text-gray-400 flex-shrink-0">
        <span>WebSocket: {connectionStatus}</span>
        <span className="mx-2">•</span>
        <span>Data Feed: {webSocket.isConnected ? "Live" : "Simulated"}</span>
        <span className="mx-2">•</span>
        <span>Last Update: {format(new Date(lastUpdate), "HH:mm:ss")}</span>
        <span className="mx-2">•</span>
        <span>Trades: {trades.length}</span>
        {webSocket.isConnecting && (
          <>
            <span className="mx-2">•</span>
            <span className="text-yellow-400">Connecting...</span>
          </>
        )}
      </footer>
    </div>
  );
}
