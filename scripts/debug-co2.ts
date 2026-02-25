async function testCO2() {
    console.log("--- Testing OWID CO2 API ---");
    try {
        const res = await fetch("https://owid-public.owid.io/data/co2/owid-co2-data.json", { headers: { "User-Agent": "ScaleCards/1.0" } });
        if (!res.ok) {
            console.log("Status:", res.status);
            return;
        }
        const data = await res.json();
        console.log("Data keys:", Object.keys(data).slice(0, 10));
        console.log("Has China?", !!data["CHN"]);
        console.log("Has World?", !!data["OWID_WRL"]);

        const getLatest = (countryKey: string, field: string): { value: number; year: number } => {
            const entries = data[countryKey]?.data;
            if (!entries) return { value: 0, year: 0 };
            for (let i = entries.length - 1; i >= 0; i--) {
                if (entries[i][field] != null && entries[i][field] > 0) {
                    return { value: entries[i][field], year: entries[i].year };
                }
            }
            return { value: 0, year: 0 };
        };

        const china = getLatest("CHN", "co2"); // The old code used literal "China" instead of "CHN"
        console.log("China CO2:", china);

    } catch (e) { console.error(e); }
}

testCO2();
