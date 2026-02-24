// scripts/check-all.js
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const datasets = await p.dataset.findMany({
    include: { 
      snapshots: { orderBy: { collectedAt: 'desc' }, take: 1 }
    }
  });
  
  console.log('\n=== ALL DATASETS STATUS ===\n');
  
  for (const d of datasets) {
    const refreshed = d.lastRefreshedAt ? d.lastRefreshedAt.toISOString().slice(0,16) : 'never';
    const snap = d.snapshots[0];
    const payload = snap?.payload;
    const notes = payload?.notes || 'no notes';
    const total = payload?.total;
    const isFallback = notes.toLowerCase().includes('fallback') || notes.toLowerCase().includes('estimate');
    
    console.log(`${d.slug}`);
    console.log(`  Rate: ${d.refreshRate} | Refreshed: ${refreshed}`);
    console.log(`  Total: ${total?.toLocaleString() ?? 'N/A'}`);
    console.log(`  Notes: ${notes}`);
    console.log(`  ${isFallback ? '⚠️  FALLBACK/ESTIMATE' : '✅ LIVE DATA'}`);
    console.log('');
  }
  
  await p.$disconnect();
}

main();
