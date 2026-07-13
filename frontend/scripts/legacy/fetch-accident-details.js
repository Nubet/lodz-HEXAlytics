import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const API_URL = 'https://obserwatoriumbrd.pl/app/api/nodes/post_zdarzenie.php';
const ACCIDENTS_FILE = path.resolve(__dirname, '../public/accidents.json');
const OUTPUT_DIR = path.resolve(__dirname, '../public/cache');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'accident-details.json');
const DELAY_MS = 1000; // Delay between requests (to avoid rate limiting)
const BATCH_SAVE_SIZE = 10; // Save after every N successful fetches

/**
 * Fetch accident details from ObserwatoriumBRD API
 * @param {number} accidentId - The accident ID to fetch
 * @returns {Promise<object|null>} Accident details or null if failed
 */
async function fetchAccidentDetails(accidentId) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        zdarzenie_id: accidentId.toString(),
      }),
    });

    if (!response.ok) {
      console.error(`   ❌ HTTP ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`   ❌ Network error: ${error.message}`);
    return null;
  }
}

/**
 * Extract all accident IDs from accidents.json
 * @param {object} accidentsData - The full accidents data structure
 * @returns {number[]} Array of accident IDs
 */
function extractAccidentIds(accidentsData) {
  const ids = [];

  if (!accidentsData.mapa?.wojewodztwa) {
    throw new Error('Invalid accidents.json structure');
  }

  for (const wojewodztwo of accidentsData.mapa.wojewodztwa) {
    for (const powiat of wojewodztwo.powiaty || []) {
      for (const gmina of powiat.gminy || []) {
        for (const zdarzenie of gmina.zdarzenia_detale || []) {
          if (zdarzenie.id) {
            ids.push(zdarzenie.id);
          }
        }
      }
    }
  }

  return ids;
}

/**
 * Load existing cache (if any) to support resume functionality
 * @returns {Promise<object>} Existing details cache
 */
async function loadExistingCache() {
  try {
    const data = await fs.readFile(OUTPUT_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {};
  }
}

/**
 * Save details cache to file
 * @param {object} detailsMap - Map of accident ID to details
 */
async function saveCache(detailsMap) {
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  await fs.writeFile(
    OUTPUT_FILE,
    JSON.stringify(detailsMap, null, 2),
    'utf-8'
  );
}

/**
 * Main execution function
 */
async function main() {
  console.log('🚀 Accident Details Fetcher');
  console.log('═══════════════════════════════════════════════════════\n');

  // Load accidents.json
  console.log('📂 Loading accidents.json...');
  let accidentsData;
  try {
    const accidentsRaw = await fs.readFile(ACCIDENTS_FILE, 'utf-8');
    accidentsData = JSON.parse(accidentsRaw);
    console.log('   ✅ Loaded successfully\n');
  } catch (error) {
    console.error('❌ Failed to load accidents.json:', error.message);
    console.error('   Make sure the file exists at:', ACCIDENTS_FILE);
    process.exit(1);
  }

  // Extract accident IDs
  console.log('🔍 Extracting accident IDs...');
  const accidentIds = extractAccidentIds(accidentsData);
  console.log(`   ✅ Found ${accidentIds.length} unique accidents\n`);

  if (accidentIds.length === 0) {
    console.log('⚠️  No accidents found in the data file.');
    process.exit(0);
  }

  //  Load existing cache (resume support)
  console.log('💾 Checking for existing cache...');
  const existingDetails = await loadExistingCache();
  const existingCount = Object.keys(existingDetails).length;
  
  if (existingCount > 0) {
    console.log(`   ✅ Found ${existingCount} cached details (will skip these)\n`);
  } else {
    console.log('   📝 No existing cache found (starting fresh)\n');
  }

  // Fetch details
  console.log('🌐 Fetching accident details from API...');
  console.log(`   API: ${API_URL}`);
  console.log(`   Delay: ${DELAY_MS}ms between requests`);
  console.log(`   Checkpoint: Save every ${BATCH_SAVE_SIZE} fetches\n`);

  const detailsMap = { ...existingDetails };
  let fetched = 0;
  let skipped = 0;
  let failed = 0;
  const startTime = Date.now();

  for (let i = 0; i < accidentIds.length; i++) {
    const accidentId = accidentIds[i];
    const progress = `[${i + 1}/${accidentIds.length}]`;

    // Skip if already in cache
    if (detailsMap[accidentId]) {
      skipped++;
      if (skipped <= 5 || skipped % 100 === 0) {
        console.log(`${progress} ⏭️  Accident #${accidentId} (cached)`);
      }
      continue;
    }

    // Fetch from API
    console.log(`${progress} 📡 Fetching accident #${accidentId}...`);
    const details = await fetchAccidentDetails(accidentId);

    if (details) {
      detailsMap[accidentId] = details;
      fetched++;
      console.log(`${progress} ✅ Success (${fetched} total)`);

      // Save checkpoint every N fetches
      if (fetched % BATCH_SAVE_SIZE === 0) {
        await saveCache(detailsMap);
        console.log(`\n💾 Checkpoint saved (${Object.keys(detailsMap).length} total in cache)\n`);
      }
    } else {
      failed++;
      console.log(`${progress} ❌ Failed (${failed} total failures)`);
    }

    // Delay before next request (except for last one)
    if (i < accidentIds.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
    }
  }

  // Step 5: Final save
  console.log('\n💾 Saving final cache...');
  await saveCache(detailsMap);
  console.log('   ✅ Saved successfully\n');

  // Step 6: Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ FETCH COMPLETE!');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`📊 Statistics:`);
  console.log(`   • Newly fetched:  ${fetched}`);
  console.log(`   • Already cached: ${skipped}`);
  console.log(`   • Failed:         ${failed}`);
  console.log(`   • Total in cache: ${Object.keys(detailsMap).length}`);
  console.log(`   • Time elapsed:   ${elapsed}s`);
  console.log(`\n📁 Output file: ${OUTPUT_FILE}`);
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 7: Exit with appropriate code
  if (failed > 0) {
    console.log('⚠️  Some requests failed. You can re-run the script to retry.');
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('\n💥 Fatal error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
