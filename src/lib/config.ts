// Single switchboard for going from mock data to a real backend.
//
// To connect a real API:
//   1. Create a `.env.local` (see `.env.example`) with:
//        VITE_API_BASE_URL=https://api.yourfarm.com/v1
//        VITE_USE_MOCK=false
//   2. Nothing else in the app needs to change — every service in `src/api/services`
//      already calls `httpClient` when USE_MOCK is false, using the exact same
//      function signatures the UI already depends on.

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

// Defaults to mock mode so the app runs standalone out of the box.
export const USE_MOCK: boolean = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

// Simulated network latency for the mock backend, so loading states are visible
// and easy to test. Set to 0 for instant responses during development.
export const MOCK_LATENCY_MS = 350
