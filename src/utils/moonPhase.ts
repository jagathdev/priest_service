/**
 * Utility to parse Panchang Tithi string and return the corresponding AI-generated moon phase image path.
 */

export interface MoonPhaseInfo {
  paksha: 'shukla' | 'krishna';
  tithiNumber: number; // 1 to 15
  imagePath: string;
  phaseLabel: string;
}

const TITHI_NAME_MAP: Record<string, number> = {
  pratipada: 1, prathama: 1, ekam: 1,
  dwitiya: 2, ditiya: 2, dooj: 2,
  tritiya: 3, tritiyaa: 3, teej: 3,
  chatuthi: 4, chaturthi: 4, chouth: 4,
  panchami: 5, panchmi: 5,
  shashthi: 6, shashti: 6, chhath: 6,
  saptami: 7,
  ashtami: 8,
  navami: 9,
  dashami: 10,
  ekadashi: 11,
  dwadashi: 12,
  trayodashi: 13,
  chaturdashi: 14,
  purnima: 15, poornima: 15, fullmoon: 15,
  amavasya: 15, amavasi: 15, newmoon: 15,
};

export function getMoonPhaseFromTithi(tithiName?: string): MoonPhaseInfo {
  // Default to a phase if none provided
  if (!tithiName || typeof tithiName !== 'string') {
    return {
      paksha: 'shukla',
      tithiNumber: 8,
      imagePath: '/images/moon-phases/first_quarter.png',
      phaseLabel: 'First Quarter',
    };
  }

  const str = tithiName.toLowerCase();

  // 1. Determine Paksha
  let paksha: 'shukla' | 'krishna' = 'shukla';
  if (str.includes('krishna') || str.includes('waning') || str.includes('amavasya') || str.includes('amavasi') || str.includes('new moon')) {
    paksha = 'krishna';
  } else if (str.includes('shukla') || str.includes('waxing') || str.includes('purnima') || str.includes('poornima') || str.includes('full moon')) {
    paksha = 'shukla';
  }

  // 2. Determine Tithi Number (1-15)
  let tithiNumber = 0;

  if (str.includes('purnima') || str.includes('poornima') || str.includes('full moon')) {
    paksha = 'shukla';
    tithiNumber = 15;
  } else if (str.includes('amavasya') || str.includes('amavasi') || str.includes('new moon')) {
    paksha = 'krishna';
    tithiNumber = 15;
  }

  if (tithiNumber === 0) {
    const digitMatch = str.match(/(\d+)(st|nd|rd|th)?/);
    if (digitMatch && digitMatch[1]) {
      const num = parseInt(digitMatch[1], 10);
      if (num >= 1 && num <= 15) {
        tithiNumber = num;
      }
    }
  }

  if (tithiNumber === 0) {
    const words = str.replace(/[^a-z]/g, ' ').split(/\s+/);
    for (const w of words) {
      if (TITHI_NAME_MAP[w]) {
        tithiNumber = TITHI_NAME_MAP[w];
        break;
      }
    }
  }

  if (tithiNumber < 1 || tithiNumber > 15) {
    tithiNumber = 8;
  }

  // 3. Map to 8 primary phases
  let imageName = '';
  let phaseLabel = '';

  if (paksha === 'shukla') {
    if (tithiNumber >= 1 && tithiNumber <= 6) {
      imageName = 'waxing_crescent.png';
      phaseLabel = 'Waxing Crescent';
    } else if (tithiNumber >= 7 && tithiNumber <= 8) {
      imageName = 'first_quarter.png';
      phaseLabel = 'First Quarter';
    } else if (tithiNumber >= 9 && tithiNumber <= 14) {
      imageName = 'waxing_gibbous.png';
      phaseLabel = 'Waxing Gibbous';
    } else {
      imageName = 'full_moon.png';
      phaseLabel = 'Full Moon (Purnima)';
    }
  } else {
    // krishna
    if (tithiNumber >= 1 && tithiNumber <= 6) {
      imageName = 'waning_gibbous.png';
      phaseLabel = 'Waning Gibbous';
    } else if (tithiNumber >= 7 && tithiNumber <= 8) {
      imageName = 'third_quarter.png';
      phaseLabel = 'Third Quarter';
    } else if (tithiNumber >= 9 && tithiNumber <= 14) {
      imageName = 'waning_crescent.png';
      phaseLabel = 'Waning Crescent';
    } else {
      imageName = 'new_moon.png';
      phaseLabel = 'New Moon (Amavasya)';
    }
  }

  return {
    paksha,
    tithiNumber,
    imagePath: `/images/moon-phases/${imageName}`,
    phaseLabel,
  };
}
