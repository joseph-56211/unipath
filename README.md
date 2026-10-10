# WayUni — Campus Navigation Prototype

**Tagline:** Your Campus. Your Way.

WayUni is a clean, mobile-friendly campus wayfinding starter project. It includes:
- Searchable campus facilities and category filters.
- Interactive map using Leaflet and OpenStreetMap tiles.
- Browser GPS location (permission required).
- Links to external walking directions.
- Main/College Campus and Siriba Campus selector.
- Fresher-friendly help cards and a visual of two confused freshers.
- A small progressive-web-app shell cache so the interface can reopen after it has been visited.

## Run on Windows

1. Install Node.js LTS if you have not already.
2. Extract the ZIP file.
3. Open the extracted `WayUni` folder in VS Code.
4. Open Terminal → New Terminal.
5. Run:

   ```powershell
   npm install
   npm start
   ```

6. Open `http://localhost:3000` in your browser.

Stop the server with `Ctrl + C`.

## Project structure

```text
WayUni/
├── data/
│   └── places.json       # Starter facility records
├── public/
│   ├── index.html        # Website structure
│   ├── style.css         # Styling and responsive layout
│   ├── script.js         # Search, filters, GPS and map behaviour
│   ├── sw.js             # Basic app-shell caching
│   └── manifest.webmanifest
├── .env.example
├── package.json
├── server.js             # Express backend / API
└── README.md
```

## Important accuracy note about Maseno locations

Facility names were seeded from publicly available Maseno University information, including its official hostel and library pages. The main-campus reference point is based on a public OpenStreetMap/Mapcarta campus listing. However, **most individual building pins in this demo are approximate, not surveyed GPS coordinates**. A few service cards are placeholders to help demonstrate the interface. Do not rely on approximate pins for time-critical directions. Please walk the campus, confirm the exact locations with the university or student leaders, then update `data/places.json` with verified GPS coordinates.

The website labels approximate pins and repeats the warning before opening external directions. GPS works only when browser permission is granted; browser location is generally available on `localhost` during development and on HTTPS when deployed.

## Map and internet requirements

- Map tiles are loaded from OpenStreetMap, so the interactive map needs internet.
- The app shell and place API can be cached after the first visit, but this project **does not download or store offline map tiles**. The map itself may be blank offline.
- OpenStreetMap attribution is shown on the map. Follow OpenStreetMap tile usage policies when deploying publicly.
- External Google Maps walking directions require an internet connection.

## Extend it

- Replace approximate pins with verified latitude/longitude values in `data/places.json`.
- Add campuses and their verified places in that same JSON file; use `campus: "main"` or `campus: "siriba"` for the current campus selector, and extend `public/script.js` if adding more campuses.
- Add an admin dashboard and database later if you want students or authorized campus staff to maintain the locations.

## Public information used for the starter list

- Maseno University official campus information: https://maseno.ac.ke/maseno-campuses
- Maseno University official hostel list: https://maseno.ac.ke/our-hostels
- Maseno University official library information: https://maseno.ac.ke/university-library
- Public Maseno University Main Campus map listing: https://mapcarta.com/W179573486

This is an independent student project prototype and is not an official Maseno University product.
