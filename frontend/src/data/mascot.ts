export type MascotPose = 'wave' | 'point' | 'celebrate' | 'calm' | 'thinking' | 'proud';

export interface MascotConfig {
  name: string;
  pose: MascotPose;
  size?: number;
}

/**
 * Returns SVG markup string for Ollie the Owl in 6 distinct friendly flat poses.
 * Flat colors only: solid friendly palette, no robot look.
 */
export function renderMascotSvg(pose: MascotPose = 'calm', size: number = 96): string {
  // Common palette
  const bodyTeal = '#0F8B8D';
  const bellyCream = '#FFF4D6';
  const beakAmber = '#FFB703';
  const eyeWhite = '#FFFFFF';
  const pupilCharcoal = '#1F1B16';

  let wingsMarkup = '';
  let eyesMarkup = '';
  let extraMarkup = '';

  if (pose === 'wave') {
    // Left wing resting, right wing raised waving
    wingsMarkup = `
      <path d="M 24 54 C 18 58 14 68 20 74 C 26 76 28 66 26 56 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <path d="M 74 52 C 84 40 92 36 94 44 C 92 52 82 56 74 60 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="94" cy="42" r="3" fill="${beakAmber}"/>
    `;
    eyesMarkup = `
      <circle cx="38" cy="40" r="10" fill="${eyeWhite}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="62" cy="40" r="10" fill="${eyeWhite}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="40" cy="40" r="5" fill="${pupilCharcoal}"/>
      <circle cx="64" cy="40" r="5" fill="${pupilCharcoal}"/>
      <circle cx="42" cy="38" r="2" fill="${eyeWhite}"/>
      <circle cx="66" cy="38" r="2" fill="${eyeWhite}"/>
    `;
  } else if (pose === 'point') {
    // Right wing extended pointing towards content
    wingsMarkup = `
      <path d="M 22 52 C 16 58 16 70 24 72 C 28 72 26 62 24 54 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <path d="M 74 54 L 96 64 L 88 72 L 72 64 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
    `;
    eyesMarkup = `
      <circle cx="38" cy="40" r="10" fill="${eyeWhite}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="62" cy="40" r="10" fill="${eyeWhite}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="42" cy="41" r="5" fill="${pupilCharcoal}"/>
      <circle cx="66" cy="41" r="5" fill="${pupilCharcoal}"/>
      <circle cx="44" cy="39" r="2" fill="${eyeWhite}"/>
      <circle cx="68" cy="39" r="2" fill="${eyeWhite}"/>
    `;
    extraMarkup = `
      <polygon points="98,64 93,60 93,68" fill="${beakAmber}"/>
    `;
  } else if (pose === 'celebrate') {
    // Both wings raised upward in joy with celebration stars
    wingsMarkup = `
      <path d="M 24 48 C 12 36 6 42 12 50 C 18 56 24 56 26 54 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <path d="M 76 48 C 88 36 94 42 88 50 C 82 56 76 56 74 54 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
    `;
    eyesMarkup = `
      <path d="M 28 42 Q 38 32 48 42" stroke="${pupilCharcoal}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 52 42 Q 62 32 72 42" stroke="${pupilCharcoal}" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
    extraMarkup = `
      <polygon points="16,22 18,28 24,28 19,32 21,38 16,34 11,38 13,32 8,28 14,28" fill="${beakAmber}"/>
      <polygon points="84,22 86,28 92,28 87,32 89,38 84,34 79,38 81,32 76,28 82,28" fill="${beakAmber}"/>
    `;
  } else if (pose === 'thinking') {
    // Left wing down, right wing touching chin/beak, eyes looking up
    wingsMarkup = `
      <path d="M 24 54 C 18 60 18 70 24 74 C 28 74 28 64 26 54 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <path d="M 74 60 C 68 56 58 54 54 48 C 58 44 66 48 76 54 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
    `;
    eyesMarkup = `
      <circle cx="38" cy="38" r="10" fill="${eyeWhite}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="62" cy="38" r="10" fill="${eyeWhite}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="39" cy="34" r="5" fill="${pupilCharcoal}"/>
      <circle cx="63" cy="34" r="5" fill="${pupilCharcoal}"/>
      <circle cx="41" cy="32" r="2" fill="${eyeWhite}"/>
      <circle cx="65" cy="32" r="2" fill="${eyeWhite}"/>
    `;
    extraMarkup = `
      <circle cx="72" cy="24" r="3" fill="${beakAmber}"/>
      <circle cx="80" cy="18" r="5" fill="${beakAmber}"/>
    `;
  } else if (pose === 'proud') {
    // Wings on chest, happy eyes, proud puff
    wingsMarkup = `
      <path d="M 26 50 C 32 54 40 54 42 60 C 38 64 30 62 24 58 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <path d="M 74 50 C 68 54 60 54 58 60 C 62 64 70 62 76 58 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
    `;
    eyesMarkup = `
      <path d="M 30 40 Q 38 34 46 40" stroke="${pupilCharcoal}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M 54 40 Q 62 34 70 40" stroke="${pupilCharcoal}" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
    extraMarkup = `
      <polygon points="50,14 53,20 60,20 55,24 57,30 50,26 43,30 45,24 40,20 47,20" fill="${beakAmber}"/>
    `;
  } else {
    // Calm / idle pose: peaceful posture, patient listening
    wingsMarkup = `
      <path d="M 24 52 C 18 58 18 68 24 74 C 28 74 28 64 26 54 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <path d="M 76 52 C 82 58 82 68 76 74 C 72 74 72 64 74 54 Z" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
    `;
    eyesMarkup = `
      <circle cx="38" cy="40" r="10" fill="${eyeWhite}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="62" cy="40" r="10" fill="${eyeWhite}" stroke="${pupilCharcoal}" stroke-width="2"/>
      <circle cx="38" cy="40" r="5" fill="${pupilCharcoal}"/>
      <circle cx="62" cy="40" r="5" fill="${pupilCharcoal}"/>
      <circle cx="40" cy="38" r="2" fill="${eyeWhite}"/>
      <circle cx="64" cy="38" r="2" fill="${eyeWhite}"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" role="img" aria-label="Ollie the Owl friendly mascot">
    <!-- Ear tufts -->
    <polygon points="26,24 34,32 24,36" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>
    <polygon points="74,24 66,32 76,36" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>

    <!-- Main round body -->
    <ellipse cx="50" cy="54" rx="30" ry="34" fill="${bodyTeal}" stroke="${pupilCharcoal}" stroke-width="2"/>

    <!-- Belly patch -->
    <ellipse cx="50" cy="62" rx="18" ry="20" fill="${bellyCream}"/>

    <!-- Wings -->
    ${wingsMarkup}

    <!-- Eyes -->
    ${eyesMarkup}

    <!-- Beak -->
    <polygon points="50,44 44,52 56,52" fill="${beakAmber}" stroke="${pupilCharcoal}" stroke-width="1.5"/>

    <!-- Feet -->
    <ellipse cx="42" cy="88" rx="5" ry="3" fill="${beakAmber}" stroke="${pupilCharcoal}" stroke-width="1.5"/>
    <ellipse cx="58" cy="88" rx="5" ry="3" fill="${beakAmber}" stroke="${pupilCharcoal}" stroke-width="1.5"/>

    <!-- Extra stars or pointers -->
    ${extraMarkup}
  </svg>`;
}
