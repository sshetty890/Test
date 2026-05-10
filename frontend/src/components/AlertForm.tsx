import { useState } from 'react';
import { createAlert, deleteAlert } from '../api/client';
import type { Alert } from '../api/client';
import type { SearchParams } from './FlightSearch';

interface Props {
  searchParams: SearchParams | null;
  alerts: Alert[];
  onAlertsChange: () => void;
}

export default function AlertForm({ searchParams, alerts, onAlertsChange }: Props) {
  const [email, setEmail] = useState('');
  const [threshold, setThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchParams) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await createAlert({
        email,
        origin: searchParams.origin,
        destination: searchParams.destination,
        departDate: searchParams.departDate,
        returnDate: searchParams.returnDate,
        thresholdAud: parseFloat(threshold),
      });
      setSuccess('Alert created! You\'ll be emailed when the price drops.');
      setEmail('');
      setThreshold('');
      onAlertsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    await deleteAlert(id);
    onAlertsChange();
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow p-6 space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">Price Alert</h2>
        {!searchParams ? (
          <p className="text-sm text-slate-500">Search for flights first to set up an alert.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-sm text-slate-600">
              Get an email when <strong>{searchParams.origin} → {searchParams.destination}</strong> on <strong>{searchParams.departDate}</strong> drops below your threshold.
            </p>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Alert me when price is below (AUD)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={threshold}
                  onChange={e => setThreshold(e.target.value)}
                  placeholder="e.g. 800"
                  className="w-full border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {saving ? 'Saving...' : 'Create Alert'}
            </button>
          </form>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="bg-white rounded-2xl shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">Active Alerts</h2>
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="text-sm">
                <p className="font-medium text-slate-700">{alert.origin} → {alert.destination}</p>
                <p className="text-slate-500">{alert.depart_date}{alert.return_date ? ` – ${alert.return_date}` : ''} · below ${alert.threshold_aud}</p>
                <p className="text-slate-400 text-xs">{alert.email}</p>
              </div>
              <button
                onClick={() => handleDelete(alert.id)}
                className="text-xs text-red-500 hover:text-red-700 ml-4"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
