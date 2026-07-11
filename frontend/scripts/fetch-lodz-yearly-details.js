import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL = 'https://obserwatoriumbrd.pl/app/api/nodes/post_zdarzenie.php';
const RAW_DIR = path.resolve(__dirname, '../data/obserwatoriumbrd/raw/lodz');
const OUTPUT_DIR = path.resolve(__dirname, '../data/obserwatoriumbrd/details/lodz');
const YEAR_FROM = 2025;
const YEAR_TO = 2010;
const DELAY_MS = Number.parseInt(process.env.FETCH_DELAY_MS ?? '1000', 10);
const BATCH_SAVE_SIZE = 10;
const MAX_RETRIES = 5;
const INITIAL_BACKOFF_MS = 30000;
const MAX_CONSECUTIVE_RATE_LIMITS = 5;

class RateLimitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
  }
}

function getDefaultYears() {
  return Array.from(
    { length: YEAR_FROM - YEAR_TO + 1 },
    (_, index) => YEAR_FROM - index,
  );
}

function getSelectedYears() {
  const args = process.argv.slice(2)
    .flatMap((value) => value.split(','))
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isInteger(value));

  return args.length > 0 ? args : getDefaultYears();
}

function getRawFile(year) {
  return path.join(RAW_DIR, `${year}.json`);
}

function getOutputFile(year) {
  return path.join(OUTPUT_DIR, `${year}.json`);
}

function extractAccidentIds(rawData) {
  const ids = [];

  if (!rawData.mapa?.wojewodztwa) {
    throw new Error('Invalid raw yearly file structure');
  }

  for (const wojewodztwo of rawData.mapa.wojewodztwa) {
    for (const powiat of wojewodztwo.powiaty || []) {
      for (const gmina of powiat.gminy || []) {
        for (const zdarzenie of gmina.zdarzenia_detale || []) {
          if (zdarzenie?.id) {
            ids.push(zdarzenie.id);
          }
        }
      }
    }
  }

  return [...new Set(ids)];
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}

async function loadYearRaw(year) {
  return readJson(getRawFile(year));
}

async function loadExistingYearDetails(year) {
  try {
    return await readJson(getOutputFile(year));
  } catch {
    return {};
  }
}

async function saveYearDetails(year, detailsMap) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(getOutputFile(year), `${JSON.stringify(detailsMap, null, 2)}\n`, 'utf-8');
}

async function fetchAccidentDetails(accidentId) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Accept: 'application/json, text/plain, */*',
        Origin: 'https://obserwatoriumbrd.pl',
        Referer: 'https://obserwatoriumbrd.pl/app/?lang=pl',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36',
      },
      body: new URLSearchParams({
        zdarzenie_id: String(accidentId),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data && typeof data === 'object' ? data : null;
    }

    if (response.status === 403 || response.status === 429) {
      if (attempt === MAX_RETRIES) {
        throw new RateLimitError(`HTTP ${response.status} ${response.statusText}`);
      }

      const backoffMs = INITIAL_BACKOFF_MS * (2 ** attempt);
      console.log(`   Rate limited (${response.status}). Waiting ${Math.round(backoffMs / 1000)}s before retry...`);
      await delay(backoffMs);
      continue;
    }

    console.error(`   HTTP ${response.status} ${response.statusText}`);
    return null;
  }

  return null;
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processYear(year) {
  console.log(`\nYear ${year}`);
  console.log('----------------------------------------');

  const rawData = await loadYearRaw(year);
  const accidentIds = extractAccidentIds(rawData);

  console.log(`Raw file: ${getRawFile(year)}`);
  console.log(`Accidents in raw file: ${accidentIds.length}`);

  if (accidentIds.length === 0) {
    console.log('No accident IDs found, skipping year.');
    return { year, fetched: 0, skipped: 0, failed: 0, total: 0 };
  }

  const existingDetails = await loadExistingYearDetails(year);
  const detailsMap = { ...existingDetails };
  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  let consecutiveRateLimits = 0;

  console.log(`Existing cached details: ${Object.keys(existingDetails).length}`);

  for (let index = 0; index < accidentIds.length; index += 1) {
    const accidentId = accidentIds[index];
    const progress = `[${index + 1}/${accidentIds.length}]`;

    if (detailsMap[accidentId]) {
      skipped += 1;
      if (skipped <= 5 || skipped % 100 === 0) {
        console.log(`${progress} Skip accident #${accidentId} (cached)`);
      }
      continue;
    }

    console.log(`${progress} Fetch accident #${accidentId}...`);
    let details;

    try {
      details = await fetchAccidentDetails(accidentId);
      consecutiveRateLimits = 0;
    } catch (error) {
      if (error instanceof RateLimitError) {
        consecutiveRateLimits += 1;
        failed += 1;
        await saveYearDetails(year, detailsMap);
        console.log(`${progress} Rate limit persisted after retries (${consecutiveRateLimits}/${MAX_CONSECUTIVE_RATE_LIMITS})`);

        if (consecutiveRateLimits >= MAX_CONSECUTIVE_RATE_LIMITS) {
          throw new Error(
            `Stopped to protect the IP after ${consecutiveRateLimits} consecutive rate-limit responses. Resume later by re-running the script.`,
          );
        }

        console.log('Cooling down for 10 minutes before continuing...');
        await delay(10 * 60 * 1000);
        continue;
      }

      throw error;
    }

    if (details) {
      detailsMap[accidentId] = details;
      fetched += 1;
      console.log(`${progress} Saved (${fetched} fetched this run)`);

      if (fetched % BATCH_SAVE_SIZE === 0) {
        await saveYearDetails(year, detailsMap);
        console.log(`Checkpoint saved (${Object.keys(detailsMap).length} total cached)`);
      }
    } else {
      failed += 1;
      console.log(`${progress} Failed (${failed} failures)`);
    }

    if (index < accidentIds.length - 1) {
      await delay(DELAY_MS);
    }
  }

  await saveYearDetails(year, detailsMap);

  console.log(`Finished ${year}`);
  console.log(`Fetched: ${fetched}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Output: ${getOutputFile(year)}`);

  return {
    year,
    fetched,
    skipped,
    failed,
    total: Object.keys(detailsMap).length,
  };
}

async function main() {
  const years = getSelectedYears();
  const startTime = Date.now();
  const results = [];

  console.log('Lodz yearly details fetcher');
  console.log(`Years: ${years.join(', ')}`);
  console.log(`Raw input: ${RAW_DIR}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Delay: ${DELAY_MS}ms`);
  console.log(`Checkpoint: every ${BATCH_SAVE_SIZE} fetched details`);

  for (const year of years) {
    results.push(await processYear(year));
  }

  const summary = results.reduce(
    (accumulator, result) => ({
      fetched: accumulator.fetched + result.fetched,
      skipped: accumulator.skipped + result.skipped,
      failed: accumulator.failed + result.failed,
      total: accumulator.total + result.total,
    }),
    { fetched: 0, skipped: 0, failed: 0, total: 0 },
  );

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n========================================');
  console.log('Fetch complete');
  console.log('========================================');
  console.log(`Fetched: ${summary.fetched}`);
  console.log(`Skipped: ${summary.skipped}`);
  console.log(`Failed: ${summary.failed}`);
  console.log(`Total cached across selected years: ${summary.total}`);
  console.log(`Elapsed: ${elapsed}s`);

  if (summary.failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('\nFatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
