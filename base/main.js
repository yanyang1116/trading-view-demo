// 创建图表
const chart = LightweightCharts.createChart(
  document.getElementById("tv-chart"),
  {
    width: 600,
    height: 400,
  }
);
const candleSeries = chart.addCandlestickSeries();

// 连接 bitstamp 公共 WebSocket，获取 BTC/USD 实时成交
const ws = new WebSocket("wss://ws.bitstamp.net");

ws.onopen = function () {
  ws.send(
    JSON.stringify({
      event: "bts:subscribe",
      data: { channel: "live_trades_btcusd" },
    })
  );
};

let lastCandle = null;
ws.onmessage = function (event) {
  const response = JSON.parse(event.data);
  if (response.event === "trade" && response.data) {
    const trade = response.data;
    const time = Math.floor(trade.timestamp / 60) * 60; // 按分钟聚合
    if (!lastCandle || lastCandle.time !== time) {
      // 新K线
      lastCandle = {
        time,
        open: trade.price,
        high: trade.price,
        low: trade.price,
        close: trade.price,
      };
      candleSeries.update(lastCandle);
    } else {
      // 更新当前K线
      lastCandle.high = Math.max(lastCandle.high, trade.price);
      lastCandle.low = Math.min(lastCandle.low, trade.price);
      lastCandle.close = trade.price;
      candleSeries.update(lastCandle);
    }
  }
};

new TradingView.widget({
  container_id: "tv_chart_container",
  width: "100vw",
  height: "90vh",
  symbol: "AAPL",
  interval: "D",
  timezone: "Etc/UTC",
  theme: "light",
  style: "1",
  locale: "zh",
  toolbar_bg: "#f1f3f6",
  enable_publishing: false,
  allow_symbol_change: true,
  hide_top_toolbar: false,
  hide_legend: false,
  save_image: false,
  studies_overrides: {},
  overrides: {},
  // datafeed: new Datafeeds.UDFCompatibleDatafeed("https://demo_feed.tradingview.com")
});
