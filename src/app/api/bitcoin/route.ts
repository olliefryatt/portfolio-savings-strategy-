import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: "Missing 'from' or 'to'" }, { status: 400 });
  }

  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
  console.log("📦 CoinGecko API URL:", url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ CoinGecko response error:", text);
      return NextResponse.json({ error: "CoinGecko fetch failed", details: text }, { status: 500 });
    }

    const data = await response.json();

    const prices = data.prices.map(([timestamp, price]: [number, number]) => {
      const date = new Date(timestamp).toISOString().split("T")[0];
      return { date, btc: price };
    });

    return NextResponse.json(prices);
  } catch (err: any) {
    console.error("❗ Server error:", err);
    return NextResponse.json({ error: "Server error", details: err.message }, { status: 500 });
  }
}