import { fetchDataset, hasFetcher } from "../lib/datasets/registry";
import { prisma } from "../lib/db";
import crypto from "crypto";

async function main() {
    console.log("Forcing a database refresh of all datasets using live fetchers...");

    const datasets = await prisma.dataset.findMany();

    for (const dataset of datasets) {
        if (!hasFetcher(dataset.slug)) {
            console.log(`⚠️ Skipping ${dataset.slug} (no fetcher)`);
            continue;
        }

        try {
            console.log(`\nFetching ${dataset.slug}...`);
            const payload = await fetchDataset(dataset.slug);

            const sourceHash = crypto
                .createHash("md5")
                .update(JSON.stringify(payload))
                .digest("hex");

            // Create new snapshot
            const snapshot = await prisma.snapshot.create({
                data: {
                    datasetId: dataset.id,
                    payload: payload as any,
                    sourceHash,
                    collectedAt: new Date(),
                },
            });

            // Update dataset pointer
            await prisma.dataset.update({
                where: { id: dataset.id },
                data: {
                    latestSnapshotId: snapshot.id,
                    lastRefreshedAt: new Date(),
                },
            });

            // Update any cards pointing to this dataset
            await prisma.card.updateMany({
                where: { datasetId: dataset.id },
                data: { snapshotId: snapshot.id },
            });

            console.log(`✅ Successfully updated ${dataset.slug} in DB -> ${payload.total} ${payload.unitLabel}`);
        } catch (error) {
            console.error(`❌ Failed to update ${dataset.slug}:`, error);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
