// Full corrected and complete page.tsx
'use client';

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import btcData from "../data/bitcoin.json";
import spyData from "../data/spy.json";
import vbtlxData from "../data/vanguard-bond-total-with-dividends.json";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const combinedItem = payload.find((item: any) => item.name === "Diversified Portfolio");
    const dataPoint = combinedItem?.payload;
    return (
      <div className="bg-white border border-gray-300 rounded px-3 py-2 shadow text-sm">
        <p className="text-black font-bold">Total Value: ${combinedItem?.value.toFixed(2)}</p>
        <p className="text-gray-800">Bitcoin: ${dataPoint?.btc?.toFixed(2)}</p>
        <p className="text-gray-800">S&amp;P: ${dataPoint?.spy?.toFixed(2)}</p>
        <p className="text-gray-800">Bonds: ${dataPoint?.vbtlx?.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

function getClosestAvailableDate(data: any[], target: string) {
  const targetDate = new Date(target);
  return data.find(d => new Date(d.date) >= targetDate)?.date || data[data.length - 1].date;
}

function getDateRange(data: any[]) {
  return data.map(d => d.date);
}

function formatDateLabel(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  });
}

export default function Home() {
  const dateList = getDateRange(btcData);
  const today = dateList[dateList.length - 1];
  const defaultStartDate = getClosestAvailableDate(btcData, "2023-01-01");

  const [amount, setAmount] = useState(100);
  const [startIndex, setStartIndex] = useState(dateList.indexOf(defaultStartDate));
  const [chartData, setChartData] = useState<any[]>([]);
  const [combinedData, setCombinedData] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'new' | 'main'>('new');

  const [btcWeight, setBtcWeight] = useState(33);
  const [spyWeight, setSpyWeight] = useState(33);
  const [bondWeight, setBondWeight] = useState(34);

  const [showBTC, setShowBTC] = useState(true);
  const [showSPY, setShowSPY] = useState(true);
  const [showBonds, setShowBonds] = useState(true);

  const handleWeightChange = (asset: string, value: number) => {
    value = Math.max(0, Math.min(100, value));
    let remaining = 100 - value;

    if (asset === 'btc') {
      const totalOther = spyWeight + bondWeight;
      const newSpy = totalOther === 0 ? remaining / 2 : (spyWeight / totalOther) * remaining;
      const newBond = remaining - newSpy;
      setBtcWeight(value);
      setSpyWeight(newSpy);
      setBondWeight(newBond);
    } else if (asset === 'spy') {
      const totalOther = btcWeight + bondWeight;
      const newBtc = totalOther === 0 ? remaining / 2 : (btcWeight / totalOther) * remaining;
      const newBond = remaining - newBtc;
      setSpyWeight(value);
      setBtcWeight(newBtc);
      setBondWeight(newBond);
    } else if (asset === 'bond') {
      const totalOther = btcWeight + spyWeight;
      const newBtc = totalOther === 0 ? remaining / 2 : (btcWeight / totalOther) * remaining;
      const newSpy = remaining - newBtc;
      setBondWeight(value);
      setBtcWeight(newBtc);
      setSpyWeight(newSpy);
    }
  };

  const startDate = dateList[startIndex];
  const endDate = today;

  useEffect(() => {
    const totalWeight = btcWeight + spyWeight + bondWeight;
    const btcRatio = btcWeight / totalWeight;
    const spyRatio = spyWeight / totalWeight;
    const bondRatio = bondWeight / totalWeight;

    const spyMap = new Map(spyData.map((d) => [d.date.trim(), d.spy]));
    const vbtlxMap = new Map(vbtlxData.map((d) => [d.date.trim(), d.adjusted_value]));

    const startBTC = btcData.find(d => d.date >= startDate && d.btc > 0)?.btc;
    const startSPY = spyData.find(d => d.date >= startDate && d.spy > 0)?.spy;
    const startVBTLX = vbtlxData.find(d => d.date >= startDate && d.adjusted_value > 0)?.adjusted_value;

    if (!startBTC || !startSPY || !startVBTLX) {
      console.warn("Missing start price for selected date");
      setChartData([]);
      setCombinedData([]);
      return;
    }

    const merged: any[] = [];
    const combined: any[] = [];

    for (const entry of btcData) {
      const date = entry.date.trim();
      if (date < startDate || date > endDate) continue;

      const btcPrice = entry.btc;
      const spyPrice = spyMap.get(date);
      const vbtlxPrice = vbtlxMap.get(date);

      if (btcPrice && spyPrice && vbtlxPrice) {
        const btcVal = (btcPrice / startBTC) * amount;
        const spyVal = (spyPrice / startSPY) * amount;
        const vbtlxVal = (vbtlxPrice / startVBTLX) * amount;

        merged.push({ date, btc: btcVal, spy: spyVal, vbtlx: vbtlxVal });

        const btcPart = (btcPrice / startBTC) * btcRatio * amount;
        const spyPart = (spyPrice / startSPY) * spyRatio * amount;
        const bondPart = (vbtlxPrice / startVBTLX) * bondRatio * amount;
        const combo = btcPart + spyPart + bondPart;

        combined.push({ date, combined: combo, btc: btcPart, spy: spyPart, vbtlx: bondPart });
      }
    }

    setChartData(merged);
    setCombinedData(combined);
  }, [amount, startIndex, btcWeight, spyWeight, bondWeight]);

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold mb-4 text-black">Investment Growth Simulator</h1>

        <div className="flex space-x-4 mb-6">
          <button onClick={() => setActiveTab('new')} className={`px-4 py-2 rounded ${activeTab === 'new' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>Diversified Portfolio Returns</button>
          <button onClick={() => setActiveTab('main')} className={`px-4 py-2 rounded ${activeTab === 'main' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>Growth Chart</button>
        </div>

        <p className="text-sm text-gray-700 mb-4">
          {activeTab === 'new'
            ? 'This chart shows the total value of your portfolio over time, based on how you allocate an initial investment across three asset classes: Bitcoin, S&P, and Bonds. A classic rule of thumb is to invest 70% in stocks and 30% in bonds. Use this tool to explore how that strategy would have performed historically.'
            : 'This chart shows how Bitcoin, S&P, and Bonds have each grown over time, assuming an equal initial investment in each. Use it to compare how individual assets performed during different market conditions.'}
        </p>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-black">Initial Amount ($)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="border border-gray-400 text-black bg-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1 text-black">
              <span className="font-semibold">Start Date:</span> {startDate} | <span className="font-semibold">End Date:</span> {endDate}
            </label>
            <input type="range" min={0} max={dateList.length - 1} value={startIndex} onChange={(e) => setStartIndex(Number(e.target.value))} className="w-full appearance-none bg-gray-300 h-2 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:cursor-pointer" />
          </div>
        </div>

        {activeTab === 'main' && (
          <>
            <div className="flex items-center gap-4 mb-4">
              <label className="text-sm text-black"><input type="checkbox" checked={showBTC} onChange={() => setShowBTC(!showBTC)} className="mr-1" /> Bitcoin</label>
              <label className="text-sm text-black"><input type="checkbox" checked={showSPY} onChange={() => setShowSPY(!showSPY)} className="mr-1" /> S&amp;P</label>
              <label className="text-sm text-black"><input type="checkbox" checked={showBonds} onChange={() => setShowBonds(!showBonds)} className="mr-1" /> Bonds</label>
            </div>
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="date" tickFormatter={formatDateLabel} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  {showBTC && <Line type="monotone" dataKey="btc" stroke="#f7931a" name="Bitcoin" dot={false} />}
                  {showSPY && <Line type="monotone" dataKey="spy" stroke="#2f4b7c" name="S&P" dot={false} />}
                  {showBonds && <Line type="monotone" dataKey="vbtlx" stroke="#28a745" name="Bonds (VBTLX)*" dot={false} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {activeTab === 'new' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium text-black">Bitcoin Allocation (%)</label>
                <input type="range" min={0} max={100} value={btcWeight} onChange={(e) => handleWeightChange('btc', Number(e.target.value))} className="w-full" />
                <p className="text-sm text-black">{btcWeight.toFixed(0)}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-black">S&amp;P Allocation (%)</label>
                <input type="range" min={0} max={100} value={spyWeight} onChange={(e) => handleWeightChange('spy', Number(e.target.value))} className="w-full" />
                <p className="text-sm text-black">{spyWeight.toFixed(0)}%</p>
              </div>
              <div>
                <label className="text-sm font-medium text-black">Bond Allocation (%)</label>
                <input type="range" min={0} max={100} value={bondWeight} onChange={(e) => handleWeightChange('bond', Number(e.target.value))} className="w-full" />
                <p className="text-sm text-black">{bondWeight.toFixed(0)}%</p>
              </div>
            </div>
            <div className="w-full h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={combinedData}>
                  <XAxis dataKey="date" tickFormatter={formatDateLabel} />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="combined" stroke="#007bff" name="Diversified Portfolio" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </main>
  );
}