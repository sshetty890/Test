import { format, parseISO } from 'date-fns';
import type { FlightOffer } from '../api/client';

const AIRLINE_NAMES: Record<string, string> = {
  QF: 'Qantas', EK: 'Emirates', SQ: 'Singapore Airlines',
  VN: 'Vietnam Airlines', MH: 'Malaysia Airlines', CX: 'Cathay Pacific',
  TG: 'Thai Airways', JQ: 'Jetstar', VA: 'Virgin Australia',
  TR: 'Scoot', FD: 'AirAsia',
};

function airlineName(code: string) {
  return AIRLINE_NAMES[code] ?? code;
}

function formatTime(iso: string) {
  try { return format(parseISO(iso), 'HH:mm'); } catch { return iso; }
}

function stopsLabel(stops: number) {
  if (stops === 0) return <span className="text-green-600 font-medium">Direct</span>;
  return <span className="text-amber-600">{stops} stop{stops > 1 ? 's' : ''}</span>;
}

interface Props {
  offers: FlightOffer[];
}

export default function PriceTable({ offers }: Props) {
  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-500">
        No flights found. Try different dates or airports.
      </div>
    );
  }

  const sorted = [...offers].sort((a, b) => a.price - b.price);

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">Available Flights</h2>
        <p className="text-sm text-slate-500">{offers.length} result{offers.length !== 1 ? 's' : ''} — sorted by price</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Airline</th>
              <th className="text-left px-4 py-3 font-medium">Departure</th>
              <th className="text-left px-4 py-3 font-medium">Arrival</th>
              <th className="text-left px-4 py-3 font-medium">Duration</th>
              <th className="text-left px-4 py-3 font-medium">Stops</th>
              <th className="text-right px-4 py-3 font-medium">Price (AUD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((offer, i) => (
              <tr key={i} className={i === 0 ? 'bg-blue-50' : 'hover:bg-slate-50 transition-colors'}>
                <td className="px-4 py-3 font-medium text-slate-800">
                  {airlineName(offer.airline)}
                  {i === 0 && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Best</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700">{formatTime(offer.departureTime)}</td>
                <td className="px-4 py-3 text-slate-700">{formatTime(offer.arrivalTime)}</td>
                <td className="px-4 py-3 text-slate-600">{offer.duration}</td>
                <td className="px-4 py-3">{stopsLabel(offer.stops)}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">
                  ${offer.price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
