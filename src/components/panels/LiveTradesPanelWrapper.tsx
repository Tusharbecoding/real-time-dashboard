"use client";

import dynamic from "next/dynamic";

const LiveTradesPanel = dynamic(() => import("./LiveTradesPanel"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-800 text-white p-2 sm:p-4 flex items-center justify-center">
      <div className="text-center">
        <div className="text-sm sm:text-base text-gray-300 mb-1">
          Loading...
        </div>
        <div className="text-xs text-gray-500">
          Initializing live trades panel
        </div>
      </div>
    </div>
  ),
});

export default LiveTradesPanel;
