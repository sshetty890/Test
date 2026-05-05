import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import type { PriceSnapshot, PriceStats } from '../api/client';

interface Props {
  history: PriceSnapshot[];
  stats: PriceStats | null;
  loading: boolean;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow p-3 text-sm">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="font-semibold text-slate-900">AUD ${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default function PriceChart({ history, stats, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
        Loading price history...
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
        No price history yet. Search for flights to start tracking.
      </div>
    );
  }

  const data = history.map(row => ({
    date: format(parseISO(row.fetched_at), 'dd MMM'),
    price: row.price_aud,
  }));

  const prices = history.map(r => r.price_aud);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const yMin = Math.floor(minPrice * 0.95 / 100) * 100;
  const yMax = Math.ceil(maxPrice * 1.05 / 100) * 100;

  return (
    <div className="bg-white rounded-2xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Price History (last 30 days)</h2>
        {stats && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600 font-medium">Low: ${stats.lowest?.toFixed(0)}</span>
            <span className="text-red-500 font-medium">High: ${stats.highest?.toFixed(0)}</span>
            <span className="text-slate-500">Avg: ${stats.average?.toFixed(0)}</span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={v => `$${v}`}
            tick={{ fontSize: 12, fill: '#94a3b8' }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          {stats?.lowest != null && (
            <ReferenceLine
              y={stats.lowest}
              stroke="#22c55e"
              strokeDasharray="4 4"
              label={{ value: 'Lowest', position: 'right', fontSize: 11, fill: '#22c55e' }}
            />
          )}
          <Line
            type="monotone"
            dataKey="price"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3b82f6' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
