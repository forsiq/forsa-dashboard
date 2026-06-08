/**
 * One-off script to clean up test categories and fill official names.
 *
 * Usage:
 *   npx tsx scripts/fix-categories-test.ts --dry-run
 *   npx tsx scripts/fix-categories-test.ts
 *
 * Environment variables:
 *   AUCTION_API_URL  — base URL (default: https://test.zonevast.com/forsa/api/v1)
 *   BEARER_TOKEN     — JWT access token (required)
 *   PROJECT_ID       — X-Project-ID header (default: 11)
 */

const API_URL = process.env.AUCTION_API_URL || 'https://test.zonevast.com/forsa/api/v1';
const TOKEN = process.env.BEARER_TOKEN;
const PROJECT_ID = process.env.PROJECT_ID || '11';
const DRY_RUN = process.argv.includes('--dry-run');

if (!TOKEN) {
  console.error('ERROR: BEARER_TOKEN environment variable is required.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${TOKEN}`,
  'X-Project-ID': PROJECT_ID,
};

// IDs to delete (test / product-as-category rows)
const DELETE_IDS = [48, 49, 50, 51, 52];

// IDs to patch with official names
const PATCH_DATA: Record<number, { name: string; nameAr: string }> = {
  39: { name: 'Electronics', nameAr: 'إلكترونيات' },
  40: { name: 'Watches', nameAr: 'ساعات' },
  41: { name: 'Computers', nameAr: 'أجهزة كمبيوتر' },
  42: { name: 'Gaming', nameAr: 'ألعاب' },
  43: { name: 'Fashion', nameAr: 'أزياء' },
  44: { name: 'Sports', nameAr: 'رياضة' },
  45: { name: 'Home', nameAr: 'منزل' },
  46: { name: 'Travel', nameAr: 'سفر' },
};

async function apiCall(method: string, path: string, body?: unknown) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function getCategory(id: number) {
  return apiCall('GET', `/categories/${id}`);
}

async function patchCategory(id: number, data: { name: string; nameAr: string }) {
  return apiCall('PATCH', `/categories/${id}`, data);
}

async function deleteCategory(id: number) {
  return apiCall('DELETE', `/categories/${id}`);
}

async function main() {
  console.log(`\n🔧 Fix Categories Script`);
  console.log(`   API: ${API_URL}`);
  console.log(`   Project: ${PROJECT_ID}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}\n`);

  // Step 1: Delete test/product rows
  console.log('--- DELETE phase ---');
  for (const id of DELETE_IDS) {
    try {
      const cat = await getCategory(id);
      const name = cat?.data?.name || cat?.name || '(unknown)';
      if (DRY_RUN) {
        console.log(`  [DRY] Would DELETE id=${id} name="${name}"`);
      } else {
        await deleteCategory(id);
        console.log(`  ✅ DELETED id=${id} name="${name}"`);
      }
    } catch (err: any) {
      console.warn(`  ⚠️  SKIP DELETE id=${id}: ${err.message}`);
    }
  }

  // Step 2: Patch official categories
  console.log('\n--- PATCH phase ---');
  for (const [idStr, data] of Object.entries(PATCH_DATA)) {
    const id = Number(idStr);
    try {
      const cat = await getCategory(id);
      const currentName = cat?.data?.name || cat?.name || '(unknown)';
      if (DRY_RUN) {
        console.log(
          `  [DRY] Would PATCH id=${id} "${currentName}" → name="${data.name}" nameAr="${data.nameAr}"`,
        );
      } else {
        await patchCategory(id, data);
        console.log(
          `  ✅ PATCHED id=${id} "${currentName}" → name="${data.name}" nameAr="${data.nameAr}"`,
        );
      }
    } catch (err: any) {
      console.warn(`  ⚠️  SKIP PATCH id=${id}: ${err.message}`);
    }
  }

  console.log('\n✨ Done.\n');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
