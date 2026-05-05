declare module 'amadeus' {
  interface AmadeusConfig {
    clientId: string;
    clientSecret: string;
  }
  interface GetParams {
    [key: string]: string | number | undefined;
  }
  interface ApiResponse {
    data: unknown;
  }
  interface FlightOffersSearch {
    get(params: GetParams): Promise<ApiResponse>;
  }
  interface Shopping {
    flightOffersSearch: FlightOffersSearch;
  }
  class Amadeus {
    constructor(config: AmadeusConfig);
    shopping: Shopping;
  }
  export = Amadeus;
}
