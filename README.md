# Weather Backend

A backend API that utilises data.gov.sg APIs to retrieve traffic and weather information. This is in tandem with https://github.com/jfaylon/weather-frontend

## Prequisites

- Must be connected to a redis server for the cache of the reversed geocached locations
- Must have an API key from https://www.geoapify.com/ to connect to Geoapify's reverse geocaching server.
- Node version used is v18.17.1. It is not guaranteed that it will work for newer or older versions
- Weather and Traffic 3rd Party APIs
  - Weather: https://api.data.gov.sg/v1/environment/2-hour-weather-forecast
  - Traffic: https://api.data.gov.sg/v1/transport/traffic-images
  - Geoapify: https://api.geoapify.com/v1/batch/geocode/reverse

## Installation

- Clone the repository and install node modules

```bash
  npm install
```

- Add the ENVs to a .env file or copy the .env.example file

```
GEOAPIFY_API_KEY=<API_KEY>
REDIS_URL=localhost:6379
PORT=8000
```

- Note: PORT 8000 was used because the frontend will use 3000.
- For the API Key, it will be sent privately upon request or create an account and generate an API key from https://www.geoapify.com/

## Running the Application

- Running in development mode

```
npm run start
```

or

```
npm run start:dev
```

- Running in production mode

```
npm run build && npm run start:prod
```

## Unit Tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## APIs

### GET /locations

#### Query Parameters

- dateTime: string - a timestamp in this format `YYYY-MM-DDTHH:mm:ss` e.g.: `2024-01-01T12:00:00`

### GET /weather

#### Query Parameters

- dateTime: string - a timestamp in this format `YYYY-MM-DDTHH:mm:ss` e.g.: `2024-01-01T12:00:00`
- location: string - location name e.g.: `Bedok`

## Tech limitations and Assumptions

- Caching was used to lessen the calls to the reverse geocaching API as they have daily API limits.
- A known issue encountered is that based on the given timestamp, the coordinates may vary and due to the caching of reversed geocaching data, the location name may not be found. In this case, the coordinates and the nearest weather location was used in its place.
- The caching may be improved to have an expiry after a certain time period.
- Due to the nature of retrieving the reverse geocaching data from the 3rd party service, the first load may take longer than usual as the data provided will take time to complete.
- The module to get the nearest weather forecast location is `geolib`.
- Due to the nature of the payload, the entire payload received from the 3rd party APIs are majorly untouched due to possible future use

## Possible Improvements

- Images for the weather statuses may be included such as a sun image for sunny status a cloud image for cloudy status.
- A faster API to retrieve the reversed geocaching data may be used.
- A more descriptive error handling and logging may be also implemented for easier debugging.
- For the weather feature, it was commented out but the weather from previous times of day may be displayed for reference.
