export interface WeatherData {
  area_metadata: AreaMetaData[];
  items: Item[];
}

export interface AreaMetaData {
  name: string;
  label_location: {
    latitude: number;
    longitude: number;
  };
}

export interface Item {
  update_timestamp: string;
  timestamp: string;
  valid_period: {
    start: string;
    end: string;
  };
  forecasts: Forecast[];
}

export interface Forecast {
  area: string;
  forecast: string;
  timestamp?: string;
}
