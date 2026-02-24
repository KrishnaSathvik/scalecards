// lib/datasets/card-knowledge.ts
// Rich educational content for each card — helps users understand
// what the data means, why it matters, and how to think about scale.

export type CardKnowledge = {
    headline: string;          // One-liner "what this shows"
    explanation: string;       // 2–3 sentence plain-English explanation
    whyItMatters: string;      // Why a user should care
    keyInsights: string[];     // 3–5 bullet-point takeaways
    scale: string;             // Human-scale comparison to feel the number
    relatedSlugs: string[];    // Dataset slugs for related cards
};

const knowledgeMap: Record<string, CardKnowledge> = {
    "us-national-debt": {
        headline: "The US government owes more than the GDP of every country except the US itself.",
        explanation:
            "The national debt is the total money the US federal government has borrowed over time by issuing Treasury bonds. It consists of 'debt held by the public' (investors, foreign governments, the Fed) and 'intragovernmental holdings' (money owed to programs like Social Security).",
        whyItMatters:
            "The debt affects interest rates, the value of the dollar, and how much the government can spend on services. Interest payments alone now exceed the entire defense budget.",
        keyInsights: [
            "The US adds roughly $1 trillion in new debt every 100 days.",
            "Interest payments on the debt now exceed $1 trillion/year — more than defense spending.",
            "About 30% is owed to other US government agencies (Social Security, Medicare trust funds).",
            "Foreign governments hold about $8 trillion — Japan and China are the largest holders.",
            "The debt-to-GDP ratio is over 120%, a level previously seen only during World War II.",
        ],
        scale: "That's about $115,000 per American — or $260,000 per taxpayer.",
        relatedSlugs: ["military-spending", "wealth-inequality"],
    },

    "ethereum-price": {
        headline: "Ethereum isn't just a cryptocurrency — it's a programmable financial platform.",
        explanation:
            "Ethereum is a decentralized blockchain that lets developers build applications (DeFi, NFTs, smart contracts) on top of it. ETH is the native currency used to pay for transactions on the network. Unlike Bitcoin, Ethereum is designed as a platform, not just a currency.",
        whyItMatters:
            "Ethereum powers the majority of decentralized finance (DeFi), with over $50 billion locked in smart contracts. Its price reflects confidence in the future of programmable money and Web3.",
        keyInsights: [
            "Ethereum processes about 1 million transactions per day.",
            "After 'The Merge' in 2022, Ethereum switched from proof-of-work to proof-of-stake, cutting energy use by ~99.95%.",
            "Over $50 billion in assets are locked in Ethereum-based DeFi protocols.",
            "Ethereum's market cap makes it the second-largest cryptocurrency after Bitcoin.",
            "Gas fees (transaction costs) fluctuate based on network demand.",
        ],
        scale: "At current prices, the entire Ethereum network is worth more than most Fortune 500 companies.",
        relatedSlugs: ["bitcoin-price", "trillion-dollar-club"],
    },

    "global-flights": {
        headline: "At any given moment, tens of thousands of aircraft are flying above your head.",
        explanation:
            "This card tracks aircraft currently in the air worldwide using ADS-B transponder data. Every commercial aircraft broadcasts its position, speed, and altitude. The OpenSky Network aggregates these signals from thousands of receivers globally.",
        whyItMatters:
            "Aviation connects 4 billion passengers a year and carries 35% of global trade by value. The real-time aircraft count is a live economic indicator — more planes in the air means more commerce, tourism, and global connectivity.",
        keyInsights: [
            "About 100,000 flights take off and land every day worldwide.",
            "Air travel accounts for about 2.5% of global CO₂ emissions.",
            "The busiest airspace is over the US, Europe, and East Asia.",
            "Most aircraft fly at 30,000–40,000 feet (~10–12 km altitude).",
            "Cargo flights make up about 15–20% of all flights — carrying everything from Amazon packages to vaccines.",
        ],
        scale: "There are more planes in the air right now than there are yellow cabs in New York City (~13,000).",
        relatedSlugs: ["co2-emissions", "active-satellites"],
    },

    "global-earthquakes": {
        headline: "The Earth's crust never stops moving — hundreds of quakes happen every single day.",
        explanation:
            "Earthquakes occur when tectonic plates shift, releasing energy as seismic waves. The USGS operates a global network of seismographs that detects and catalogs every earthquake above magnitude 2.5 in near real-time.",
        whyItMatters:
            "Earthquakes are the most destructive natural disaster by economic impact. Understanding their frequency helps appreciate that our planet is geologically active — and that most earthquakes go completely unnoticed.",
        keyInsights: [
            "About 55 earthquakes of magnitude 5+ happen every month globally.",
            "The Pacific Ring of Fire produces about 81% of the world's largest earthquakes.",
            "A magnitude 6 earthquake releases about 31x more energy than a magnitude 5.",
            "Most earthquakes are too small to be felt — only the USGS instruments detect them.",
            "The deepest earthquakes occur about 700 km below the surface.",
        ],
        scale: "Only about 15 earthquakes per year are magnitude 7+ — the kind that makes international news.",
        relatedSlugs: ["near-earth-asteroids", "temperature-anomaly"],
    },

    "near-earth-asteroids": {
        headline: "Space rocks fly past Earth every single day — NASA tracks every one of them.",
        explanation:
            "Near-Earth Objects (NEOs) are asteroids and comets whose orbits bring them within 50 million km of Earth. NASA's Center for Near Earth Object Studies (CNEOS) at JPL calculates and publishes close approach data daily. 'Potentially hazardous' objects are those larger than 140 meters passing within 7.5 million km.",
        whyItMatters:
            "While the risk of a catastrophic impact is extremely low, planetary defense is a real scientific field. NASA's DART mission in 2022 successfully changed an asteroid's orbit — proving we can protect ourselves.",
        keyInsights: [
            "Over 35,000 near-Earth asteroids have been discovered so far.",
            "About 5–10 asteroids pass closer than the Moon every month.",
            "NASA has found about 95% of 'planet-killer' asteroids (1 km+) — none are on a collision course.",
            "The 2013 Chelyabinsk meteor (20 meters) injured 1,500 people in Russia — with no warning.",
            "NASA's DART mission proved we can deflect asteroids by intentionally crashing a spacecraft into one.",
        ],
        scale: "Even a 'close approach' of 5 million km means the asteroid is about 13 times farther away than the Moon.",
        relatedSlugs: ["global-earthquakes", "active-satellites"],
    },

    "live-population": {
        headline: "About 385,000 babies are born every day — and about 170,000 people die.",
        explanation:
            "The world's population grows by roughly 215,000 people every day (net). This card estimates births and deaths using UN demographic rates applied to the current time of day. It's not counting individual events — it's modeling the statistical flow of life on Earth.",
        whyItMatters:
            "Population growth drives demand for food, water, energy, housing, and jobs. Understanding how fast humanity is growing (or in some countries, shrinking) is essential for planning the future.",
        keyInsights: [
            "World population passed 8 billion in November 2022.",
            "Global growth rate has been declining — from 2.1%/year in 1968 to about 0.9% today.",
            "India surpassed China as the most populous country in 2023.",
            "About 60% of the world's population lives in Asia.",
            "The UN projects global population will peak around 10.3 billion in the 2080s, then decline.",
        ],
        scale: "The daily net growth (~215,000) is like adding a city the size of Birmingham, Alabama every single day.",
        relatedSlugs: ["extreme-poverty", "internet-access", "water-usage"],
    },

    "ai-adoption": {
        headline: "Only about 1 in 6 humans have ever used a generative AI tool.",
        explanation:
            "Despite the hype, most of the world has never interacted with ChatGPT, Gemini, Claude, or any other AI assistant. This card breaks down the global population by AI usage: daily users, weekly users, people who've tried it, and the vast majority who haven't.",
        whyItMatters:
            "AI is often discussed as if it's everywhere, but adoption is concentrated in wealthy, English-speaking countries. Understanding the real scale of adoption helps separate the hype from reality.",
        keyInsights: [
            "About 1.1 billion people have used an AI tool at least once — but most of humanity hasn't.",
            "ChatGPT alone has about 300 million weekly active users — more than Twitter/X.",
            "AI adoption is highest among 18-34 year olds in high-income countries.",
            "Only about 150 million people use AI tools every day.",
            "Language barriers, internet access, and digital literacy limit AI adoption in developing countries.",
        ],
        scale: "If you use AI regularly, you're in a group smaller than the population of the US + EU combined.",
        relatedSlugs: ["internet-access", "smartphone-access"],
    },

    "internet-access": {
        headline: "2.2 billion people — more than 1 in 4 humans — have never been online.",
        explanation:
            "While 6 billion people have internet access, a staggering 2.2 billion do not. The digital divide closely mirrors economic inequality: 96% of the offline population lives in low- and middle-income countries. The ITU tracks this globally.",
        whyItMatters:
            "Internet access has become a prerequisite for education, healthcare, banking, and economic opportunity. Being offline in 2026 means being excluded from an increasingly digital economy.",
        keyInsights: [
            "Africa has the lowest internet penetration at about 40%.",
            "Women in low-income countries are 30% less likely to use the internet than men.",
            "Mobile phones are the primary internet device for most of the developing world — not computers.",
            "Internet access is growing fastest in South Asia and Sub-Saharan Africa.",
            "The UN considers internet access a human right since 2016.",
        ],
        scale: "2.2 billion offline = more than the combined populations of North America, South America, and Europe.",
        relatedSlugs: ["smartphone-access", "ai-adoption", "extreme-poverty"],
    },

    "smartphone-access": {
        headline: "4.7 billion people own a smartphone — but 2.4 billion have no phone at all.",
        explanation:
            "Smartphones are the primary computing device for most of the world. But ownership is uneven: while rich countries have near-universal smartphone adoption, billions in developing nations still use basic feature phones or have no mobile device at all.",
        whyItMatters:
            "For billions, a smartphone is their only access to the internet, banking, education, and healthcare. The 'smartphone divide' increasingly determines who can participate in the modern economy.",
        keyInsights: [
            "About 57% of the world's population owns a smartphone.",
            "There are 5.78 billion unique mobile phone users globally — but many have multiple SIM cards.",
            "Feature phones (non-smart) still represent about 19% of all mobile connections worldwide.",
            "In Sub-Saharan Africa, smartphone penetration is only about 50%.",
            "The average smartphone is replaced every 2.5–3 years, generating massive e-waste.",
        ],
        scale: "The 2.4 billion people with no phone at all outnumber the entire population of the Americas.",
        relatedSlugs: ["internet-access", "ai-adoption"],
    },

    "co2-emissions": {
        headline: "Humanity pumps 37.4 billion tonnes of CO₂ into the atmosphere every year.",
        explanation:
            "This card shows annual fossil fuel CO₂ emissions by major emitters. China, the US, and India together produce over half of all emissions. The data comes from the Global Carbon Project, which aggregates national reports and satellite measurements.",
        whyItMatters:
            "CO₂ is the primary driver of global warming. To limit warming to 1.5°C, global emissions need to roughly halve by 2030 — but they're still rising. Every fraction of a degree matters.",
        keyInsights: [
            "China emits about 32% of global CO₂ — but much of that makes goods exported to other countries.",
            "US per-capita emissions (~14 tonnes/person) are roughly 2x China's and 8x India's.",
            "Global CO₂ hit a new record in 2024 despite renewable energy growth.",
            "If CO₂ emissions stopped today, temperatures would still remain elevated for centuries.",
            "The top 10 emitting countries produce about 68% of global fossil CO₂.",
        ],
        scale: "37.4 billion tonnes = about 4.6 tonnes per person on Earth, or the weight of a small car per person per year.",
        relatedSlugs: ["renewable-energy", "temperature-anomaly", "ev-adoption"],
    },

    "renewable-energy": {
        headline: "Fossil fuels still generate 59% of the world's electricity — but renewables are surging.",
        explanation:
            "This card shows the global electricity mix: what percentage comes from coal, gas, oil, nuclear, hydro, wind, solar, and other renewables. Despite rapid growth in solar and wind, coal alone still produces about 35% of the world's power.",
        whyItMatters:
            "Electricity generation is the single largest source of CO₂ emissions. The speed of the transition from fossil fuels to renewables will determine whether we meet climate targets.",
        keyInsights: [
            "Solar and wind combined surpassed hydropower for the first time in 2024.",
            "Low-carbon sources (renewables + nuclear) hit 40.9% of global electricity for the first time.",
            "China installed more solar capacity in 2024 than the rest of the world combined.",
            "Coal power is declining in Europe and North America but still growing in Asia.",
            "Nuclear provides about 9% of global electricity — controversial but carbon-free.",
        ],
        scale: "Global electricity generation is about 30,000 TWh/year — enough to power 30 billion average homes.",
        relatedSlugs: ["co2-emissions", "ev-adoption", "temperature-anomaly"],
    },

    "ev-adoption": {
        headline: "1 in 5 new cars sold in 2024 was electric — a historic tipping point.",
        explanation:
            "In 2024, about 17 million electric vehicles were sold globally, representing over 20% of all new car sales. China leads with 11 million EVs sold. This card compares EV sales to traditional internal combustion engine (ICE) sales.",
        whyItMatters:
            "Transportation accounts for about 16% of global CO₂ emissions. The shift to EVs is one of the fastest-moving climate solutions — and it's happening faster than most predictions expected.",
        keyInsights: [
            "China sold more than 11 million EVs in 2024 — about 65% of the global total.",
            "Norway leads in EV market share: over 90% of new cars sold are electric.",
            "Battery costs have fallen 90% since 2010, making EVs increasingly competitive with ICE vehicles.",
            "The IEA projects 1 in 4 new cars will be electric by 2025.",
            "The global EV fleet surpassed 45 million vehicles on the road by end of 2024.",
        ],
        scale: "17 million EVs sold in one year is more than the total number of cars in all of Australia.",
        relatedSlugs: ["co2-emissions", "renewable-energy"],
    },

    "wealth-inequality": {
        headline: "The top 1% owns 43% of the world's wealth. The bottom 50% owns just 2%.",
        explanation:
            "This card visualizes global wealth distribution. The richest 1% of adults (about 60 million people) hold nearly half of all global financial assets. Meanwhile, the bottom half of humanity — about 4 billion people — share just 2% of total wealth.",
        whyItMatters:
            "Extreme wealth concentration affects political power, social mobility, and economic stability. When a few thousand billionaires hold as much wealth as billions of people, it raises fundamental questions about the economic system.",
        keyInsights: [
            "The world's ~2,700 billionaires hold about $14 trillion combined — more than the GDP of every country except the US and China.",
            "Billionaire wealth grew by $2.8 trillion in 2024 alone — that's $3.5 billion per day.",
            "The top 10% owns 76% of all wealth; the middle 40% owns 22%.",
            "Wealth inequality is even more extreme than income inequality.",
            "Inheritance accounts for a growing share of wealth in developed countries.",
        ],
        scale: "The 5 richest people on Earth have as much wealth as 4.7 billion people — the poorest 60% of humanity.",
        relatedSlugs: ["extreme-poverty", "military-spending"],
    },

    "military-spending": {
        headline: "The world spends $2.72 trillion on militaries every year — and it's accelerating.",
        explanation:
            "Global military expenditure in 2024 saw its steepest annual increase since the end of the Cold War. The US alone accounts for 37% of all military spending worldwide — spending 3.2 times more than China, the second-largest spender.",
        whyItMatters:
            "Military spending reflects geopolitical tensions and opportunity costs. The $2.72 trillion spent on defense annually is more than enough to end extreme poverty, provide universal healthcare, and fund global climate adaptation.",
        keyInsights: [
            "The US military budget ($997 billion) is larger than the next 10 countries combined.",
            "2024 marks the 10th consecutive year of global military spending increases.",
            "Russia's military spending surged 70%+ since 2021 due to the Ukraine conflict.",
            "The top 5 spenders (US, China, Russia, India, UK) account for 60% of the global total.",
            "NATO members now average 2.2% of GDP on defense, exceeding the 2% guideline for the first time.",
        ],
        scale: "$2.72 trillion is about $340 per human on Earth — or $7,400 per US household per year.",
        relatedSlugs: ["us-national-debt", "wealth-inequality", "extreme-poverty"],
    },

    "bitcoin-price": {
        headline: "The world's first decentralized currency, worth more than most countries' money supplies.",
        explanation:
            "Bitcoin is a decentralized digital currency with a fixed supply of 21 million coins — about 19.6 million have been mined so far. Its price is determined purely by supply and demand on global exchanges, operating 24/7 with no central authority.",
        whyItMatters:
            "Bitcoin represents a fundamental experiment: can a monetary system work without governments or banks? With a market cap rivaling major companies, it's too big to dismiss — but too volatile to ignore.",
        keyInsights: [
            "Only 21 million Bitcoin will ever exist — about 19.6 million have been mined so far.",
            "An estimated 3–4 million Bitcoin are permanently lost (owners lost their keys).",
            "Bitcoin uses about as much electricity as a small country (100-150 TWh/year).",
            "El Salvador made Bitcoin legal tender in 2021, the first country to do so.",
            "About 46 million Americans own Bitcoin — roughly 14% of the US population.",
        ],
        scale: "At current prices, all Bitcoin combined is worth more than the GDP of many G20 nations.",
        relatedSlugs: ["ethereum-price", "trillion-dollar-club"],
    },

    "wikipedia-pageviews": {
        headline: "270 million times a day, someone opens Wikipedia to learn something.",
        explanation:
            "English Wikipedia alone receives about 270 million pageviews per day — and that's just one of 300+ language editions. This card breaks down views by device type: desktop, mobile web, and the official app. It's a real-time proxy for what the internet is curious about.",
        whyItMatters:
            "Wikipedia is the closest thing humanity has to a shared, free knowledge base. Understanding its daily traffic reveals what the world is reading about — and how we access knowledge in the mobile era.",
        keyInsights: [
            "Mobile now accounts for about 68% of all Wikipedia pageviews.",
            "Wikipedia has over 63 million articles across 300+ languages.",
            "English Wikipedia has about 6.8 million articles — the largest edition.",
            "Wikipedia is the 7th most visited website in the world.",
            "Only about 280,000 active editors maintain the entire English Wikipedia.",
        ],
        scale: "270 million pageviews/day means Wikipedia serves about 3,125 pages every second.",
        relatedSlugs: ["internet-access", "smartphone-access"],
    },

    "active-satellites": {
        headline: "One company — SpaceX — operates 66% of all active satellites in orbit.",
        explanation:
            "There are about 14,500 active satellites orbiting Earth, and the number is growing rapidly. Starlink alone accounts for 9,600+ satellites, launched to provide global internet coverage. Other operators include governments, scientific agencies, and commercial companies.",
        whyItMatters:
            "Satellites enable GPS, weather forecasting, communications, internet access, and military surveillance. But the explosive growth raises concerns about space debris, light pollution, and the long-term sustainability of Earth's orbital environment.",
        keyInsights: [
            "SpaceX launches 20–40 new Starlink satellites per month.",
            "The number of active satellites grew 23% year-over-year.",
            "There are also about 40,000+ pieces of tracked space debris larger than 10 cm orbiting Earth.",
            "China's growing constellation (including Guowang) is the second-largest national program.",
            "Low Earth Orbit (LEO) is becoming crowded — collision avoidance maneuvers are increasingly frequent.",
        ],
        scale: "If all 14,500 satellites were visible at once, you'd see about 5 per degree of sky.",
        relatedSlugs: ["near-earth-asteroids", "internet-access"],
    },

    "cyberattacks-today": {
        headline: "Over 2 million cyberattacks are detected every single day worldwide.",
        explanation:
            "Cybercrime is constant, automated, and growing. This card estimates the daily volume of detected cyberattacks — including malware/ransomware, phishing, DDoS attacks, and other threats. These numbers come from aggregated threat intelligence reports.",
        whyItMatters:
            "Cybercrime is projected to cost the global economy $10.5 trillion annually by 2025 — more than the GDP of every country except the US and China. Everyone connected to the internet is a potential target.",
        keyInsights: [
            "Ransomware attacks increased by over 70% in 2024.",
            "The average data breach costs a company $4.45 million.",
            "Phishing is the most common attack vector, accounting for about 32% of all attacks.",
            "A business falls victim to a ransomware attack every 11 seconds.",
            "90% of successful cyberattacks begin with a phishing email.",
        ],
        scale: "2.2 million attacks/day means about 25 cyberattacks happen every second.",
        relatedSlugs: ["internet-access", "ai-adoption"],
    },

    "temperature-anomaly": {
        headline: "Earth is 1.48°C warmer than normal — 2024 was the hottest year ever recorded.",
        explanation:
            "The 'temperature anomaly' measures how much today's average global temperature differs from the pre-industrial baseline (1850–1900). This card breaks the warming into three phases: pre-2000 warming, post-2000 warming, and the recent acceleration spike of 2023–2025.",
        whyItMatters:
            "The Paris Agreement set 1.5°C as the danger threshold. At 1.48°C, we're already at the doorstep. Every fraction of a degree brings more extreme weather, sea level rise, and ecosystem disruption.",
        keyInsights: [
            "2024 was the hottest year in recorded history, surpassing 2023.",
            "The last 10 years have all been among the 10 warmest on record.",
            "About half of all recorded warming has occurred since 2000 — the pace is accelerating.",
            "The Arctic is warming about 4x faster than the global average.",
            "Even stopping all emissions today wouldn't immediately reverse warming — CO₂ stays in the atmosphere for centuries.",
        ],
        scale: "1.48°C may not sound like much, but during the Ice Age, global temperatures were only about 6°C cooler than today.",
        relatedSlugs: ["co2-emissions", "renewable-energy", "ocean-plastic"],
    },

    "deforestation": {
        headline: "The world loses about 10 million hectares of forest every year — an area the size of Portugal.",
        explanation:
            "Deforestation — the permanent clearing of forest for agriculture, logging, and development — removes about 10 million hectares annually. Reforestation and natural regrowth add back about 5 million hectares. The net loss is ~5 million hectares per year.",
        whyItMatters:
            "Forests absorb about 30% of human CO₂ emissions and host 80% of terrestrial biodiversity. Deforestation accelerates climate change and drives species extinction. The Amazon alone produces 20% of the world's oxygen.",
        keyInsights: [
            "Tropical deforestation accounts for the vast majority of forest loss.",
            "Brazil and Indonesia are responsible for about 50% of tropical deforestation.",
            "Agriculture (cattle ranching, soy, palm oil) drives about 80% of deforestation.",
            "The Amazon rainforest has lost about 17% of its tree cover in the last 50 years.",
            "Forest restoration programs have improved: reforestation rates are slowly increasing in some regions.",
        ],
        scale: "10 million hectares/year lost = a football field of forest cleared every 2 seconds.",
        relatedSlugs: ["co2-emissions", "temperature-anomaly", "ocean-plastic"],
    },

    "ocean-plastic": {
        headline: "At least 14 million tonnes of plastic enter the ocean every year. Only 1% is ever recovered.",
        explanation:
            "Plastic pollution in the ocean comes from packaging, textiles, fishing gear, and other sources. Once in the ocean, it breaks down into microplastics but never fully biodegrades. This card shows the estimated annual flow of plastic into oceans by type.",
        whyItMatters:
            "Microplastics have been found in human blood, breast milk, and in every ocean on Earth — from the Mariana Trench to Arctic ice. Marine plastic kills an estimated 1 million seabirds and 100,000 marine mammals every year.",
        keyInsights: [
            "Only 9% of all plastic ever produced has been recycled — 79% is in landfills or the environment.",
            "The Great Pacific Garbage Patch is about 2x the size of Texas.",
            "Packaging is the largest category of plastic entering oceans (~40%).",
            "Microplastics have been found in human blood, breast milk, and placentas.",
            "At current rates, there could be more plastic by weight than fish in the ocean by 2050.",
        ],
        scale: "14 million tonnes = about 2 garbage trucks full of plastic dumped into the ocean every minute.",
        relatedSlugs: ["deforestation", "co2-emissions", "food-waste"],
    },

    "trillion-dollar-club": {
        headline: "Just 8 companies are worth more than most countries' entire economies.",
        explanation:
            "The 'Trillion Dollar Club' tracks companies with market capitalizations exceeding $1 trillion. These are the largest publicly traded corporations on Earth, led by technology giants. Their combined value of ~$23 trillion exceeds the GDP of the EU.",
        whyItMatters:
            "The concentration of economic power in a handful of tech companies raises questions about market dominance, antitrust, and the influence of Big Tech on politics, employment, and innovation.",
        keyInsights: [
            "NVIDIA's rise to #1 was driven by explosive demand for AI training chips (GPUs).",
            "Apple was the first company to reach $1T (2018), $2T (2020), and $3T (2023).",
            "The combined market cap of these companies exceeds the GDP of every country except the US and China.",
            "These 8 companies employ about 2.5 million people combined — a tiny fraction of the global workforce.",
            "Tech dominance: 7 of the 8 members are technology companies.",
        ],
        scale: "$23 trillion = each member company, on average, is worth more than the entire GDP of the Netherlands.",
        relatedSlugs: ["bitcoin-price", "ethereum-price", "wealth-inequality"],
    },

    "sp500-mood": {
        headline: "The S&P 500 is a daily vote on the American economy — and today's results are in.",
        explanation:
            "The S&P 500 tracks the 500 largest publicly traded companies in the US. Each trading day, each stock closes either up, down, or flat. This card shows today's 'mood' — how many of the 500 components went up versus down. It's a breadth indicator of market health.",
        whyItMatters:
            "The S&P 500 is the world's most-watched stock index. Over half of Americans have money in stocks (directly or through retirement accounts). When the market moves, it affects pensions, 401(k)s, and the broader economy.",
        keyInsights: [
            "On an average day, about 55% of S&P 500 stocks close positive.",
            "The S&P 500 has returned an average of ~10% per year over the last 100 years.",
            "About 77% of professionally managed funds fail to beat the S&P 500 over 15 years.",
            "The top 10 stocks by weight account for about 35% of the entire index's value.",
            "The S&P 500 includes companies from all 11 GICS sectors — it's a broad economic snapshot.",
        ],
        scale: "The S&P 500's total market cap is about $45 trillion — roughly equal to the GDP of the US and China combined.",
        relatedSlugs: ["trillion-dollar-club", "bitcoin-price"],
    },

    "food-waste": {
        headline: "One-third of all food produced on Earth is lost or wasted — about 1.3 billion tonnes/year.",
        explanation:
            "Of the ~6 billion tonnes of food produced each year, about 1 billion tonnes are lost in the supply chain (harvest, storage, transport) and another 1 billion tonnes are wasted by consumers and retailers. This card shows production vs. loss vs. waste.",
        whyItMatters:
            "Food waste is responsible for 8–10% of global greenhouse gas emissions. If food waste were a country, it would be the third-largest emitter after the US and China. Meanwhile, 700 million people go hungry.",
        keyInsights: [
            "Consumer waste is highest in high-income countries; supply chain loss is highest in developing countries.",
            "The average American family throws away about $1,600 worth of food per year.",
            "Food waste in landfills produces methane — a greenhouse gas 80x more potent than CO₂ over 20 years.",
            "Reducing food waste is one of the single most impactful climate solutions available.",
            "The UN aims to halve food waste by 2030 under SDG 12.3.",
        ],
        scale: "1.3 billion tonnes wasted = about 160 kg per person per year, or roughly 1 meal thrown away daily per person.",
        relatedSlugs: ["co2-emissions", "extreme-poverty", "water-usage"],
    },

    "extreme-poverty": {
        headline: "700 million people survive on less than $2.15 per day — about 1 in 11 humans.",
        explanation:
            "Extreme poverty is defined by the World Bank as living on less than $2.15/day (adjusted for purchasing power). While the number has dropped dramatically since 2000, progress has slowed post-COVID, and poverty is increasingly concentrated in Sub-Saharan Africa.",
        whyItMatters:
            "Extreme poverty isn't just about money — it means inadequate food, no clean water, limited healthcare, and no safety net. The progress humanity has made (from 1.9 billion in extreme poverty in 2000 to 700 million today) is one of the greatest achievements in history.",
        keyInsights: [
            "Extreme poverty fell from 36% of the world (1990) to about 8.5% today.",
            "Sub-Saharan Africa now accounts for about 60% of the world's extreme poor.",
            "COVID-19 pushed an additional 70-100 million people into extreme poverty.",
            "At $6.85/day threshold, about 3.5 billion people (44% of humanity) are considered poor.",
            "China lifted 800 million people out of extreme poverty between 1990 and 2020 — the largest poverty reduction in history.",
        ],
        scale: "700 million people = more than double the population of the United States.",
        relatedSlugs: ["wealth-inequality", "food-waste", "internet-access"],
    },

    "water-usage": {
        headline: "Agriculture uses 70% of all freshwater — and the world is running low.",
        explanation:
            "Humanity withdraws about 4,000 cubic kilometers of freshwater every year for agriculture, industry, and domestic use. Agriculture dominates at 70%, mostly for irrigation. This card shows how the world's limited freshwater supply is divided.",
        whyItMatters:
            "Only 3% of Earth's water is freshwater, and most of that is locked in ice. About 2 billion people already live in water-stressed countries. Climate change, population growth, and agriculture are straining supplies further.",
        keyInsights: [
            "It takes about 15,000 liters of water to produce 1 kg of beef.",
            "About 2 billion people live in countries experiencing high water stress.",
            "Agriculture uses 70% of freshwater but produces only enough food for 5 of the 8 billion humans (due to waste).",
            "The Ogallala Aquifer (US Great Plains) is being depleted 3–100x faster than it recharges.",
            "By 2025, half the world's population will live in water-stressed areas.",
        ],
        scale: "4,000 km³/year = about 500 liters per person per day, or roughly 130 gallons per person daily.",
        relatedSlugs: ["food-waste", "live-population", "deforestation"],
    },
};

export function getCardKnowledge(datasetSlug: string): CardKnowledge | null {
    return knowledgeMap[datasetSlug] ?? null;
}
