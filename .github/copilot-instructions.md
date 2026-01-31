# Weather App - AI Assistant Guidelines

## Architecture Overview

This is a single-page weather application using the **OpenWeatherMap API** with a three-tier structure:

- **HTML (index.html)**: Minimal markup - single input field and result container
- **CSS (style.css)**: All styling with gradient backgrounds, cards, and responsive design
- **JavaScript (weather.js)**: Single async function `getWeather()` orchestrating two API calls

**Data Flow**: User input → Geocoding API (coordinates) → Weather API + Forecast API → DOM rendering

## Key Integration Points

### OpenWeatherMap API

- **Geocoding Endpoint** (`/geo/1.0/direct`): Converts city names to lat/lon
- **Weather Endpoint** (`/data/2.5/weather`): Current conditions in metric units
- **Forecast Endpoint** (`/data/2.5/forecast`): Next 5 days of 3-hour forecasts
- **API Key**: Hardcoded in `weather.js` (value: `4c4aa6c96077526f38ada9da54a96b12`)

**Error Handling Pattern**: Check `geoRes.ok` before parsing; city not found returns empty array (handle distinctly from API errors)

## Critical Code Patterns

### DOM Manipulation

- Results render into `#result` div with direct `innerHTML` assignment
- Three states: loading spinner, error message (red background), or formatted HTML
- No templating library - raw HTML strings with template literals

### Input Validation

- Trim whitespace from city input; empty input shows validation error
- City not found returns specific error message vs. network errors

### Async/Await Structure

```javascript
// Pattern in getWeather():
resultDiv.innerHTML = '<div class="loading">...'; // Show loading immediately
const geoRes = await fetch(geoUrl);
if (!geoRes.ok) throw new Error(...);  // Validate response status, then parse
const geoData = await geoRes.json();
```

## Styling Conventions

- **Color scheme**: Purple gradient (`#667eea` → `#764ba2`) for primary UI
- **Interactive elements**: Buttons/inputs scale on hover, shadow changes
- **Weather results**: Currently rendered as plain `<p>` tags (not using `.weather-card` styles that exist in CSS)
- **Responsive**: Single breakpoint at `600px`; main adjustments to font sizes and grid

## Known Issues & Development Notes

1. **Unused code**: Icon determination logic (lines 47-55 in weather.js) is commented out - consider removing or implementing
2. **HTML/CSS mismatch**: CSS defines `.weather-card` and `.weather-grid` classes, but forecast renders as plain paragraphs
3. **Accessibility gap**: No ARIA labels; form lacks proper semantic structure (no `<form>` element)
4. **Hard-coded image**: style.css references a local image (`ChatGPT\ Image\ Jan\ 24\,...`); may break if file moved
5. **Console logging**: `console.log()` calls in error handling paths left in production code

## Development Workflow

- **No build process**: Direct file serving; CSS and JS are unminified
- **Testing**: Manual; no automated tests present
- **Debugging**: Browser console shows API URLs and responses via `console.log()`
- **Deployment**: Static HTML/CSS/JS - can deploy to any static host

## Enhancement Opportunities

- Replace plain paragraph forecast with styled cards from existing `.weather-card` CSS
- Move API key to environment variable or backend proxy
- Add localStorage caching for recent searches
- Implement proper form element and event delegation instead of `onclick` attribute
