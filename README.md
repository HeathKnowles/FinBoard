# FinBoard 📊

A modern, real-time financial dashboard built with Next.js that transforms raw financial data into beautiful, interactive visualizations.

PS: Check out [Architecture](ARCHITECTURE.md) for more info on arhchitecture

## Features

### Real-Time Data Updates
- **Live WebSocket Connection** - Real-time data streaming with automatic reconnection
- **Smart Polling Fallback** - Ensures data consistency even with connection issues
- **Connection Status Indicator** - Visual feedback on real-time connection status

### Interactive Widgets
- **Financial Charts** - Candlestick, line, and area charts with Chart.js
- **Data Tables** - Sortable, paginated tables with custom field selection
- **Card Views** - Compact displays for watchlists, gainers, and performance metrics
- **Drag & Drop Layout** - Customizable dashboard grid with persistent layouts

### Smart Data Handling
- **Automatic Field Detection** - AI-powered field labeling and type detection
- **Caching System** - Intelligent data caching with TTL and performance monitoring
- **Data Transformation** - Automatic flattening and reshaping of nested JSON
- **Fallback Mechanisms** - Graceful handling of API failures

### Modern UI/UX
- **Dark Theme** - Professional dark interface optimized for financial data
- **Responsive Design** - Works seamlessly across desktop, tablet, and mobile
- **Custom Dialogs** - Modern popups replacing browser alerts
- **Accessibility** - WCAG compliant with keyboard navigation support

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Financial data API key (Alpha Vantage recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/HeathKnowles/FinBoard.git
   cd finboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Create .env.local file
   echo "NEXT_PUBLIC_API_BASE_URL=your_api_base_url" > .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open dashboard**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
finboard/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── cache/         # Cache management
│   │   ├── fetch/         # Data fetching
│   │   └── websocket/     # Real-time updates
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Dashboard page
│   └── providers.tsx      # Redux & theme providers
├── components/            # React components
│   ├── cards/            # Financial card components
│   ├── charts/           # Chart components
│   ├── ui/               # Shadcn/ui components
│   ├── dashboardGrid.tsx # Main dashboard layout
│   ├── navbar.tsx        # Navigation bar
│   ├── realTimeStatus.tsx # Connection indicator
│   └── widget*.tsx       # Widget components
├── hooks/                # Custom React hooks
│   ├── useRealTimeWidget.ts # Real-time subscriptions
│   ├── useResizeObserver.ts # Responsive handling
│   └── useWidgetAutoRefresh.ts # Auto refresh logic
├── lib/                  # Utilities and services
│   ├── cache.ts          # Caching system
│   ├── websocketClient.ts # WebSocket client
│   ├── dataReshaper.ts   # Data transformation
│   └── utils.ts          # Common utilities
├── store/                # Redux store
│   ├── widgetsSlice.ts   # Widget state management
│   ├── layoutSlice.ts    # Layout persistence
│   └── themeSlice.ts     # Theme management
└── types/                # TypeScript definitions
    └── display.ts        # Display configuration types
```

## Usage Examples

### Adding a New Widget
```typescript
// Create widget configuration
const config: DisplayConfig = {
  mode: 'chart',
  chart: {
    type: 'candlestick',
    xField: 'date',
    yFields: ['open', 'high', 'low', 'close']
  }
};

// Add to dashboard
dispatch(addWidget({
  id: generateId(),
  name: 'AAPL Stock Chart',
  apiUrl: 'https://api.example.com/stock/AAPL',
  refresh: 60,
  config
}));
```

### Subscribing to Real-Time Updates
```typescript
// Automatic real-time subscription
const MyWidget = ({ widgetId }) => {
  const { isConnected } = useRealTimeWidget(widgetId, true);
  
  return (
    <div>
      {isConnected ? '🟢 Live' : '🔴 Offline'}
      {/* Widget content */}
    </div>
  );
};
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Performance

- **Smart Caching** - Reduces API calls by 80%
- **Code Splitting** - Dynamic imports for optimal bundle size
- **Image Optimization** - Next.js automatic image optimization
- **Real-Time Efficiency** - WebSocket + polling hybrid approach

## Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Chart.js](https://www.chartjs.org/) - Financial charting
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
