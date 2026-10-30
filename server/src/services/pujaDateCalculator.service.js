/**
 * pujaDateCalculator.service.js
 *
 * Dedicated service for automated calculation, synchronization, and database persistence
 * of recurring Puja event dates:
 *  1. Shani Dosha Nivarana Puja  -> Every Saturday (Cutoff: Friday night 12:00 AM / Saturday 00:00:00 IST)
 *  2. Navagraha Shanti Puja       -> Every Sunday   (Cutoff: Saturday night 12:00 AM / Sunday 00:00:00 IST)
 *  3. Rameshwaram Tharpanam       -> Every Amavasya (Cutoff: Amavasya day 11:59:59 PM IST)
 *
 * All dates are calculated in Indian Standard Time (IST, UTC+05:30) and formatted as "DD-MM-YYYY".
 */

import Puja from "../models/pujaModel.js";

/**
 * Chronological Vedic Hindu Panchang Amavasya (New Moon) dates (2026 - 2031) in IST.
 * Standard YYYY-MM-DD ISO format for precise date comparisons.
 */
export const AMAVASYA_DATES = [
  // 2026
  "2026-01-18",
  "2026-02-17",
  "2026-03-18",
  "2026-04-17",
  "2026-05-16",
  "2026-06-14",
  "2026-07-14",
  "2026-08-12",
  "2026-09-10",
  "2026-10-10",
  "2026-11-08",
  "2026-12-08",

  // 2027
  "2027-01-07",
  "2027-02-06",
  "2027-03-08",
  "2027-04-06",
  "2027-05-06",
  "2027-06-04",
  "2027-07-04",
  "2027-08-02",
  "2027-08-31",
  "2027-09-30",
  "2027-10-29",
  "2027-11-28",
  "2027-12-28",

  // 2028
  "2028-01-26",
  "2028-02-25",
  "2028-03-26",
  "2028-04-24",
  "2028-05-24",
  "2028-06-22",
  "2028-07-22",
  "2028-08-20",
  "2028-09-18",
  "2028-10-18",
  "2028-11-16",
  "2028-12-16",

  // 2029
  "2029-01-14",
  "2029-02-13",
  "2029-03-15",
  "2029-04-13",
  "2029-05-13",
  "2029-06-12",
  "2029-07-11",
  "2029-08-10",
  "2029-09-08",
  "2029-10-07",
  "2029-11-06",
  "2029-12-05",

  // 2030
  "2030-01-04",
  "2030-02-02",
  "2030-03-04",
  "2030-04-02",
  "2030-05-02",
  "2030-06-01",
  "2030-06-30",
  "2030-07-30",
  "2030-08-28",
  "2030-09-27",
  "2030-10-26",
  "2030-11-25",
  "2030-12-24",

  // 2031
  "2031-01-23",
  "2031-02-21",
  "2031-03-23",
  "2031-04-21",
  "2031-05-21",
  "2031-06-19",
  "2031-07-19",
  "2031-08-18",
  "2031-09-16",
  "2031-10-16",
  "2031-11-14",
  "2031-12-14",
];

/**
 * Returns current Date components in Indian Standard Time (IST, UTC+5:30)
 */
export function getISTDate(refDate = new Date()) {
  const utcTime = refDate.getTime();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcTime + istOffsetMs);
  return {
    year: istDate.getUTCFullYear(),
    month: istDate.getUTCMonth(), // 0 - 11
    date: istDate.getUTCDate(), // 1 - 31
    day: istDate.getUTCDay(), // 0 (Sun) - 6 (Sat)
    hours: istDate.getUTCHours(),
    minutes: istDate.getUTCMinutes(),
    seconds: istDate.getUTCSeconds(),
    rawIstDate: istDate,
  };
}

/**
 * Pad single digit number with leading zero
 */
const padZero = (n) => String(n).padStart(2, "0");

/**
 * Format year, month, date as DD-MM-YYYY
 */
export function formatDDMMYYYY(year, monthIndex, dateNum) {
  return `${padZero(dateNum)}-${padZero(monthIndex + 1)}-${year}`;
}

/**
 * Format year, month, date as YYYY-MM-DD
 */
export function formatYYYYMMDD(year, monthIndex, dateNum) {
  return `${year}-${padZero(monthIndex + 1)}-${padZero(dateNum)}`;
}

/**
 * Parses "DD-MM-YYYY" string into { year, monthIndex, dateNum }
 */
export function parseDDMMYYYY(str) {
  if (!str || typeof str !== "string") return null;
  const match = str.trim().match(/^(\d{2})[-.](\d{2})[-.](\d{4})$/);
  if (!match) return null;
  return {
    dateNum: parseInt(match[1], 10),
    monthIndex: parseInt(match[2], 10) - 1,
    year: parseInt(match[3], 10),
  };
}

/**
 * Effective baseline date helper:
 * Since today is Oct 30, 2026 and user requested:
 * "start with consider today date is 01.11.2026 i want to start with saturday 7 , sunday 8 and ammavasai is 8"
 * If real date is prior to 2026-11-01, we baseline to 2026-11-01 (Nov 1, 2026) so Saturday is Nov 7, Sunday is Nov 8, and Amavasya is Nov 8.
 */
function getEffectiveReferenceDate(refDate = new Date()) {
  const ist = getISTDate(refDate);
  const currentIso = formatYYYYMMDD(ist.year, ist.month, ist.date);
  const baselineIso = "2026-11-01";
  if (currentIso < baselineIso) {
    // Return Nov 1, 2026 10:00 AM IST (04:30 AM UTC)
    return new Date("2026-11-01T04:30:00.000Z");
  }
  return refDate;
}

/**
 * Calculate the next upcoming Saturday date for Shani Puja.
 *
 * Rules:
 *  - Target day is Saturday (day === 6).
 *  - Cutoff is Friday night 12:00 AM midnight (Saturday 00:00:00 IST).
 *  - If today is Saturday (or past Friday 12:00 AM midnight),
 *    the current Saturday booking is closed, and it advances to NEXT Saturday (+7 days, e.g. 14-11-2026).
 *  - Starting from Nov 1, 2026 (Sunday), the coming Saturday is 07-11-2026.
 */
export function calculateNextSaturday(refDate = new Date()) {
  const effectiveRef = getEffectiveReferenceDate(refDate);
  const ist = getISTDate(effectiveRef);
  const currentDay = ist.day; // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat

  let daysToAdd;
  if (currentDay === 6) {
    // Today is Saturday -> Friday midnight passed -> next Saturday
    daysToAdd = 7;
  } else {
    // Sunday (0): 6 - 0 = 6 days (Nov 1 -> Nov 7)
    // Friday (5): 6 - 5 = 1 day
    daysToAdd = 6 - currentDay;
  }

  const targetTime = ist.rawIstDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000;
  const targetDateObj = new Date(targetTime);

  const year = targetDateObj.getUTCFullYear();
  const month = targetDateObj.getUTCMonth();
  const date = targetDateObj.getUTCDate();

  const eventDateTime = new Date(Date.UTC(year, month, date, 2, 30, 0, 0)).toISOString();

  return {
    dateStr: formatDDMMYYYY(year, month, date),
    isoDate: formatYYYYMMDD(year, month, date),
    eventDateTime,
  };
}

/**
 * Calculate the next upcoming Sunday date for Navagraha Shanti Puja.
 *
 * Rules:
 *  - Target day is Sunday (day === 0).
 *  - Cutoff is Saturday night 12:00 AM midnight (Sunday 00:00:00 IST).
 *  - If today is Sunday (or past Saturday 12:00 AM midnight),
 *    the current Sunday booking is closed, and it advances to NEXT Sunday (+7 days, e.g. 15-11-2026).
 *  - Starting from Nov 1, 2026 (Sunday with cutoff passed), or considering Nov 1 week,
 *    target upcoming Sunday is 08-11-2026.
 */
export function calculateNextSunday(refDate = new Date()) {
  const effectiveRef = getEffectiveReferenceDate(refDate);
  const ist = getISTDate(effectiveRef);
  const currentDay = ist.day; // 0=Sun, 1=Mon, ..., 6=Sat

  let daysToAdd;
  if (currentDay === 0) {
    // Today is Sunday -> Saturday midnight passed -> next Sunday (Nov 1 + 7 days = Nov 8)
    daysToAdd = 7;
  } else {
    daysToAdd = 7 - currentDay;
  }

  const targetTime = ist.rawIstDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000;
  const targetDateObj = new Date(targetTime);

  const year = targetDateObj.getUTCFullYear();
  const month = targetDateObj.getUTCMonth();
  const date = targetDateObj.getUTCDate();

  const eventDateTime = new Date(Date.UTC(year, month, date, 0, 30, 0, 0)).toISOString();

  return {
    dateStr: formatDDMMYYYY(year, month, date),
    isoDate: formatYYYYMMDD(year, month, date),
    eventDateTime,
  };
}

/**
 * Calculate the next upcoming Amavasya date for Rameshwaram Tharpanam.
 *
 * Rules:
 *  - Searches the authoritative Amavasya table.
 *  - Cutoff is the end of the Amavasya day (23:59:59 IST).
 *  - For Nov 1, 2026, the upcoming Amavasya is 08-11-2026.
 *  - After Nov 8 night 12:00 AM midnight, it advances to next Amavasya (08-12-2026).
 */
export function calculateNextAmavasya(refDate = new Date()) {
  const effectiveRef = getEffectiveReferenceDate(refDate);
  const ist = getISTDate(effectiveRef);
  const currentIsoDate = formatYYYYMMDD(ist.year, ist.month, ist.date);

  // Find the first Amavasya date that is today or in the future
  let nextAmavasyaIso = AMAVASYA_DATES.find((d) => d >= currentIsoDate);

  if (!nextAmavasyaIso) {
    const lastIso = AMAVASYA_DATES[AMAVASYA_DATES.length - 1];
    const lastDate = new Date(lastIso + "T00:00:00Z");
    const nextApprox = new Date(lastDate.getTime() + 29.53 * 24 * 60 * 60 * 1000);
    nextAmavasyaIso = formatYYYYMMDD(
      nextApprox.getUTCFullYear(),
      nextApprox.getUTCMonth(),
      nextApprox.getUTCDate()
    );
  }

  const [y, m, d] = nextAmavasyaIso.split("-").map((v) => parseInt(v, 10));
  const dateStr = formatDDMMYYYY(y, m - 1, d);

  const eventDateTime = new Date(Date.UTC(y, m - 1, d, 3, 30, 0, 0)).toISOString();

  return {
    dateStr,
    isoDate: nextAmavasyaIso,
    eventDateTime,
  };
}

/**
 * Calculates current dates for all three recurring pujas.
 */
export function calculateAllPujaDates(refDate = new Date()) {
  return {
    shani: calculateNextSaturday(refDate),
    navagraha: calculateNextSunday(refDate),
    amavasya: calculateNextAmavasya(refDate),
  };
}

/**
 * Synchronizes the calculated dates with the MongoDB database.
 * Updates the 'date' and 'eventDateTime' fields of the respective Puja documents.
 * Returns an array of updated puja summaries.
 */
export async function syncPujaDates(refDate = new Date()) {
  const calculated = calculateAllPujaDates(refDate);
  const updates = [];

  try {
    // 1. Shani Puja (slug: 'shani-puja' or 'shani-dosha-nivarana-puja' or title match)
    const shaniPuja = await Puja.findOne({
      $or: [
        { slug: "shani-puja" },
        { slug: "shani-dosha-nivarana-puja" },
        { title: { $regex: /shani/i } },
      ],
    });

    if (shaniPuja) {
      const isDateChanged =
        shaniPuja.date !== calculated.shani.dateStr ||
        shaniPuja.eventDateTime !== calculated.shani.eventDateTime;

      if (isDateChanged) {
        shaniPuja.date = calculated.shani.dateStr;
        shaniPuja.eventDateTime = calculated.shani.eventDateTime;
        await shaniPuja.save();
        updates.push({
          puja: "Shani Puja",
          slug: shaniPuja.slug,
          updatedDate: calculated.shani.dateStr,
          eventDateTime: calculated.shani.eventDateTime,
        });
      }
    }

    // 2. Navagraha Shanti Puja (slug: 'navagraha-shanti-puja' or title match)
    const navagrahaPuja = await Puja.findOne({
      $or: [
        { slug: "navagraha-shanti-puja" },
        { title: { $regex: /navagraha/i } },
      ],
    });

    if (navagrahaPuja) {
      const isDateChanged =
        navagrahaPuja.date !== calculated.navagraha.dateStr ||
        navagrahaPuja.eventDateTime !== calculated.navagraha.eventDateTime;

      if (isDateChanged) {
        navagrahaPuja.date = calculated.navagraha.dateStr;
        navagrahaPuja.eventDateTime = calculated.navagraha.eventDateTime;
        await navagrahaPuja.save();
        updates.push({
          puja: "Navagraha Shanti Puja",
          slug: navagrahaPuja.slug,
          updatedDate: calculated.navagraha.dateStr,
          eventDateTime: calculated.navagraha.eventDateTime,
        });
      }
    }

    // 3. Rameshwaram Tharpanam (slug: 'rameshwaram-tharpanam' or title match)
    const tharpanamPuja = await Puja.findOne({
      $or: [
        { slug: "rameshwaram-tharpanam" },
        { title: { $regex: /tharpanam/i } },
      ],
    });

    if (tharpanamPuja) {
      const isDateChanged =
        tharpanamPuja.date !== calculated.amavasya.dateStr ||
        tharpanamPuja.eventDateTime !== calculated.amavasya.eventDateTime;

      if (isDateChanged) {
        tharpanamPuja.date = calculated.amavasya.dateStr;
        tharpanamPuja.eventDateTime = calculated.amavasya.eventDateTime;
        await tharpanamPuja.save();
        updates.push({
          puja: "Rameshwaram Tharpanam",
          slug: tharpanamPuja.slug,
          updatedDate: calculated.amavasya.dateStr,
          eventDateTime: calculated.amavasya.eventDateTime,
        });
      }
    }

    if (updates.length > 0) {
      console.log(`[PujaDateCalculator] Synchronized ${updates.length} puja date(s) in DB:`, updates);
    }

    return {
      success: true,
      calculated,
      updates,
    };
  } catch (error) {
    console.error("[PujaDateCalculator] Error syncing puja dates:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

let midnightTimeout = null;

/**
 * Calculates milliseconds remaining until the exact upcoming 12:00:01 AM IST midnight.
 */
function getMsUntilNextMidnightIST() {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  const istNow = new Date(now.getTime() + istOffsetMs);

  // Next midnight in IST: tomorrow 00:00:02 IST (+2 seconds buffer to ensure clock is past 12:00:00 AM)
  const nextMidnightIst = new Date(
    Date.UTC(
      istNow.getUTCFullYear(),
      istNow.getUTCMonth(),
      istNow.getUTCDate() + 1,
      0,
      0,
      2,
      0
    )
  );

  // Convert back to UTC time
  const nextMidnightUtcMs = nextMidnightIst.getTime() - istOffsetMs;
  const msRemaining = Math.max(1000, nextMidnightUtcMs - now.getTime());
  return msRemaining;
}

/**
 * Schedules an exact 12:00 AM (midnight IST) update trigger.
 * No 15-minute polling intervals. Executes once at 12:00:01 AM IST,
 * updates the dates in DB, and reschedules for the next midnight.
 */
function scheduleMidnightTrigger() {
  if (midnightTimeout) {
    clearTimeout(midnightTimeout);
  }

  const msUntilMidnight = getMsUntilNextMidnightIST();
  // const hoursUntil = (msUntilMidnight / (1000 * 60 * 60)).toFixed(2);
  // console.log(`[PujaDateScheduler] Next midnight (12:00 AM IST) auto-update scheduled in ~${hoursUntil} hours.`);

  midnightTimeout = setTimeout(async () => {
    // console.log("[PujaDateScheduler] 12:00 AM IST reached! Executing automated puja date update...");
    try {
      await syncPujaDates();
    } catch (err) {
      console.error("[PujaDateScheduler] Midnight sync error:", err);
    }
    // Re-arm for the next night's 12:00 AM
    scheduleMidnightTrigger();
  }, msUntilMidnight);
}

/**
 * Initializes the automated puja date service on server start:
 *  1. Performs immediate startup synchronization to set baseline dates in DB.
 *  2. Arms the exact 12:00 AM midnight trigger.
 */
export function initPujaDateScheduler() {
  // Sync now on startup
  syncPujaDates()
    .then(() => {
      // console.log("[PujaDateScheduler] Initial startup sync completed.");
    })
    .catch((err) =>
      console.error("[PujaDateScheduler] Startup sync failed:", err)
    );

  // Arm exact 12:00 AM midnight timer (no periodic 15-minute polling)
  scheduleMidnightTrigger();
}
