// scripts/check-wiki.js
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const snapshots = await p.snapshot.findMany({
    where: { dataset: { slug: 'wikipedia-pageviews' } },
    orderBy: { collectedAt: 'desc' },
    take: 3,
    select: { id: true, collectedAt: true, payload: true, sourceHash: true }
  });
  
  for (const s of snapshots) {
    const payload = s.payload;
    console.log(`\nSnapshot: ${s.id}`);
    console.log(`  Collected: ${s.collectedAt}`);
    console.log(`  Hash: ${s.sourceHash}`);
    console.log(`  Total: ${payload.total}`);
    console.log(`  Notes: ${payload.notes}`);
    if (payload.categories) {
      for (const c of payload.categories) {
        console.log(`    ${c.label}: ${c.value.toLocaleString()}`);
      }
    }
  }
  
  await p.$disconnect();
}

main();
