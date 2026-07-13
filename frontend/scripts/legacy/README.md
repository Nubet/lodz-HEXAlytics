# Legacy Accident Scripts

Historical Node.js scripts for exporting accident data from the ObserwatoriumBRD API.

These scripts are not part of the current frontend runtime or current backend contract.

## `fetch-lodz-yearly-raw.js`

Exports yearly raw snapshots for Lodz directly from `post_zdarzenia.php` without relying on `public/accidents.json`.

### Usage

```bash
node scripts/legacy/fetch-lodz-yearly-raw.js
```

### Output

The script saves one file per year to:

```text
data/obserwatoriumbrd/raw/lodz/2025.json
data/obserwatoriumbrd/raw/lodz/2024.json
...
data/obserwatoriumbrd/raw/lodz/2010.json
```

### Notes

- Fetches years `2025..2010`
- Uses Lodz filters: wojewodztwo `10`, powiat `1061`
- Skips files that already exist
- Saves the raw API response unchanged for later import/mapping work

## `fetch-lodz-yearly-details.js`

Fetches full accident details from `post_zdarzenie.php` for every accident ID found in the yearly raw Lodz files.

### Usage

```bash
node scripts/legacy/fetch-lodz-yearly-details.js
```

Optionally limit the run to selected years:

```bash
node scripts/legacy/fetch-lodz-yearly-details.js 2025
node scripts/legacy/fetch-lodz-yearly-details.js 2025,2024
```

### Output

The script saves one details file per year to:

```text
data/obserwatoriumbrd/details/lodz/2025.json
data/obserwatoriumbrd/details/lodz/2024.json
...
data/obserwatoriumbrd/details/lodz/2010.json
```

### Notes

- Reads source IDs from `data/obserwatoriumbrd/raw/lodz/{year}.json`
- Stores details keyed by accident ID
- Resumes from an existing yearly details file if present
- Saves checkpoints every 10 fetched details
- Uses `1000ms` delay by default, configurable via `FETCH_DELAY_MS`
- Retries `403` and `429` with exponential backoff
- Stops after repeated rate-limit responses to avoid hammering the source API

---

## Configuration

Edit `scripts/legacy/fetch-accident-details.js` constants:

```javascript
const DELAY_MS = 500;           // Milliseconds between requests
const BATCH_SAVE_SIZE = 10;     // Save after N successful fetches
const API_URL = '...';          // API endpoint
const ACCIDENTS_FILE = '...';   // Input file path
const OUTPUT_FILE = '...';      // Output file path
```

## Troubleshooting

### Script fails immediately
- Check that `public/accidents.json` exists
- Verify file has correct structure with `mapa.wojewodztwa` array

### All requests fail with network errors
- Check internet connection
- Verify API is accessible: `curl https://obserwatoriumbrd.pl/app/api/nodes/post_zdarzenie.php`
- API might be blocking automated requests (try increasing `DELAY_MS`)

### Script is too slow
- Reduce `DELAY_MS` (careful: might trigger rate limiting)
- Run overnight for large datasets

### Some requests fail
- Re-run the script - it will skip successful fetches and retry failures
- Check API response for specific accident IDs manually


## Notes

This script currently outputs a cache file, but the application no longer uses this legacy API path.
