import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';

const AU_AIRPORTS = [
  { code: 'SYD', label: 'Sydney (SYD)' },
  { code: 'MEL', label: 'Melbourne (MEL)' },
  { code: 'BNE', label: 'Brisbane (BNE)' },
  { code: 'PER', label: 'Perth (PER)' },
  { code: 'ADL', label: 'Adelaide (ADL)' },
];

const VN_AIRPORTS = [
  { code: 'SGN', label: 'Ho Chi Minh City (SGN)' },
  { code: 'HAN', label: 'Hanoi (HAN)' },
  { code: 'DAD', label: 'Da Nang (DAD)' },
];

export interface SearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
}

interface Props {
  onSearch: (params: SearchParams) => void;
  loading: boolean;
}

export default function FlightSearch({ onSearch, loading }: Props) {
  const [origin, setOrigin] = useState('SYD');
  const [destination, setDestination] = useState('SGN');
  const [departDate, setDepartDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!departDate) return;
    onSearch({
      origin,
      destination,
      departDate: format(departDate, 'yyyy-MM-dd'),
      returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">Search Flights to Vietnam</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">From</label>
          <select
            value={origin}
            onChange={e => setOrigin(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {AU_AIRPORTS.map(a => (
              <option key={a.code} value={a.code}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">To</label>
          <select
            value={destination}
            onChange={e => setDestination(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {VN_AIRPORTS.map(a => (
              <option key={a.code} value={a.code}>{a.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Departure date</label>
          <DatePicker
            selected={departDate}
            onChange={setDepartDate}
            minDate={new Date()}
            dateFormat="dd MMM yyyy"
            placeholderText="Select date"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Return date <span className="text-slate-400">(optional)</span></label>
          <DatePicker
            selected={returnDate}
            onChange={setReturnDate}
            minDate={departDate ?? new Date()}
            dateFormat="dd MMM yyyy"
            placeholderText="One-way"
            isClearable
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !departDate}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Searching...' : 'Search Flights'}
      </button>
    </form>
  );
}
