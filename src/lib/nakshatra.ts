export interface AstroDetails {
  nakshatra: string;
  pada: number;
  rasi: string;
  tithi: string;
  gana: string;
  nadi: string;
  yoni: string;
  lord: string;
  alphabet: string;
}

export interface RashiDetails {
  rashi: string;
  rashiSanskrit: string;
  lord: string;
  element: string;
  quality: string;
  symbol: string;
  luckyColor: string;
  luckyNumber: string;
  traits: string[];
}

export interface MangalDoshaResult {
  hasMangalDosha: boolean;
  marsHouse: number;
  marsSign: string;
  severity: "High" | "Medium" | "Low" | "None";
  description: string;
  remedies: string[];
}

export interface LagnaResult {
  lagnaSign: string;
  lagnaSignSanskrit: string;
  lagnaLord: string;
  element: string;
  qualities: string[];
  lagnaLongitude: number;
}

interface NakshatraMeta {
  gana: string;
  nadi: string;
  yoni: string;
  lord: string;
  alphabet: string;
}

const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

const RASIS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

const TITHIS = [
  "Shukla Pratipada",
  "Shukla Dwitiya",
  "Shukla Tritiya",
  "Shukla Chaturthi",
  "Shukla Panchami",
  "Shukla Shashthi",
  "Shukla Saptami",
  "Shukla Ashtami",
  "Shukla Navami",
  "Shukla Dashami",
  "Shukla Ekadashi",
  "Shukla Dwadashi",
  "Shukla Trayodashi",
  "Shukla Chaturdashi",
  "Purnima",
  "Krishna Pratipada",
  "Krishna Dwitiya",
  "Krishna Tritiya",
  "Krishna Chaturthi",
  "Krishna Panchami",
  "Krishna Shashthi",
  "Krishna Saptami",
  "Krishna Ashtami",
  "Krishna Navami",
  "Krishna Dashami",
  "Krishna Ekadashi",
  "Krishna Dwadashi",
  "Krishna Trayodashi",
  "Krishna Chaturdashi",
  "Amavasya",
] as const;

const NAKSHATRA_META: Record<(typeof NAKSHATRAS)[number], NakshatraMeta> = {
  Ashwini: { gana: "Deva", nadi: "Adi", yoni: "Horse", lord: "Ketu", alphabet: "Chu" },
  Bharani: { gana: "Manushya", nadi: "Madhya", yoni: "Elephant", lord: "Venus", alphabet: "Li" },
  Krittika: { gana: "Rakshasa", nadi: "Antya", yoni: "Sheep", lord: "Sun", alphabet: "A" },
  Rohini: { gana: "Manushya", nadi: "Antya", yoni: "Serpent", lord: "Moon", alphabet: "Vi" },
  Mrigashira: { gana: "Deva", nadi: "Madhya", yoni: "Serpent", lord: "Mars", alphabet: "Ve" },
  Ardra: { gana: "Manushya", nadi: "Adi", yoni: "Dog", lord: "Rahu", alphabet: "Ku" },
  Punarvasu: { gana: "Deva", nadi: "Adi", yoni: "Cat", lord: "Jupiter", alphabet: "Ke" },
  Pushya: { gana: "Deva", nadi: "Madhya", yoni: "Sheep", lord: "Saturn", alphabet: "Hu" },
  Ashlesha: { gana: "Rakshasa", nadi: "Antya", yoni: "Cat", lord: "Mercury", alphabet: "De" },
  Magha: { gana: "Rakshasa", nadi: "Antya", yoni: "Rat", lord: "Ketu", alphabet: "Ma" },
  "Purva Phalguni": { gana: "Manushya", nadi: "Madhya", yoni: "Rat", lord: "Venus", alphabet: "Mo" },
  "Uttara Phalguni": { gana: "Manushya", nadi: "Adi", yoni: "Cow", lord: "Sun", alphabet: "Te" },
  Hasta: { gana: "Deva", nadi: "Adi", yoni: "Buffalo", lord: "Moon", alphabet: "Pu" },
  Chitra: { gana: "Rakshasa", nadi: "Madhya", yoni: "Tiger", lord: "Mars", alphabet: "Pe" },
  Swati: { gana: "Deva", nadi: "Antya", yoni: "Buffalo", lord: "Rahu", alphabet: "Ru" },
  Vishakha: { gana: "Rakshasa", nadi: "Antya", yoni: "Tiger", lord: "Jupiter", alphabet: "Ti" },
  Anuradha: { gana: "Deva", nadi: "Madhya", yoni: "Deer", lord: "Saturn", alphabet: "Na" },
  Jyeshtha: { gana: "Rakshasa", nadi: "Adi", yoni: "Deer", lord: "Mercury", alphabet: "No" },
  Mula: { gana: "Rakshasa", nadi: "Adi", yoni: "Dog", lord: "Ketu", alphabet: "Ye" },
  "Purva Ashadha": { gana: "Manushya", nadi: "Madhya", yoni: "Monkey", lord: "Venus", alphabet: "Bhu" },
  "Uttara Ashadha": { gana: "Manushya", nadi: "Antya", yoni: "Mongoose", lord: "Sun", alphabet: "Bhe" },
  Shravana: { gana: "Deva", nadi: "Antya", yoni: "Monkey", lord: "Moon", alphabet: "Ju" },
  Dhanishta: { gana: "Rakshasa", nadi: "Madhya", yoni: "Lion", lord: "Mars", alphabet: "Ga" },
  Shatabhisha: { gana: "Rakshasa", nadi: "Adi", yoni: "Horse", lord: "Rahu", alphabet: "Go" },
  "Purva Bhadrapada": { gana: "Manushya", nadi: "Adi", yoni: "Lion", lord: "Jupiter", alphabet: "Se" },
  "Uttara Bhadrapada": { gana: "Manushya", nadi: "Madhya", yoni: "Cow", lord: "Saturn", alphabet: "Du" },
  Revati: { gana: "Deva", nadi: "Antya", yoni: "Elephant", lord: "Mercury", alphabet: "De" },
};

export function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function getAyanamsa(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  return 22.460148 + 1.396042 * T + 0.000308 * T * T;
}

function getMoonLongitude(jd: number): number {
  const daysSinceJ2000 = jd - 2451545.0;
  const meanLongitude = 218.316 + 13.176396 * daysSinceJ2000;
  const meanAnomaly = 134.963 + 13.064993 * daysSinceJ2000;
  const meanAnomalyRadians = (normalizeDegrees(meanAnomaly) * Math.PI) / 180;
  const trueLongitude = normalizeDegrees(meanLongitude) + 6.289 * Math.sin(meanAnomalyRadians);
  return normalizeDegrees(trueLongitude);
}

function getSunLongitude(jd: number): number {
  const daysSinceJ2000 = jd - 2451545.0;
  const meanLongitude = 280.46 + 0.9856474 * daysSinceJ2000;
  const meanAnomaly = 357.528 + 0.9856003 * daysSinceJ2000;
  const anomalyRadians = (normalizeDegrees(meanAnomaly) * Math.PI) / 180;
  const trueLongitude =
    normalizeDegrees(meanLongitude) +
    1.915 * Math.sin(anomalyRadians) +
    0.02 * Math.sin(2 * anomalyRadians);
  return normalizeDegrees(trueLongitude);
}

function getMarsLongitude(jd: number): number {
  const daysSinceJ2000 = jd - 2451545.0;
  const meanLongitude = 355.433 + 0.5240208 * daysSinceJ2000;
  const meanAnomaly = 19.373 + 0.5240207 * daysSinceJ2000;
  const anomalyRadians = (normalizeDegrees(meanAnomaly) * Math.PI) / 180;
  const trueLongitude =
    normalizeDegrees(meanLongitude) +
    10.691 * Math.sin(anomalyRadians) +
    0.623 * Math.sin(2 * anomalyRadians);
  return normalizeDegrees(trueLongitude);
}

export function getAstroDetails(date: Date): AstroDetails {
  const jd = getJulianDate(date);
  const ayanamsa = getAyanamsa(jd);

  const moonSiderealLongitude = normalizeDegrees(getMoonLongitude(jd) - ayanamsa);
  const sunSiderealLongitude = normalizeDegrees(getSunLongitude(jd) - ayanamsa);

  const nakshatraSpan = 360 / 27;
  const nakshatraIndex = Math.floor(moonSiderealLongitude / nakshatraSpan);
  const pada = Math.floor((moonSiderealLongitude % nakshatraSpan) / (nakshatraSpan / 4)) + 1;

  const rasiIndex = Math.floor(moonSiderealLongitude / 30);
  const tithiAngle = normalizeDegrees(moonSiderealLongitude - sunSiderealLongitude);
  const tithiIndex = Math.floor(tithiAngle / 12);

  const nakshatra = NAKSHATRAS[nakshatraIndex] ?? "Ashwini";
  const meta = NAKSHATRA_META[nakshatra];

  return {
    nakshatra,
    pada,
    rasi: RASIS[rasiIndex] ?? "Aries",
    tithi: TITHIS[tithiIndex] ?? "Shukla Pratipada",
    gana: meta.gana,
    nadi: meta.nadi,
    yoni: meta.yoni,
    lord: meta.lord,
    alphabet: meta.alphabet,
  };
}

// ─── Rashi Details ────────────────────────────────────────────────────────────
const RASHI_DATA: Record<string, Omit<RashiDetails, "rashi">> = {
  Aries:       { rashiSanskrit: "Mesha",      lord: "Mars",    element: "Fire",  quality: "Cardinal", symbol: "♈", luckyColor: "Red",       luckyNumber: "9", traits: ["Courageous", "Energetic", "Enthusiastic", "Impulsive"] },
  Taurus:      { rashiSanskrit: "Vrishabha",  lord: "Venus",   element: "Earth", quality: "Fixed",    symbol: "♉", luckyColor: "Green",     luckyNumber: "6", traits: ["Patient", "Reliable", "Stubborn", "Devoted"] },
  Gemini:      { rashiSanskrit: "Mithuna",    lord: "Mercury", element: "Air",   quality: "Mutable",  symbol: "♊", luckyColor: "Yellow",    luckyNumber: "5", traits: ["Curious", "Adaptable", "Talkative", "Witty"] },
  Cancer:      { rashiSanskrit: "Karka",      lord: "Moon",    element: "Water", quality: "Cardinal", symbol: "♋", luckyColor: "White",     luckyNumber: "2", traits: ["Intuitive", "Emotional", "Nurturing", "Protective"] },
  Leo:         { rashiSanskrit: "Simha",      lord: "Sun",     element: "Fire",  quality: "Fixed",    symbol: "♌", luckyColor: "Gold",      luckyNumber: "1", traits: ["Generous", "Loyal", "Dramatic", "Proud"] },
  Virgo:       { rashiSanskrit: "Kanya",      lord: "Mercury", element: "Earth", quality: "Mutable",  symbol: "♍", luckyColor: "Navy Blue", luckyNumber: "5", traits: ["Analytical", "Hardworking", "Practical", "Modest"] },
  Libra:       { rashiSanskrit: "Tula",       lord: "Venus",   element: "Air",   quality: "Cardinal", symbol: "♎", luckyColor: "Pink",      luckyNumber: "6", traits: ["Diplomatic", "Fair", "Social", "Indecisive"] },
  Scorpio:     { rashiSanskrit: "Vrishchika", lord: "Mars",    element: "Water", quality: "Fixed",    symbol: "♏", luckyColor: "Maroon",    luckyNumber: "9", traits: ["Passionate", "Determined", "Secretive", "Brave"] },
  Sagittarius: { rashiSanskrit: "Dhanu",      lord: "Jupiter", element: "Fire",  quality: "Mutable",  symbol: "♐", luckyColor: "Purple",    luckyNumber: "3", traits: ["Optimistic", "Freedom-loving", "Philosophical", "Honest"] },
  Capricorn:   { rashiSanskrit: "Makara",     lord: "Saturn",  element: "Earth", quality: "Cardinal", symbol: "♑", luckyColor: "Brown",     luckyNumber: "8", traits: ["Ambitious", "Disciplined", "Patient", "Responsible"] },
  Aquarius:    { rashiSanskrit: "Kumbha",     lord: "Saturn",  element: "Air",   quality: "Fixed",    symbol: "♒", luckyColor: "Blue",      luckyNumber: "8", traits: ["Independent", "Humanitarian", "Intellectual", "Eccentric"] },
  Pisces:      { rashiSanskrit: "Meena",      lord: "Jupiter", element: "Water", quality: "Mutable",  symbol: "♓", luckyColor: "Sea Green", luckyNumber: "3", traits: ["Compassionate", "Artistic", "Intuitive", "Gentle"] },
};

export function getRashiDetails(date: Date): RashiDetails {
  const jd = getJulianDate(date);
  const ayanamsa = getAyanamsa(jd);
  const moonSiderealLongitude = normalizeDegrees(getMoonLongitude(jd) - ayanamsa);
  const rasiIndex = Math.floor(moonSiderealLongitude / 30);
  const rashi = RASIS[rasiIndex] ?? "Aries";
  const data = RASHI_DATA[rashi] ?? RASHI_DATA["Aries"]!;
  return { rashi, ...data };
}

// ─── Mangal Dosha ─────────────────────────────────────────────────────────────
const MANGAL_DOSHA_HOUSES = new Set([1, 2, 4, 7, 8, 12]);

export function getMangalDosha(date: Date): MangalDoshaResult {
  const jd = getJulianDate(date);
  const ayanamsa = getAyanamsa(jd);

  const marsSidereal = normalizeDegrees(getMarsLongitude(jd) - ayanamsa);
  const sunSidereal = normalizeDegrees(getSunLongitude(jd) - ayanamsa);

  const marsSignIndex = Math.floor(marsSidereal / 30);
  const marsSign = RASIS[marsSignIndex] ?? "Aries";

  const lagnaLong = normalizeDegrees(sunSidereal + 90);
  const lagnaHouseBase = Math.floor(lagnaLong / 30);

  const marsHouse = ((marsSignIndex - lagnaHouseBase + 12) % 12) + 1;
  const hasMangalDosha = MANGAL_DOSHA_HOUSES.has(marsHouse);

  const severity: MangalDoshaResult["severity"] = !hasMangalDosha
    ? "None"
    : marsHouse === 7 || marsHouse === 8
    ? "High"
    : marsHouse === 1 || marsHouse === 12
    ? "Medium"
    : "Low";

  const suffix = (n: number) => {
    if (n === 1) return "st";
    if (n === 2) return "nd";
    if (n === 3) return "rd";
    return "th";
  };

  const descriptions: Record<MangalDoshaResult["severity"], string> = {
    High: `Mars is placed in the ${marsHouse}${suffix(marsHouse)} house — a strong Mangal Dosha is present. This can create friction in relationships and marriage. Consulting a Jyotishi and performing remedies is highly recommended.`,
    Medium: `Mars is placed in the ${marsHouse}${suffix(marsHouse)} house — a moderate Mangal Dosha exists. While not the strongest form, awareness and appropriate remedies are advisable.`,
    Low: `Mars is in the ${marsHouse}${suffix(marsHouse)} house — a mild form of Mangal Dosha. The effects are generally manageable.`,
    None: `Mars is placed in the ${marsHouse}${suffix(marsHouse)} house — No Mangal Dosha is present in your chart. Mars is in a neutral position.`,
  };

  const remedies = hasMangalDosha
    ? [
        "Chant Hanuman Chalisa daily",
        "Offer red flowers to Lord Hanuman on Tuesdays",
        "Fast on Tuesdays",
        "Donate red lentils (masoor dal) on Tuesdays",
        "Recite Mangal Stotra — Om Angarakaya Namah",
        "Perform Mangal Dosha puja at a Navagraha temple",
      ]
    : ["No special remedies needed — Mars is favorably placed."];

  return { hasMangalDosha, marsHouse, marsSign, severity, description: descriptions[severity], remedies };
}

// ─── Lagna (Ascendant) ────────────────────────────────────────────────────────
const LAGNA_DATA: Record<string, { sanskrit: string; lord: string; element: string; qualities: string[] }> = {
  Aries:       { sanskrit: "Mesha",      lord: "Mars",    element: "Fire",  qualities: ["Pioneer", "Bold", "Action-oriented", "Natural leader"] },
  Taurus:      { sanskrit: "Vrishabha",  lord: "Venus",   element: "Earth", qualities: ["Stable", "Artistic", "Sensual", "Patient"] },
  Gemini:      { sanskrit: "Mithuna",    lord: "Mercury", element: "Air",   qualities: ["Intellectual", "Communicative", "Versatile", "Curious"] },
  Cancer:      { sanskrit: "Karka",      lord: "Moon",    element: "Water", qualities: ["Sensitive", "Nurturing", "Home-loving", "Intuitive"] },
  Leo:         { sanskrit: "Simha",      lord: "Sun",     element: "Fire",  qualities: ["Majestic", "Generous", "Creative", "Confident"] },
  Virgo:       { sanskrit: "Kanya",      lord: "Mercury", element: "Earth", qualities: ["Analytical", "Methodical", "Health-conscious", "Helpful"] },
  Libra:       { sanskrit: "Tula",       lord: "Venus",   element: "Air",   qualities: ["Balanced", "Charming", "Diplomatic", "Artistic"] },
  Scorpio:     { sanskrit: "Vrishchika", lord: "Mars",    element: "Water", qualities: ["Intense", "Transformative", "Perceptive", "Secretive"] },
  Sagittarius: { sanskrit: "Dhanu",      lord: "Jupiter", element: "Fire",  qualities: ["Philosophical", "Optimistic", "Adventurous", "Honest"] },
  Capricorn:   { sanskrit: "Makara",     lord: "Saturn",  element: "Earth", qualities: ["Disciplined", "Ambitious", "Practical", "Reserved"] },
  Aquarius:    { sanskrit: "Kumbha",     lord: "Saturn",  element: "Air",   qualities: ["Humanitarian", "Innovative", "Independent", "Eccentric"] },
  Pisces:      { sanskrit: "Meena",      lord: "Jupiter", element: "Water", qualities: ["Compassionate", "Spiritual", "Dreamy", "Empathetic"] },
};

export function getLagnaDetails(date: Date): LagnaResult {
  const jd = getJulianDate(date);
  const ayanamsa = getAyanamsa(jd);
  const sunSidereal = normalizeDegrees(getSunLongitude(jd) - ayanamsa);

  const hourFraction = (date.getHours() + date.getMinutes() / 60) / 24;
  const lagnaLongitude = normalizeDegrees(sunSidereal + hourFraction * 360);

  const lagnaIndex = Math.floor(lagnaLongitude / 30);
  const lagnaSign = RASIS[lagnaIndex] ?? "Aries";
  const data = LAGNA_DATA[lagnaSign] ?? LAGNA_DATA["Aries"]!;

  return {
    lagnaSign,
    lagnaSignSanskrit: data.sanskrit,
    lagnaLord: data.lord,
    element: data.element,
    qualities: data.qualities,
    lagnaLongitude,
  };
}
