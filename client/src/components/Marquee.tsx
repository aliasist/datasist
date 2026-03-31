export default function Marquee() {
  const items = [
    "⧡ DATASIST v3.0",
    "⧡ ALIASIST.COM",
    "⧡ 340+ AI FACILITIES TRACKED ACROSS 50+ COUNTRIES",
    "⧡ 53,375 MW OPERATIONAL GLOBALLY",
    "⧡ 85,299 MW IN NORTH AMERICA ALONE",
    "⧡ 176 TWh CONSUMED BY US DATA CENTERS IN 2023",
    "⧡ PROJECTED 325–580 TWh BY 2028",
    "⧡ META HYPERION: 5 GW · 3× NEW ORLEANS · RICHWOOD, LA",
    "⧡ STARGATE UAE: 5 GW · ABU DHABI · G42 + OPENAI + NVIDIA",
    "⧡ STARGATE US: $500B AI INFRASTRUCTURE INITIATIVE · ABILENE, TX",
    "⧡ IRELAND: 21% OF NATIONAL ELECTRICITY → DATA CENTERS",
    "⧡ AMSTERDAM MORATORIUM — NO NEW DATA CENTERS UNTIL 2030",
    "⧡ OKLAHOMA: CHEAPEST ELECTRICITY IN US · 96% RENEWABLE AT GOOGLE OKC",
    "⧡ VIRGINIA: 40% OF STATE ELECTRICITY → DATA CENTERS",
    "⧡ ELECTRICITY PRICES +267% IN DATA CENTER HOTSPOTS",
    "⧡ NEOM OXAGON: 1.5 GW NET-ZERO AI CAMPUS · SAUDI ARABIA",
    "⧡ SINGAPORE: NEAR-ZERO RENEWABLES · LNG-POWERED AI",
    "⧡ UAE: DESERT COOLING = 3–4× MORE WATER PER MW",
    "⧡ DENMARK: GOOGLE WASTE HEAT WARMS 11,000 HOMES",
    "⧡ DEEPSEEK: 100 MW HANGZHOU CLUSTER · TRAINED R1 ON RESTRICTED H800s",
    "⧡ KAZAKHSTAN: 1 GW DATA CENTER VALLEY UNDER CONSTRUCTION",
    "⧡ AI POWERED BY GROQ LLAMA-3.3-70B · DEV@ALIASIST.COM",
  ];
  const text = items.join("   ·   ");

  return (
    <div
      className="flex-shrink-0 overflow-hidden border-t"
      style={{
        height: "28px",
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="marquee-track flex items-center h-full">
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            color: "var(--color-green)",
            fontFamily: "'General Sans', monospace",
            display: "inline-block",
            paddingRight: "60px",
          }}
        >
          {text}
        </span>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            color: "var(--color-green)",
            fontFamily: "'General Sans', monospace",
            display: "inline-block",
            paddingRight: "60px",
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}
