// NOTE: No static import of mongodb here — we use dynamic import() inside the
// DB functions so mongodb.ts only loads at request time (after env vars are
// guaranteed to be available by Next.js). A static import runs at module-init
// time which can throw in Turbopack before .env.local is fully loaded.

export interface PanchangParams {
  date?: string; // YYYY-MM-DD
  latitude?: number;
  longitude?: number;
  timezone?: string;
  ayanamsa?: string;
}

// Hardcoded festivals removed in favor of real API data


// ─── Helper: ISO datetime → readable IST time ────────────────────────────────
function toTime(iso?: string | null): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleTimeString('en-IN', {
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
    });
  } catch { return ''; }
}

// ─── Moon Sign from nakshatra number (1-27) ──────────────────────────────────
const RASHI_EN = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];
function getMoonSign(nakshatraNum: number): string {
  if (!nakshatraNum) return '';
  const idx = Math.min(Math.ceil(nakshatraNum / 2.25) - 1, 11);
  return RASHI_EN[idx];
}

// ─── Moon placement: North (1-14) / South (15-27) based on nakshatra ─────────
function getMoonPlacement(nakshatraNum: number): string {
  if (!nakshatraNum) return '';
  return nakshatraNum <= 14 ? 'NORTH' : 'SOUTH';
}

// ─── Sun Sign (sidereal/Lahiri) from Gregorian date ──────────────────────────
const SUN_SIGN_TRANSITIONS: Array<{ rashi: string; month: number; day: number }> = [
  { rashi: 'Sagittarius', month: 12, day: 16 },
  { rashi: 'Scorpio',     month: 11, day: 17 },
  { rashi: 'Libra',       month: 10, day: 18 },
  { rashi: 'Virgo',       month:  9, day: 17 },
  { rashi: 'Leo',         month:  8, day: 17 },
  { rashi: 'Cancer',      month:  7, day: 17 },
  { rashi: 'Gemini',      month:  6, day: 15 },
  { rashi: 'Taurus',      month:  5, day: 15 },
  { rashi: 'Aries',       month:  4, day: 14 },
  { rashi: 'Pisces',      month:  3, day: 15 },
  { rashi: 'Aquarius',    month:  2, day: 13 },
  { rashi: 'Capricorn',   month:  1, day: 15 },
];
function getSunSign(date: Date): string {
  const m = date.getMonth() + 1, d = date.getDate();
  for (const t of SUN_SIGN_TRANSITIONS) {
    if (m > t.month || (m === t.month && d >= t.day)) return t.rashi;
  }
  return 'Sagittarius';
}

// ─── Lunar month names from tithi paksha + solar month ───────────────────────
const LUNAR_MONTHS = [
  'Chaitra','Vaishakh','Jyeshtha','Ashadha',
  'Shravan','Bhadrapada','Ashwin','Kartik',
  'Margashirsha','Pausha','Magha','Phalguna',
];
function getLunarMonths(date: Date, paksha: string): { amanta: string; purnimanta: string } {
  const solarToAmanta = [9, 10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  const idx = solarToAmanta[date.getMonth()];
  const amanta = LUNAR_MONTHS[idx];
  const purnimanta = LUNAR_MONTHS[(idx + 1) % 12];
  return { amanta, purnimanta };
}

// ─── Vikram & Shaka Samvat ────────────────────────────────────────────────────
const SAMVATSARA = [
  'Prabhava','Vibhava','Shukla','Pramoda','Prajapati','Angiras',
  'Shrimukha','Bhava','Yuvan','Dhatri','Ishvara','Bahudhanya',
  'Pramathi','Vikrama','Vrisha','Chitrabhanu','Svabhanu','Tarana',
  'Parthiva','Vyaya','Sarvajit','Sarvadhari','Virodhi','Vikrita',
  'Khara','Nandana','Vijaya','Jaya','Manmatha','Durmukha',
  'Hevilambi','Vilambi','Vikari','Sharvari','Plava','Shubhakrit',
  'Shobhakrit','Krodhi','Vishvavasu','Parabhava','Plavanga','Kilaka',
  'Saumya','Sadharana','Virodhikrit','Paridhavi','Pramadicha','Ananda',
  'Rakshasa','Nala','Pingala','Kalayukti','Siddharthi','Raudra',
  'Durmathi','Dundubhi','Rudhirodgari','Raktakshi','Krodhana','Akshaya',
];
function getSamvat(date: Date): { vikram: string; shaka: string } {
  const m = date.getMonth() + 1;
  const vikram = date.getFullYear() + (m >= 4 ? 57 : 56);
  const shaka  = date.getFullYear() + (m >= 4 ? -78 : -79);
  const vName = SAMVATSARA[(vikram - 1) % 60];
  const sName = SAMVATSARA[(shaka  - 1) % 60];
  return {
    vikram: `${vikram} (${vName})`,
    shaka:  `${shaka} (${sName})`,
  };
}

// ─── Dishashool (inauspicious direction) by weekday ──────────────────────────
const DISHASHOOL_MAP: Record<string, string> = {
  Sunday: 'West', Monday: 'East', Tuesday: 'North',
  Wednesday: 'North', Thursday: 'South', Friday: 'West', Saturday: 'East',
};

// ─── Season (Ritu) from date ──────────────────────────────────────────────────
function getSeason(date: Date): string {
  const m = date.getMonth() + 1, d = date.getDate();
  if ((m === 3 && d >= 15) || m === 4 || (m === 5 && d < 15)) return 'Vasant';
  if ((m === 5 && d >= 15) || m === 6 || (m === 7 && d < 17)) return 'Grishma';
  if ((m === 7 && d >= 17) || m === 8 || (m === 9 && d < 17)) return 'Varsha';
  if ((m === 9 && d >= 17) || m === 10 || (m === 11 && d < 17)) return 'Sharad';
  if ((m === 11 && d >= 17) || m === 12 || (m === 1 && d < 14)) return 'Hemant';
  return 'Shishir';
}

// ─── Ayana from date ─────────────────────────────────────────────────────────
function getAyana(date: Date): string {
  const m = date.getMonth() + 1, d = date.getDate();
  const afterMakarSankranti = m > 1 || (m === 1 && d >= 14);
  const beforeKarkSankranti  = m < 7 || (m === 7 && d <= 16);
  return afterMakarSankranti && beforeKarkSankranti ? 'Uttarayana' : 'Dakshinayana';
}

// ─── Exact Calculation Helper ────────────────────────────────────────────────
function calculateExactTimings(dateObj: Date, longitude: number) {
  const day = dateObj.getDay(); // 0-6 (0 = Sunday)

  const rahuStarts = [16.5, 7.5, 15.0, 12.0, 13.5, 10.5, 9.0];
  const yamaStarts = [12.0, 10.5, 9.0, 7.5, 6.0, 15.0, 13.5];
  const guliStarts = [15.0, 13.5, 12.0, 10.5, 9.0, 7.5, 6.0];

  // Offset in minutes to adjust Local Mean Time (LMT) to IST (82.5° E)
  const offsetMins = Math.round((82.5 - longitude) * 4);

  const formatTime = (hours: number) => {
    let totalMins = Math.round(hours * 60) + offsetMins;
    if (totalMins < 0) totalMins += 24 * 60;

    let h = Math.floor(totalMins / 60) % 24;
    const m = totalMins % 60;

    const ampm = h >= 12 ? 'pm' : 'am';
    if (h > 12) h -= 12;
    if (h === 0) h = 12;

    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return {
    auspiciousTimings: {
      abhijit: {
        start: formatTime(11.6), // 11:36 AM
        end: formatTime(12.4),   // 12:24 PM
      }
    },
    inauspiciousTimings: {
      rahu: {
        start: formatTime(rahuStarts[day]),
        end: formatTime(rahuStarts[day] + 1.5),
      },
      yamghant: {
        start: formatTime(yamaStarts[day]),
        end: formatTime(yamaStarts[day] + 1.5),
      },
      gulik: {
        start: formatTime(guliStarts[day]),
        end: formatTime(guliStarts[day] + 1.5),
      }
    }
  };
}

// ─── Main normalizer ──────────────────────────────────────────────────────────
function normalizeApiResponse(raw: any, queryDate?: string, reqLongitude?: number): any {
  const tithi    = raw.tithi    ?? {};
  const nakshatra = raw.nakshatra ?? {};
  const yoga     = raw.yoga     ?? {};
  const karana   = raw.karana   ?? {};

  const date = queryDate ? new Date(queryDate + 'T12:00:00') : new Date();

  const nakshatraNum: number = nakshatra.number ?? 0;
  const weekday: string      = raw.weekday ?? '';
  const paksha: string       = tithi.paksha ?? '';

  const { amanta, purnimanta } = getLunarMonths(date, paksha);
  const { vikram, shaka }      = getSamvat(date);

  const exactTimings = calculateExactTimings(date, reqLongitude || raw.location?.longitude || 82.9739);

  return {
    queryDate: queryDate || new Date().toISOString(),

    tithi: {
      name:    tithi.name    ?? '',
      endTime: tithi.end_time ? toTime(tithi.end_time) : (tithi.endTime ?? ''),
    },
    nakshatra: {
      name:    nakshatra.name    ?? '',
      endTime: nakshatra.end_time ? toTime(nakshatra.end_time) : (nakshatra.endTime ?? ''),
    },
    yoga: {
      name:    yoga.name    ?? '',
      endTime: yoga.end_time ? toTime(yoga.end_time) : (yoga.endTime ?? ''),
    },
    karana: {
      name:    karana.name    ?? '',
      endTime: karana.end_time ? toTime(karana.end_time) : (karana.endTime ?? ''),
    },

    month:  { amanta, purnimanta },
    samvat: { vikram, shaka },

    sun: {
      sign: getSunSign(date),
      rise: raw.sunrise ? toTime(raw.sunrise) : '',
      set:  raw.sunset  ? toTime(raw.sunset)  : '',
    },
    moon: {
      sign:      getMoonSign(nakshatraNum),
      rise:      raw.moonrise ? toTime(raw.moonrise) : '',
      set:       raw.moonset  ? toTime(raw.moonset)  : '',
      placement: getMoonPlacement(nakshatraNum),
    },

    dishashool: DISHASHOOL_MAP[weekday] ?? '',
    season:     getSeason(date),
    ayana:      getAyana(date),
    festival:   raw.festival ?? '',

    auspiciousTimings: exactTimings.auspiciousTimings,
    inauspiciousTimings: exactTimings.inauspiciousTimings,
    // Note: upcomingFestivals is now fetched independently via fetchFestivalsForMonth
  };
}

// ─── Dynamic MongoDB helper ─────────────────────────────────────────────────
async function getClientPromise() {
  try {
    const mod = await import('../mongodb');
    return mod.default;
  } catch (e) {
    console.error('[Panchang] Failed to import mongodb module:', e);
    return null;
  }
}

let memoryAccessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

async function getTokensFromDb() {
  try {
    const clientPromise = await getClientPromise();
    if (!clientPromise) return null;
    const client = await clientPromise;
    const db = client.db();
    const config = await db.collection('config').findOne({ _id: 'astroved_tokens' as any });
    return config || null;
  } catch (error) {
    console.error('[Panchang] Error fetching tokens from DB:', error);
    return null;
  }
}

async function saveTokensToDb(accessToken: string, refreshToken: string) {
  try {
    const clientPromise = await getClientPromise();
    if (!clientPromise) return;
    const client = await clientPromise;
    const db = client.db();
    await db.collection('config').updateOne(
      { _id: 'astroved_tokens' as any },
      {
        $set: {
          accessToken,
          refreshToken,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('[Panchang] Tokens saved to DB successfully.');
  } catch (error) {
    console.error('[Panchang] Error saving tokens to DB:', error);
  }
}

async function getAccessToken(): Promise<string> {
  if (memoryAccessToken) return memoryAccessToken;

  // 1. Try DB first (most up-to-date refreshed token)
  const dbTokens = await getTokensFromDb();
  if (dbTokens?.accessToken) {
    memoryAccessToken = dbTokens.accessToken;
    console.log('[Panchang] Using access token from DB.');
    return memoryAccessToken!;
  }

  // 2. Fall back to env (initial seed before any refresh)
  const envToken = process.env.ASTROVED_API_TOKEN || process.env.AstroVed_API_TOKEN;
  if (envToken) {
    memoryAccessToken = envToken;
    console.log('[Panchang] Using access token from env.');
    return memoryAccessToken!;
  }

  return '';
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // Always clear stale in-memory token before refresh
      memoryAccessToken = null;

      // Get latest refresh token (DB first, then env)
      const dbTokens = await getTokensFromDb();
      const refreshToken = dbTokens?.refreshToken || process.env.ASTROVED_REFRESH_TOKEN || '';

      if (!refreshToken) {
        console.error('[Panchang] No refresh token available in DB or env. Cannot refresh.');
        return null;
      }

      const refreshUrl = process.env.ASTROVED_REFRESH_API_URL || 'https://qaengine.astroved.com/api/v1/auth/refresh';
      console.log('[Panchang] Attempting token refresh via:', refreshUrl);

      const res = await fetch(refreshUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.error(`[Panchang] Token refresh failed. Status: ${res.status}. Body: ${errBody}`);
        return null;
      }

      const data = await res.json();

      const newToken = data.access_token || data.token || data.jwt || data.JWT_Token || data.Token;
      const newRefreshToken = data.refresh_token || refreshToken;

      if (newToken) {
        memoryAccessToken = newToken;
        await saveTokensToDb(newToken, newRefreshToken);
        console.log('[Panchang] Token refreshed and persisted to DB successfully.');
        return newToken;
      }

      console.error('[Panchang] Token refresh response did not contain a token. Response keys:', Object.keys(data));
      return null;
    } catch (error) {
      console.error('[Panchang] Exception during token refresh:', error);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Fetch & return normalized panchang data ──────────────────────────────────
// Returns null if the API is unavailable or authentication fails.
// The API route must handle null and return an appropriate HTTP error.
export async function fetchPanchangData(params: PanchangParams = {}): Promise<any | null> {
  const {
    date,
    latitude  = 25.3176,        // Varanasi default
    longitude = 82.9739,
    timezone  = 'Asia/Kolkata',
    ayanamsa  = 'LAHIRI',
  } = params;

  let url    = 'https://qaengine.AstroVed.com/api/v2/today-panchanga';
  let method = 'GET';
  let body: string | undefined;

  if (date) {
    url    = 'https://qaengine.AstroVed.com/api/v1/panchanga/comprehensive';
    method = 'POST';
    body   = JSON.stringify({ datetime_local: `${date}T12:00:00`, timezone, latitude, longitude, ayanamsa });
  } else {
    url = `${url}?latitude=${latitude}&longitude=${longitude}&timezone=${timezone}&ayanamsa=${ayanamsa}`;
  }

  let token = await getAccessToken();

  if (!token) {
    console.error('[Panchang] No API token available. Cannot fetch real data.');
    return null;
  }

  // Helper to make the authenticated API request
  const makeRequest = async (currentToken: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentToken}`,
        },
        body,
        cache: 'no-store', // Always fetch fresh — no stale cache
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    let res = await makeRequest(token);

    if (!res.ok) {
      if (res.status === 401) {
        // Access token is expired — clear memory and trigger refresh
        console.warn('[Panchang] 401 Unauthorized. Clearing stale token and attempting refresh...');
        memoryAccessToken = null;

        const newToken = await refreshAccessToken();

        if (newToken) {
          console.log('[Panchang] Token refreshed. Retrying original request...');
          res = await makeRequest(newToken);
          if (!res.ok) {
            console.error(`[Panchang] Retry after token refresh failed. HTTP ${res.status}`);
            return null;
          }
        } else {
          console.error('[Panchang] Token refresh produced no new token. API data unavailable.');
          return null;
        }
      } else {
        const errBody = await res.text().catch(() => '');
        console.error(`[Panchang] API error HTTP ${res.status}: ${errBody}`);
        return null;
      }
    }

    const raw = await res.json();
    console.log('[Panchang] Successfully fetched real API data for date:', date || 'today');
    return normalizeApiResponse(raw, date, longitude);

  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.error('[Panchang] Fetch timeout exceeded.');
    } else {
      console.error('[Panchang] Fetch failed:', err?.message || err);
    }
    return null;
  }
}

// ─── Fetch monthly festivals ──────────────────────────────────────────────────
export async function fetchFestivalsForMonth(year: number, month: number, latitude = 25.3176, longitude = 82.9739): Promise<any | null> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of the month

  let token = await getAccessToken();
  if (!token) return null;

  const url = 'https://qaengine.AstroVed.com/api/v1/panchanga/festivals/range';
  
  const makeRequest = async (currentToken: string) => {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
      body: JSON.stringify({
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        timezone: 'Asia/Kolkata',
        latitude,
        longitude
      })
    });
  };

  try {
    let res = await makeRequest(token);
    
    if (res.status === 401) {
      memoryAccessToken = null;
      const newToken = await refreshAccessToken();
      if (newToken) {
        res = await makeRequest(newToken);
      }
    }

    if (!res.ok) return null;
    
    const raw = await res.json();
    
    // Map the API structure to the flat { date, name } array expected by frontend
    const festivalsList: Array<{ date: string; name: string }> = [];
    
    if (raw.days && Array.isArray(raw.days)) {
      raw.days.forEach((day: any) => {
        if (day.festivals && Array.isArray(day.festivals)) {
          day.festivals.forEach((f: any) => {
            const dateObj = new Date(day.date + 'T12:00:00');
            festivalsList.push({
              date: dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
              name: f.name
            });
          });
        }
      });
    }
    
    return festivalsList;
  } catch (err) {
    console.error('[Panchang] Festivals fetch error:', err);
    return null;
  }
}
