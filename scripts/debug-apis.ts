async function test() {
    console.log("--- Testing World Bank Poverty ---");
    try {
        const res = await fetch("https://api.worldbank.org/v2/country/WLD/indicator/SI.POV.DDAY?format=json&date=2020:2024&per_page=10");
        console.log("Status:", res.status);
        if (!res.ok) console.log("Text:", await res.text());
    } catch (e) { console.error(e); }

    console.log("\n--- Testing World Bank Population ---");
    try {
        const res = await fetch("https://api.worldbank.org/v2/country/WLD/indicator/SP.POP.TOTL?format=json&date=2020:2024&per_page=10");
        console.log("Status:", res.status);
        if (!res.ok) console.log("Text:", await res.text());
    } catch (e) { console.error(e); }
}

test();
