import Amadeus from 'amadeus';

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

let client: Amadeus | null = null;

function getClient(): Amadeus {
  if (!client) {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error('AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set in .env');
    }
    client = new Amadeus({ clientId, clientSecret });
  }
  return client;
}

export async function searchFlights(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  adults = 1
): Promise<FlightOffer[]> {
  const amadeus = getClient();

  const params: Record<string, string | number> = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults,
    currencyCode: 'AUD',
    max: 10,
  };
  if (returnDate) params.returnDate = returnDate;

  const response = await amadeus.shopping.flightOffersSearch.get(params);
  const offers = response.data as AmadeusFlightOffer[];

  return offers.map(parseOffer).filter((o): o is FlightOffer => o !== null);
}

// ---- Amadeus response shape (partial) ----
interface AmadeusFlightOffer {
  price: { grandTotal: string; currency: string };
  itineraries: AmadeusItinerary[];
  validatingAirlineCodes: string[];
}
interface AmadeusItinerary {
  duration: string;
  segments: AmadeusSegment[];
}
interface AmadeusSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
}

function parseOffer(offer: AmadeusFlightOffer): FlightOffer | null {
  try {
    const outbound = offer.itineraries[0];
    const inbound = offer.itineraries[1];
    const outSegs = outbound.segments;
    const stops = outSegs.length - 1;

    return {
      airline: offer.validatingAirlineCodes[0] ?? 'Unknown',
      price: parseFloat(offer.price.grandTotal),
      currency: offer.price.currency,
      stops,
      duration: outbound.duration.replace('PT', '').toLowerCase(),
      departureTime: outSegs[0].departure.at,
      arrivalTime: outSegs[outSegs.length - 1].arrival.at,
      returnDepartureTime: inbound?.segments[0].departure.at,
      returnArrivalTime: inbound ? inbound.segments[inbound.segments.length - 1].arrival.at : undefined,
    };
  } catch {
    return null;
  }
}
