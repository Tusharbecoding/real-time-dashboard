"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamically import the Perspective component with no SSR
const LiveTradesPanel = dynamic(() => import("./LiveTradesPanel"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col bg-gray-900 text-white">
      <div className="p-3 bg-gray-800 border-b border-gray-700">
        <h3 className="text-sm font-semibold">Live Trades</h3>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-400">
          <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mb-2 mx-auto"></div>
          <p className="text-sm">Loading Perspective...</p>
        </div>
      </div>
    </div>
  ),
});

const LiveTradesPanelWrapper: React.FC = () => {
  return <LiveTradesPanel />;
};

export default LiveTradesPanelWrapper;
