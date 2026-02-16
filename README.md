# Travel Widget Mobile App Preview

A premium, interactive travel map widget built with React, Vite, Tailwind CSS, and Leaflet. Designed to convert hot leads into bookings with zero friction.

## Features

- **Compact Map**: Interactive top-half map with custom price pill markers.
- **Swipeable Carousel**: Smooth scrolling list of accommodations synced with the map.
- **Smart Interactions**: 
  - Clicking a map marker smooth-scrolls to the corresponding card.
  - Swiping cards pans the map to the location and highlights the marker.
- **Sticky Actions**: Persistent "Book Now" CTA and filters for quick conversion.
- **Premium Aesthetics**: Glassmorphism (backdrop-blur), soft shadows, and refined typography.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open your browser (mobile view recommended) at `http://localhost:5173`.

## Technologies

- **React** (Vite)
- **Leaflet** (via `react-leaflet`) for maps
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **IntersectionObserver** for scroll tracking

## Notes

- Uses OpenStreetMap tiles (CartoDB Voyager) for a clean, premium look without API keys.
- Optimized for mobile viewports.
