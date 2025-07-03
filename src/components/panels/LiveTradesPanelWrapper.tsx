"use client";

import dynamic from "next/dynamic";

const LiveTradesPanel = dynamic(() => import("./LiveTradesPanel"), {
  ssr: false,
  loading: () => (
    <div className="h-full bg-gray-800 text-white p-4">Loading...</div>
  ),
});

export default LiveTradesPanel;
