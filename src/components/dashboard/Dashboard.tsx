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

export default function Dashboard({ initialLayout }: DashboardProps) {
  const dockviewLayoutRef = useRef<DockviewLayoutRef>(null);

  const webSocket = useWebSocketData();
  const connectionStatus = useConnectionStatus();
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
      {/* Responsive header */}
      <header className="h-12 sm:h-14 bg-gray-800 border-b border-gray-700 flex items-center px-2 sm:px-4 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h1 className="text-sm sm:text-lg font-semibold truncate">
            <span className="hidden sm:inline">Crypto Trading Dashboard</span>
            <span className="sm:hidden">Crypto Dashboard</span>
          </h1>
        </div>

        {/* Mobile-responsive controls */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <button
            onClick={handleResetLayout}
            className="flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 hover:border-slate-500/50 rounded-md transition-all duration-200 text-gray-300 hover:text-white touch-manipulation"
            title="Reset Layout"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Layout</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>
      </header>

      {/* Main content area - Responsive */}
      <div className="flex-1 overflow-hidden">
        <DockviewLayout ref={dockviewLayoutRef} />
      </div>

      {/* Responsive footer */}
      <footer className="h-5 sm:h-6 bg-gray-800 border-t border-gray-700 flex items-center px-2 sm:px-4 text-xs text-gray-400 flex-shrink-0 overflow-hidden">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          {/* Mobile-first responsive status items */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <StatusIcon className={`w-3 h-3 ${statusInfo.color}`} />
            <span className="hidden sm:inline">WebSocket:</span>
            <span className={`${statusInfo.color} text-xs`}>
              <span className="sm:hidden">
                {connectionStatus === "connected" ? "●" : "○"}
              </span>
              <span className="hidden sm:inline">{connectionStatus}</span>
            </span>
          </div>

          <span className="text-gray-600 hidden sm:inline">•</span>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="hidden sm:inline">Data Feed:</span>
            <span className="text-xs">
              <span className="sm:hidden">
                {webSocket.isConnected ? "Live" : "Sim"}
              </span>
              <span className="hidden sm:inline">
                {webSocket.isConnected ? "Live" : "Simulated"}
              </span>
            </span>
          </div>

          <span className="text-gray-600 hidden md:inline">•</span>

          <div className="hidden md:flex items-center gap-1 flex-shrink-0">
            <span>Last Update:</span>
            <span className="text-xs">
              {format(new Date(lastUpdate), "HH:mm:ss")}
            </span>
          </div>

          <span className="text-gray-600 hidden lg:inline">•</span>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="hidden lg:inline">Trades:</span>
            <span className="lg:hidden">T:</span>
            <span className="text-xs">{trades.length}</span>
          </div>

          {webSocket.isConnecting && (
            <>
              <span className="text-gray-600 hidden sm:inline">•</span>
              <span className="text-yellow-400 text-xs flex-shrink-0">
                <span className="sm:hidden">...</span>
                <span className="hidden sm:inline">Connecting...</span>
              </span>
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
