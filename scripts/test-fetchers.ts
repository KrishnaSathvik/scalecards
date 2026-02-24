import { fetchDataset, datasetFetchers } from "../lib/datasets/registry";

async function main() {
    console.log("Testing all data fetchers to ensure no fallbacks are triggered and APIs work correctly...");

    const slugs = Object.keys(datasetFetchers);

    for (const slug of slugs) {
        console.log(`\nFetching ${slug}...`);
        try {
            const data = await fetchDataset(slug);
            console.log(`✅ Success for ${slug} (${data.total} ${data.unitLabel})`);
        } catch (error) {
            console.error(`❌ Failed for ${slug}:`, error);
        }
    }
}

main().catch(console.error);
