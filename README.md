# 2026-eu-trip

## How to run

To view the itinerary, you need to run a local web server. This is because the application fetches data from `trip_data.json`, and browsers block this action when opening files directly (file:// protocol) for security reasons (CORS).

### Using Python (recommended)
If you have Python installed, open your terminal in this directory and run:

```bash
python3 -m http.server
```

Then open http://localhost:8000 in your browser.

### Using VS Code Live Server
If you use VS Code, install the "Live Server" extension, right-click `index.html`, and choose "Open with Live Server".

## Editing Data

To update the itinerary, simply edit `trip_data.json`.
