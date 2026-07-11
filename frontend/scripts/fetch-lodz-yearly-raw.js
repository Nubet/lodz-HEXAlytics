import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_URL = 'https://obserwatoriumbrd.pl/app/api/nodes/post_zdarzenia.php';
const OUTPUT_DIR = path.resolve(__dirname, '../data/obserwatoriumbrd/raw/lodz');
const YEAR_FROM = 2025;
const YEAR_TO = 2010;
const DELAY_MS = 1000;

const LODZ_FILTER = {
  wojewodztwo: '10',
  powiat: '1061',
  bounds: {
    topRightCorner: {
      lat: '51.95',
      lng: '19.75',
    },
    bottomLeftCorner: {
      lat: '51.60',
      lng: '19.15',
    },
  },
};

function getYears() {
  return Array.from(
    { length: YEAR_FROM - YEAR_TO + 1 },
    (_, index) => YEAR_FROM - index,
  );
}

function getOutputFile(year) {
  return path.join(OUTPUT_DIR, `${year}.json`);
}

function createRequestBody(year) {
  const params = new URLSearchParams();

  params.append('type', 'DETAILS');
  params.append('rok[]', String(year));
  params.append('wybrane_wojewodztwa[]', LODZ_FILTER.wojewodztwo);
  params.append('wybrane_powiaty[]', LODZ_FILTER.powiat);
  params.append('groupBy', 'DET');
  params.append('obszar_mapy[topRightCorner][lat]', LODZ_FILTER.bounds.topRightCorner.lat);
  params.append('obszar_mapy[topRightCorner][lng]', LODZ_FILTER.bounds.topRightCorner.lng);
  params.append('obszar_mapy[bottomLeftCorner][lat]', LODZ_FILTER.bounds.bottomLeftCorner.lat);
  params.append('obszar_mapy[bottomLeftCorner][lng]', LODZ_FILTER.bounds.bottomLeftCorner.lng);

  return params;
}

async function fetchYear(year) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Accept: 'application/json',
    },
    body: createRequestBody(year),
  });

  if (!response.ok) {
    throw new Error(`API responded with ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function extractStats(data) {
  const wojewodztwo = data.mapa?.wojewodztwa?.[0];
  const powiat = wojewodztwo?.powiaty?.[0];
  const gmina = powiat?.gminy?.[0];
  const rootCount = data.zdarzenia_count;

  return {
    zdarzeniaCount: Number.isFinite(rootCount) && rootCount > 0 ? rootCount : (gmina?.zdarzenia ?? 0),
    detailsCount: gmina?.zdarzenia_detale?.length ?? 0,
    groupBy: data.mapa?.groupBy ?? null,
  };
}

async function saveYear(year, data) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.writeFile(getOutputFile(year), `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const years = getYears();
  let fetched = 0;
  let skipped = 0;

  console.log('Lodz yearly raw fetcher');
  console.log(`Years: ${YEAR_FROM}-${YEAR_TO}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (let index = 0; index < years.length; index += 1) {
    const year = years[index];
    const outputFile = getOutputFile(year);
    const progress = `[${index + 1}/${years.length}]`;

    try {
      await fs.access(outputFile);
      skipped += 1;
      console.log(`${progress} Skip ${year} (already exists)`);
      continue;
    } catch {
      // File does not exist yet.
    }

    console.log(`${progress} Fetch ${year}...`);
    const data = await fetchYear(year);
    const stats = extractStats(data);

    await saveYear(year, data);
    fetched += 1;

    console.log(
      `${progress} Saved ${year}.json (${stats.zdarzeniaCount} accidents, ${stats.detailsCount} details, groupBy=${stats.groupBy})`,
    );

    if (index < years.length - 1) {
      await delay(DELAY_MS);
    }
  }

  console.log('\nFetch complete');
  console.log(`Fetched: ${fetched}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Directory: ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error('\nFatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
