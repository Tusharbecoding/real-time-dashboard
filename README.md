# Real-Time Crypto Trading Dashboard

A high-performance real-time cryptocurrency trading dashboard built with Next.js, featuring live trade data visualization and advanced analytics.

## ✨ Features

### 📊 **Live Trade Visualization**

- **Real-time trade feed** using Binance WebSocket API
- **Interactive data table** powered by @finos/perspective with sorting, filtering, and grouping
- **Memory-optimized streaming** - handles thousands of trades without performance degradation
- **Live trade count** with throttled updates (500ms intervals)

### 📈 **Advanced Price Charts**

- **OHLC candlestick charts** with volume overlay using Recharts
- **Multiple timeframes**: 1H, 1D, 7D, 1M, ALL
- **Real-time price updates** with optimized aggregation
- **Performance monitoring** with slow-render warnings

### 🏗️ **Flexible Layout System**

- **Dockable panels** using dockview-react
- **Resizable and movable** components
- **Clean, modern UI** with dark theme

### 🎯 **Market Data Overview**

- **Live ticker information** for multiple crypto pairs
- **Real-time price changes** with color-coded indicators
- **Volume and market cap data**
- **Search and filtering** capabilities

## 🚀 Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Data Visualization**: @finos/perspective, Recharts
- **Layout**: dockview-react for panel management
- **State Management**: Zustand
- **Real-time Data**: WebSocket (Binance API)
- **Styling**: Tailwind CSS
- **Performance**: Memory management, data throttling, optimized rendering

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Tusharbecoding/real-time-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## ⚡ Performance Optimizations

- **Update Throttling**: 250ms minimum between Perspective updates
- **Batch Processing**: Trades processed in 100-item chunks
- **Memory Management**: Proper cleanup of WebSocket connections and Perspective tables
- **Chart Optimization**: Max 200 data points, 500ms update intervals

## 🏗️ Architecture

```
src/
├── components/
│   ├── dashboard/         # Main dashboard and layout
│   └── panels/           # Individual panel components
├── hooks/                # WebSocket and data management hooks
├── services/             # External API services
├── store/                # Zustand state management
└── types/                # TypeScript definitions
```

## 📱 Features in Detail

### Live Trades Panel

- Real-time trade streaming from Binance
- Perspective.js integration for high-performance data grids
- Memory-efficient data handling for large volumes

### Price Chart Panel

- Multi-timeframe candlestick charts
- Volume analysis with buy/sell indicators
- Optimized rendering for smooth real-time updates

### Market Data Panel

- Live cryptocurrency market overview
- Search and filter functionality
- Price change indicators and trending data

---
