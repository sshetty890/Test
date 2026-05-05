import { useState, useCallback } from 'react';
import FlightSearch from '../components/FlightSearch';
import PriceTable from '../components/PriceTable';
import PriceChart from '../components/PriceChart';
import AlertForm from '../components/AlertForm';
import { searchFlights, getPriceHistory, getPriceStats, getAlerts } from '../api/client';
import type { FlightOffer, PriceSnapshot, PriceStats, Alert } from '../api/client';
import type { SearchParams } from '../components/FlightSearch';

export default function Home() {
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [history, setHistory] = useState<PriceSnapshot[]>([]);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch { /* alerts are non-critical */ }
  }, []);

  async function handleSearch(params: SearchParams) {
    setSearchParams(params);
    setError('');
    setSearchLoading(true);
    setHistoryLoading(true);
    setHasSearched(true);

    try {
      const [flightOffers] = await Promise.all([
        searchFlights(params.origin, params.destination, params.departDate, params.returnDate),
        loadAlerts(),
      ]);
      setOffers(flightOffers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search flights');
      setOffers([]);
    } finally {
      setSearchLoading(false);
    }

    try {
      const [hist, priceStats] = await Promise.all([
        getPriceHistory(params.origin, params.destination, params.departDate, params.returnDate),
        getPriceStats(params.origin, params.destination, params.departDate, params.returnDate),
      ]);
      setHistory(hist);
      setStats(priceStats);
    } catch {
      setHistory([]);
      setStats(null);
    } finally {
      setHistoryLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-2xl">✈</span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-none">Vietnam Flight Tracker</h1>
            <p className="text-sm text-slate-500">Track daily prices from Australia to Vietnam</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FlightSearch onSearch={handleSearch} loading={searchLoading} />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {hasSearched && (
              <>
                <PriceTable offers={offers} />
                <PriceChart history={history} stats={stats} loading={historyLoading} />
              </>
            )}
          </div>

          <div>
            <AlertForm
              searchParams={searchParams}
              alerts={alerts}
              onAlertsChange={loadAlerts}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
