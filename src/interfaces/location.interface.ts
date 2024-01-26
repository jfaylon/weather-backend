export interface Location {
  image: string;
  location: {
    latitude: number;
    longitude: number;
  };
  locationName: string;
  cameraLocation: string;
  locationData: {
    [k: string]: unknown;
  };
}

export interface GetLocationPayload {
  data: Location[];
}

export interface BatchLocationData {
  query: {
    lat: number;
    lon: number;
  };
  formatted?: string;
  name?: string;
  [k: string]: unknown;
}
