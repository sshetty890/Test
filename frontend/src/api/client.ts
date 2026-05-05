export interface FlightOffer {
  airline: string;
  price: number;
  currency: string;
  stops: number;
  duration: string;
  departureTime: string;
  arrivalTime: string;
  returnDepartureTime?: string;
  returnArrivalTime?: string;
}

export interface PriceSnapshot {
  price_aud: number;
  airline: string;
  stops: number;
  duration: string;
  fetched_at: string;
}

export interface Alert {
  id: number;
  email: string;
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string | null;
  threshold_aud: number;
  active: number;
  created_at: string;
}

export interface PriceStats {
  lowest: number | null;
  highest: number | null;
  average: number | null;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data as T;
}

export async function searchFlights(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string
): Promise<FlightOffer[]> {
  const params = new URLSearchParams({ origin, destination, departDate });
  if (returnDate) params.set('returnDate', returnDate);
  const data = await apiFetch<{ offers: FlightOffer[] }>(`/flights?${params}`);
  return data.offers;
}

export async function getPriceHistory(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string,
  days = 30
): Promise<PriceSnapshot[]> {
  const params = new URLSearchParams({ origin, destination, departDate, days: String(days) });
  if (returnDate) params.set('returnDate', returnDate);
  const data = await apiFetch<{ history: PriceSnapshot[] }>(`/prices/history?${params}`);
  return data.history;
}

export async function getPriceStats(
  origin: string,
  destination: string,
  departDate: string,
  returnDate?: string
): Promise<PriceStats> {
  const params = new URLSearchParams({ origin, destination, departDate });
  if (returnDate) params.set('returnDate', returnDate);
  return apiFetch<PriceStats>(`/prices/lowest?${params}`);
}

export async function createAlert(payload: {
  email: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  thresholdAud: number;
}): Promise<{ id: number; message: string }> {
  return apiFetch('/alerts', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getAlerts(): Promise<Alert[]> {
  const data = await apiFetch<{ alerts: Alert[] }>('/alerts');
  return data.alerts;
}

export async function deleteAlert(id: number): Promise<void> {
  await apiFetch(`/alerts/${id}`, { method: 'DELETE' });
}
