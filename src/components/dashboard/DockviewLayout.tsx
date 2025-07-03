"use client";

import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { DockviewReact, DockviewApi, DockviewReadyEvent } from "dockview-react";
import LiveTradesPanelWrapper from "../panels/LiveTradesPanelWrapper";
import PriceChartPanel from "../panels/PriceChartPanel";
import MarketDataPanel from "../panels/MarketDataPanel";
import "dockview/dist/styles/dockview.css";

export interface DockviewLayoutRef {
  resetLayout: () => void;
}

const DockviewLayout = forwardRef<DockviewLayoutRef>((props, ref) => {
  const dockviewRef = useRef<DockviewApi | null>(null);

  const panelComponents = {
    "live-trades": () => <LiveTradesPanelWrapper />,
    "price-chart": () => <PriceChartPanel />,
    "market-data": () => <MarketDataPanel />,
  };

  const createDefaultLayout = (api: DockviewApi) => {
    // Clear all existing panels
    api.clear();

    // Add default panels
    api.addPanel({
      id: "live-trades",
      component: "live-trades",
      title: "Live Trades",
    });
    api.addPanel({
      id: "price-chart",
      component: "price-chart",
      title: "Price Chart",
    });
    api.addPanel({
      id: "market-data",
      component: "market-data",
      title: "Market Data",
    });
  };

  const onReady = (event: DockviewReadyEvent) => {
    dockviewRef.current = event.api;
    // Add three panels on load
    if (event.api.panels.length === 0) {
      createDefaultLayout(event.api);
    }
  };

  useImperativeHandle(ref, () => ({
    resetLayout: () => {
      if (dockviewRef.current) {
        createDefaultLayout(dockviewRef.current);
      }
    },
  }));

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <DockviewReact
        onReady={onReady}
        components={panelComponents}
        className="dockview-theme-dark"
        // style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
});

DockviewLayout.displayName = "DockviewLayout";

export default DockviewLayout;
