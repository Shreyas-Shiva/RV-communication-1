import React from 'react';

interface PictogramProps {
  name: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackLabel?: string;
}

export const Pictogram: React.FC<PictogramProps> = ({
  name,
  alt,
  size = 72,
  className = '',
  fallbackLabel
}) => {
  const charcoal = '#1F1B16';
  const teal = '#0F8B8D';
  const amber = '#FFB703';
  const green = '#2E9E5B';
  const red = '#D62828';
  const white = '#FFFFFF';
  const blue = '#4EA8DE';

  const renderIconContent = () => {
    switch (name) {
      case 'pizza':
        return (
          <g>
            <path d="M 12 24 Q 50 16 88 24 L 50 86 Z" fill="#F4A261" stroke={charcoal} strokeWidth="3" strokeLinejoin="round" />
            <path d="M 12 24 Q 50 16 88 24" fill="none" stroke="#E76F51" strokeWidth="7" strokeLinecap="round" />
            <circle cx="44" cy="38" r="6" fill={red} stroke={charcoal} strokeWidth="2" />
            <circle cx="58" cy="52" r="5" fill={red} stroke={charcoal} strokeWidth="2" />
            <circle cx="40" cy="58" r="4.5" fill={red} stroke={charcoal} strokeWidth="2" />
            <circle cx="50" cy="34" r="2" fill={amber} />
            <circle cx="34" cy="46" r="2" fill={amber} />
          </g>
        );

      case 'water':
        return (
          <g>
            <path d="M 28 20 L 34 82 C 34 86 66 86 66 82 L 72 20 Z" fill="#E0F2FE" stroke={charcoal} strokeWidth="3" />
            <path d="M 32 44 Q 50 40 68 44 L 65 80 Q 50 84 35 80 Z" fill={blue} />
            <ellipse cx="50" cy="20" rx="22" ry="6" fill="#BAE6FD" stroke={charcoal} strokeWidth="2.5" />
            <ellipse cx="50" cy="44" rx="18" ry="4" fill="#7DD3FC" />
          </g>
        );

      case 'rice':
        return (
          <g>
            <path d="M 20 50 Q 50 90 80 50 Z" fill="#F3EFE6" stroke={charcoal} strokeWidth="3" />
            <ellipse cx="50" cy="48" rx="30" ry="12" fill={white} stroke={charcoal} strokeWidth="2.5" />
            <ellipse cx="50" cy="44" rx="22" ry="8" fill="#FBF9F5" />
            <rect x="42" y="82" width="16" height="6" rx="2" fill="#D3C9BE" stroke={charcoal} strokeWidth="2" />
            <path d="M 38 32 Q 40 22 38 16" stroke="#A8A29E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 50 30 Q 52 20 50 14" stroke="#A8A29E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 62 32 Q 64 22 62 16" stroke="#A8A29E" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'apple':
        return (
          <g>
            <path d="M 50 32 C 34 16 16 32 20 60 C 24 82 46 88 50 82 C 54 88 76 82 80 60 C 84 32 66 16 50 32 Z" fill={red} stroke={charcoal} strokeWidth="3" />
            <path d="M 50 32 C 48 20 54 14 60 12" stroke="#5D4037" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 56 18 Q 72 16 68 28 Z" fill={green} stroke={charcoal} strokeWidth="2" />
            <ellipse cx="34" cy="44" rx="4" ry="8" fill="#FF8A80" transform="rotate(-20 34 44)" />
          </g>
        );

      case 'milk':
        return (
          <g>
            <path d="M 34 24 L 40 14 L 60 14 L 66 24 L 66 84 L 34 84 Z" fill={white} stroke={charcoal} strokeWidth="3" />
            <rect x="34" y="44" width="32" height="24" fill="#BAE6FD" />
            <text x="50" y="60" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#0369A1">MILK</text>
            <line x1="34" y1="24" x2="66" y2="24" stroke={charcoal} strokeWidth="2.5" />
          </g>
        );

      case 'bread':
        return (
          <g>
            <path d="M 20 44 C 20 22 80 22 80 44 L 76 74 C 76 80 24 80 24 74 Z" fill="#DDA15E" stroke={charcoal} strokeWidth="3" />
            <path d="M 26 44 C 26 28 74 28 74 44 Z" fill="#BC6C25" />
            <line x1="38" y1="36" x2="44" y2="52" stroke="#FEFAE0" strokeWidth="3" strokeLinecap="round" />
            <line x1="52" y1="36" x2="58" y2="52" stroke="#FEFAE0" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'tea':
        return (
          <g>
            <path d="M 22 36 L 26 74 C 26 80 70 80 70 74 L 74 36 Z" fill="#FEF3C7" stroke={charcoal} strokeWidth="3" />
            <path d="M 72 44 Q 88 44 88 56 Q 88 68 70 68" fill="none" stroke={charcoal} strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="48" cy="82" rx="34" ry="6" fill="#E2E8F0" stroke={charcoal} strokeWidth="2.5" />
            <ellipse cx="48" cy="40" rx="22" ry="6" fill="#B45309" />
            <path d="M 42 28 Q 44 20 42 14" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 52 28 Q 54 18 52 12" stroke="#94A3B8" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'snack':
        return (
          <g>
            <path d="M 18 48 Q 50 86 82 48 Z" fill="#FDE68A" stroke={charcoal} strokeWidth="3" />
            <circle cx="38" cy="42" r="10" fill={amber} stroke={charcoal} strokeWidth="2" />
            <circle cx="56" cy="38" r="8" fill="#F97316" stroke={charcoal} strokeWidth="2" />
            <circle cx="48" cy="46" r="6" fill={green} stroke={charcoal} strokeWidth="2" />
          </g>
        );

      case 'bathroom':
        return (
          <g>
            <rect x="22" y="16" width="56" height="70" rx="4" fill="#E0F2FE" stroke={charcoal} strokeWidth="3" />
            <circle cx="42" cy="36" r="6" fill={charcoal} />
            <path d="M 34 48 L 50 48 L 46 68 L 38 68 Z" fill={charcoal} />
            <circle cx="60" cy="36" r="6" fill={charcoal} />
            <path d="M 54 48 L 66 48 L 68 62 L 64 68 L 56 68 Z" fill={charcoal} />
            <line x1="51" y1="26" x2="51" y2="76" stroke="#94A3B8" strokeWidth="2" />
          </g>
        );

      case 'wash_hands':
        return (
          <g>
            <path d="M 48 14 L 52 14 L 52 26 L 48 26 Z" fill="#64748B" stroke={charcoal} strokeWidth="2" />
            <path d="M 40 26 L 60 26 L 56 32 L 44 32 Z" fill="#94A3B8" stroke={charcoal} strokeWidth="2" />
            <path d="M 50 36 C 47 40 44 46 50 50 C 56 46 53 40 50 36 Z" fill={blue} />
            <path d="M 26 62 Q 40 54 54 62 L 62 76 Q 44 82 28 72 Z" fill="#FBCFE8" stroke={charcoal} strokeWidth="2.5" />
            <circle cx="34" cy="50" r="5" fill="#E0F2FE" stroke={blue} strokeWidth="1.5" />
            <circle cx="66" cy="54" r="7" fill="#E0F2FE" stroke={blue} strokeWidth="1.5" />
          </g>
        );

      case 'brush_teeth':
        return (
          <g>
            <rect x="18" y="44" width="46" height="12" rx="4" fill={teal} stroke={charcoal} strokeWidth="2.5" />
            <rect x="62" y="40" width="22" height="16" rx="2" fill={white} stroke={charcoal} strokeWidth="2.5" />
            <line x1="68" y1="36" x2="68" y2="40" stroke={blue} strokeWidth="2.5" />
            <line x1="74" y1="36" x2="74" y2="40" stroke={blue} strokeWidth="2.5" />
            <line x1="80" y1="36" x2="80" y2="40" stroke={blue} strokeWidth="2.5" />
          </g>
        );

      case 'shower':
        return (
          <g>
            <path d="M 24 16 L 50 16 L 50 34" fill="none" stroke={charcoal} strokeWidth="4" strokeLinecap="round" />
            <path d="M 36 34 L 64 34 L 56 46 L 44 46 Z" fill="#94A3B8" stroke={charcoal} strokeWidth="2.5" />
            <line x1="42" y1="52" x2="38" y2="76" stroke={blue} strokeWidth="2.5" strokeDasharray="3 4" />
            <line x1="50" y1="52" x2="50" y2="80" stroke={blue} strokeWidth="2.5" strokeDasharray="3 4" />
            <line x1="58" y1="52" x2="62" y2="76" stroke={blue} strokeWidth="2.5" strokeDasharray="3 4" />
          </g>
        );

      case 'medicine':
        return (
          <g>
            <rect x="22" y="38" width="28" height="42" rx="4" fill="#FEE2E2" stroke={charcoal} strokeWidth="2.5" />
            <rect x="28" y="28" width="16" height="10" fill={white} stroke={charcoal} strokeWidth="2" />
            <rect x="33" y="50" width="6" height="18" fill={red} />
            <rect x="27" y="56" width="18" height="6" fill={red} />
            <ellipse cx="64" cy="58" rx="14" ry="24" fill={amber} stroke={charcoal} strokeWidth="2.5" transform="rotate(35 64 58)" />
            <line x1="52" y1="48" x2="76" y2="68" stroke={white} strokeWidth="3" />
          </g>
        );

      case 'doctor':
      case 'hospital':
        return (
          <g>
            <circle cx="50" cy="34" r="16" fill="#FDE68A" stroke={charcoal} strokeWidth="2.5" />
            <path d="M 22 78 C 22 56 34 52 50 52 C 66 52 78 56 78 78 Z" fill={white} stroke={charcoal} strokeWidth="2.5" />
            <rect x="46" y="58" width="8" height="16" fill={red} />
            <rect x="42" y="62" width="16" height="8" fill={red} />
            <path d="M 38 48 C 38 64 62 64 62 48" fill="none" stroke={teal} strokeWidth="3" />
            <circle cx="50" cy="66" r="4" fill={teal} />
          </g>
        );

      case 'pain':
        return (
          <g>
            <polygon points="54,12 28,50 48,50 42,88 74,44 52,44" fill={amber} stroke={charcoal} strokeWidth="3" strokeLinejoin="round" />
            <circle cx="28" cy="28" r="4" fill={red} />
            <circle cx="74" cy="30" r="4" fill={red} />
            <circle cx="26" cy="70" r="3.5" fill={red} />
          </g>
        );

      case 'fever':
        return (
          <g>
            <circle cx="50" cy="38" r="22" fill="#FDE68A" stroke={charcoal} strokeWidth="2.5" />
            <path d="M 40 44 Q 50 36 60 44" stroke={charcoal} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="42" cy="34" r="3" fill={charcoal} />
            <circle cx="58" cy="34" r="3" fill={charcoal} />
            <rect x="52" y="44" width="30" height="8" rx="2" fill={white} stroke={charcoal} strokeWidth="2" transform="rotate(-15 52 44)" />
            <rect x="68" y="42" width="10" height="6" fill={red} transform="rotate(-15 52 44)" />
          </g>
        );

      case 'tired':
        return (
          <g>
            <circle cx="50" cy="50" r="28" fill="#FDE68A" stroke={charcoal} strokeWidth="3" />
            <path d="M 34 44 Q 40 48 46 44" stroke={charcoal} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 54 44 Q 60 48 66 44" stroke={charcoal} strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse cx="50" cy="62" rx="8" ry="10" fill="#78350F" />
            <text x="76" y="32" fontSize="16" fontWeight="bold" fill={teal}>Z</text>
            <text x="84" y="22" fontSize="12" fontWeight="bold" fill={teal}>z</text>
          </g>
        );

      case 'sick':
        return (
          <g>
            <circle cx="50" cy="50" r="28" fill="#BBF7D0" stroke={charcoal} strokeWidth="3" />
            <circle cx="40" cy="42" r="3.5" fill={charcoal} />
            <circle cx="60" cy="42" r="3.5" fill={charcoal} />
            <path d="M 40 64 Q 50 56 60 64" stroke={charcoal} strokeWidth="3" fill="none" strokeLinecap="round" />
            <rect x="36" y="24" width="28" height="10" rx="3" fill="#BFDBFE" stroke={charcoal} strokeWidth="2" />
          </g>
        );

      case 'emergency_help':
      case 'ambulance':
        return (
          <g>
            <rect x="14" y="38" width="56" height="34" rx="4" fill={white} stroke={charcoal} strokeWidth="3" />
            <path d="M 70 48 L 84 56 L 84 72 L 70 72 Z" fill="#FEE2E2" stroke={charcoal} strokeWidth="2.5" />
            <rect x="36" y="46" width="12" height="18" fill={red} />
            <rect x="33" y="49" width="18" height="12" fill={red} />
            <circle cx="28" cy="74" r="7" fill={charcoal} />
            <circle cx="68" cy="74" r="7" fill={charcoal} />
            <polygon points="46,26 50,34 54,34 50,38 52,44 46,40 40,44 42,38 38,34 42,34" fill={amber} />
          </g>
        );

      case 'lost':
        return (
          <g>
            <circle cx="50" cy="50" r="32" fill="#FEF3C7" stroke={charcoal} strokeWidth="3" />
            <path d="M 50 24 L 56 46 L 50 42 L 44 46 Z" fill={red} stroke={charcoal} strokeWidth="1.5" />
            <path d="M 50 76 L 56 54 L 50 58 L 44 54 Z" fill="#64748B" stroke={charcoal} strokeWidth="1.5" />
            <circle cx="50" cy="50" r="4" fill={charcoal} />
            <text x="50" y="20" fontSize="11" fontWeight="bold" textAnchor="middle" fill={charcoal}>N</text>
          </g>
        );

      case 'phone_call':
        return (
          <g>
            <rect x="30" y="16" width="40" height="68" rx="8" fill="#F1F5F9" stroke={charcoal} strokeWidth="3" />
            <rect x="34" y="24" width="32" height="48" fill={teal} />
            <circle cx="50" cy="78" r="3" fill={charcoal} />
            <path d="M 42 40 C 42 54 50 58 58 58" fill="none" stroke={white} strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      case 'happy':
        return (
          <g>
            <circle cx="50" cy="50" r="30" fill="#FEF08A" stroke={charcoal} strokeWidth="3" />
            <circle cx="38" cy="42" r="4" fill={charcoal} />
            <circle cx="62" cy="42" r="4" fill={charcoal} />
            <path d="M 34 56 Q 50 74 66 56" stroke={charcoal} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'sad':
        return (
          <g>
            <circle cx="50" cy="50" r="30" fill="#BFDBFE" stroke={charcoal} strokeWidth="3" />
            <circle cx="38" cy="42" r="4" fill={charcoal} />
            <circle cx="62" cy="42" r="4" fill={charcoal} />
            <path d="M 36 66 Q 50 52 64 66" stroke={charcoal} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <ellipse cx="68" cy="54" rx="2.5" ry="4" fill={blue} />
          </g>
        );

      case 'angry':
        return (
          <g>
            <circle cx="50" cy="50" r="30" fill="#FECACA" stroke={charcoal} strokeWidth="3" />
            <line x1="32" y1="36" x2="44" y2="44" stroke={charcoal} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="68" y1="36" x2="56" y2="44" stroke={charcoal} strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="38" cy="46" r="3.5" fill={charcoal} />
            <circle cx="62" cy="46" r="3.5" fill={charcoal} />
            <path d="M 36 64 Q 50 56 64 64" stroke={charcoal} strokeWidth="3.5" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'calm':
        return (
          <g>
            <circle cx="50" cy="50" r="30" fill="#BBF7D0" stroke={charcoal} strokeWidth="3" />
            <path d="M 32 44 Q 40 40 46 44" stroke={charcoal} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 54 44 Q 62 40 68 44" stroke={charcoal} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 40 60 Q 50 66 60 60" stroke={charcoal} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'scared':
        return (
          <g>
            <circle cx="50" cy="50" r="30" fill="#DCEBFA" stroke="#2F78BD" strokeWidth="3" />
            <circle cx="38" cy="40" r="6" fill={white} stroke={charcoal} strokeWidth="2" />
            <circle cx="62" cy="40" r="6" fill={white} stroke={charcoal} strokeWidth="2" />
            <circle cx="38" cy="40" r="2.5" fill={charcoal} />
            <circle cx="62" cy="40" r="2.5" fill={charcoal} />
            <ellipse cx="50" cy="64" rx="8" ry="10" fill={charcoal} />
          </g>
        );

      case 'home':
      case 'home_place':
        return (
          <g>
            <polygon points="50,16 16,44 24,44 24,80 76,80 76,44 84,44" fill="#FEF3C7" stroke={charcoal} strokeWidth="3" strokeLinejoin="round" />
            <polygon points="50,16 14,44 86,44" fill={red} stroke={charcoal} strokeWidth="3" strokeLinejoin="round" />
            <rect x="42" y="54" width="16" height="26" fill="#92400E" stroke={charcoal} strokeWidth="2" />
            <circle cx="54" cy="68" r="2" fill={amber} />
            <rect x="28" y="50" width="10" height="12" fill="#BAE6FD" stroke={charcoal} strokeWidth="1.5" />
            <rect x="62" y="50" width="10" height="12" fill="#BAE6FD" stroke={charcoal} strokeWidth="1.5" />
          </g>
        );

      case 'bed':
        return (
          <g>
            <rect x="18" y="44" width="64" height="24" rx="4" fill="#BAE6FD" stroke={charcoal} strokeWidth="3" />
            <rect x="14" y="32" width="10" height="48" rx="2" fill="#92400E" stroke={charcoal} strokeWidth="2.5" />
            <rect x="76" y="44" width="8" height="36" rx="2" fill="#92400E" stroke={charcoal} strokeWidth="2.5" />
            <rect x="24" y="46" width="18" height="12" rx="3" fill={white} stroke={charcoal} strokeWidth="2" />
            <path d="M 40 44 L 82 44 L 82 68 L 40 68 Z" fill={teal} stroke={charcoal} strokeWidth="2" />
          </g>
        );

      case 'moon':
        return (
          <g>
            <path d="M 58 18 C 34 22 24 50 38 72 C 48 86 68 86 80 74 C 58 74 46 54 58 18 Z" fill={amber} stroke={charcoal} strokeWidth="3" />
            <polygon points="76,24 78,30 84,30 79,34 81,40 76,36 71,40 73,34 68,30 74,30" fill={amber} />
            <polygon points="26,28 27,32 31,32 28,34 29,38 26,35 23,38 24,34 21,32 25,32" fill={amber} />
          </g>
        );

      case 'mom':
      case 'dad':
      case 'friend':
        return (
          <g>
            <circle cx="50" cy="30" r="16" fill="#FDE68A" stroke={charcoal} strokeWidth="2.5" />
            <path d="M 24 78 C 24 56 36 50 50 50 C 64 50 76 56 76 78 Z" fill={teal} stroke={charcoal} strokeWidth="2.5" />
            <circle cx="44" cy="28" r="2.5" fill={charcoal} />
            <circle cx="56" cy="28" r="2.5" fill={charcoal} />
            <path d="M 46 36 Q 50 40 54 36" stroke={charcoal} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 34 24 Q 50 14 66 24" stroke="#78350F" strokeWidth="4" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'book':
        return (
          <g>
            <path d="M 50 28 Q 28 20 16 28 L 16 72 Q 28 64 50 72 Q 72 64 84 72 L 84 28 Q 72 20 50 28 Z" fill="#FEF3C7" stroke={charcoal} strokeWidth="3" />
            <line x1="50" y1="28" x2="50" y2="72" stroke={charcoal} strokeWidth="3" />
            <line x1="24" y1="38" x2="42" y2="38" stroke={teal} strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="46" x2="42" y2="46" stroke={teal} strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="38" x2="76" y2="38" stroke={teal} strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="46" x2="76" y2="46" stroke={teal} strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      case 'pencil':
        return (
          <g transform="rotate(45 50 50)">
            <rect x="42" y="16" width="16" height="50" fill={amber} stroke={charcoal} strokeWidth="2.5" />
            <polygon points="42,66 58,66 50,84" fill="#FDE68A" stroke={charcoal} strokeWidth="2.5" />
            <polygon points="48,78 52,78 50,84" fill={charcoal} />
            <rect x="42" y="12" width="16" height="8" fill="#F472B6" stroke={charcoal} strokeWidth="2" />
          </g>
        );

      case 'school':
      case 'school_place':
      case 'college':
      case 'college_place':
      case 'building':
      case 'public_place_card':
        return (
          <g>
            <polygon points="50,14 18,36 82,36" fill="#991B1B" stroke={charcoal} strokeWidth="3" strokeLinejoin="round" />
            <rect x="24" y="36" width="52" height="46" fill="#F8FAFC" stroke={charcoal} strokeWidth="3" />
            <line x1="36" y1="36" x2="36" y2="82" stroke={charcoal} strokeWidth="2.5" />
            <line x1="64" y1="36" x2="64" y2="82" stroke={charcoal} strokeWidth="2.5" />
            <rect x="44" y="58" width="12" height="24" fill={teal} stroke={charcoal} strokeWidth="2" />
            <circle cx="50" cy="28" r="4" fill={amber} />
          </g>
        );

      case 'ball':
        return (
          <g>
            <circle cx="50" cy="50" r="30" fill={amber} stroke={charcoal} strokeWidth="3" />
            <path d="M 50 20 C 34 32 34 68 50 80" fill="none" stroke={charcoal} strokeWidth="2.5" />
            <path d="M 50 20 C 66 32 66 68 50 80" fill="none" stroke={charcoal} strokeWidth="2.5" />
            <line x1="20" y1="50" x2="80" y2="50" stroke={charcoal} strokeWidth="2.5" />
          </g>
        );

      case 'playground':
      case 'playground_place':
        return (
          <g>
            <line x1="20" y1="78" x2="44" y2="24" stroke={charcoal} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="68" y1="78" x2="44" y2="24" stroke={charcoal} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 44 24 Q 72 40 84 78" fill="none" stroke={red} strokeWidth="5" strokeLinecap="round" />
            <line x1="26" y1="64" x2="36" y2="64" stroke={amber} strokeWidth="3" />
            <line x1="32" y1="48" x2="40" y2="48" stroke={amber} strokeWidth="3" />
          </g>
        );

      case 'bus':
        return (
          <g>
            <rect x="18" y="24" width="64" height="46" rx="6" fill={amber} stroke={charcoal} strokeWidth="3" />
            <rect x="24" y="30" width="16" height="16" fill="#BAE6FD" stroke={charcoal} strokeWidth="2" />
            <rect x="44" y="30" width="16" height="16" fill="#BAE6FD" stroke={charcoal} strokeWidth="2" />
            <rect x="64" y="30" width="12" height="24" fill="#BAE6FD" stroke={charcoal} strokeWidth="2" />
            <circle cx="34" cy="70" r="7" fill={charcoal} />
            <circle cx="66" cy="70" r="7" fill={charcoal} />
            <line x1="18" y1="54" x2="82" y2="54" stroke={charcoal} strokeWidth="2" />
          </g>
        );

      case 'car':
        return (
          <g>
            <path d="M 18 56 L 26 42 Q 36 34 50 34 L 64 34 L 76 46 L 82 56 Z" fill={blue} stroke={charcoal} strokeWidth="3" />
            <rect x="14" y="54" width="72" height="18" rx="4" fill={blue} stroke={charcoal} strokeWidth="3" />
            <circle cx="32" cy="72" r="7" fill={charcoal} />
            <circle cx="68" cy="72" r="7" fill={charcoal} />
            <rect x="34" y="38" width="16" height="12" fill="#E0F2FE" stroke={charcoal} strokeWidth="1.5" />
            <rect x="54" y="38" width="16" height="12" fill="#E0F2FE" stroke={charcoal} strokeWidth="1.5" />
          </g>
        );

      case 'wave_hand':
        return (
          <g>
            <path d="M 40 28 L 40 50 M 46 22 L 46 50 M 52 24 L 52 50 M 58 30 L 58 50 M 34 40 L 34 56 Q 34 76 50 76 Q 66 76 66 56 L 66 48" stroke={charcoal} strokeWidth="3.5" fill="#FDE68A" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 72 26 Q 80 34 80 44" fill="none" stroke={teal} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 78 20 Q 88 30 88 44" fill="none" stroke={teal} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );

      case 'thank_you':
        return (
          <g>
            <path d="M 50 68 C 30 52 18 40 18 28 C 18 18 28 12 36 16 C 44 20 50 28 50 28 C 50 28 56 20 64 16 C 72 12 82 18 82 28 C 82 40 70 52 50 68 Z" fill="#F43F5E" stroke={charcoal} strokeWidth="3" strokeLinejoin="round" />
            <path d="M 32 78 L 46 64 L 54 64 L 68 78 Z" fill="#FDE68A" stroke={charcoal} strokeWidth="2.5" />
          </g>
        );

      case 'please':
        return (
          <g>
            <path d="M 38 74 L 46 44 L 50 44 L 50 74 Z" fill="#FDE68A" stroke={charcoal} strokeWidth="2.5" />
            <path d="M 62 74 L 54 44 L 50 44 L 50 74 Z" fill="#FDE68A" stroke={charcoal} strokeWidth="2.5" />
            <ellipse cx="50" cy="38" rx="6" ry="8" fill={amber} stroke={charcoal} strokeWidth="2" />
          </g>
        );

      case 'check_yes':
      case 'yes_card':
      case 'yes':
        return (
          <g>
            <circle cx="50" cy="50" r="32" fill="#DCFCE7" stroke={green} strokeWidth="3" />
            <polyline points="32,52 44,64 68,36" fill="none" stroke={green} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        );

      case 'cross_no':
      case 'no_card':
      case 'no':
        return (
          <g>
            <circle cx="50" cy="50" r="32" fill="#FEE2E2" stroke={red} strokeWidth="3" />
            <line x1="34" y1="34" x2="66" y2="66" stroke={red} strokeWidth="6" strokeLinecap="round" />
            <line x1="66" y1="34" x2="34" y2="66" stroke={red} strokeWidth="6" strokeLinecap="round" />
          </g>
        );

      case 'plus_more':
      case 'more_card':
      case 'more':
        return (
          <g>
            <circle cx="50" cy="50" r="32" fill="#E0F2FE" stroke={blue} strokeWidth="3" />
            <line x1="50" y1="32" x2="50" y2="68" stroke={blue} strokeWidth="6" strokeLinecap="round" />
            <line x1="32" y1="50" x2="68" y2="50" stroke={blue} strokeWidth="6" strokeLinecap="round" />
          </g>
        );

      case 'stop_sign':
      case 'stop_card':
      case 'stop':
        return (
          <g>
            <polygon points="32,16 68,16 84,32 84,68 68,84 32,84 16,68 16,32" fill={red} stroke={charcoal} strokeWidth="3" />
            <text x="50" y="56" fontSize="16" fontWeight="900" textAnchor="middle" fill={white} letterSpacing="1">STOP</text>
          </g>
        );

      case 'briefcase':
      case 'work_place':
      case 'work':
        return (
          <g>
            <rect x="20" y="34" width="60" height="44" rx="4" fill="#94A3B8" stroke={charcoal} strokeWidth="3" />
            <path d="M 38 34 L 38 22 L 62 22 L 62 34" fill="none" stroke={charcoal} strokeWidth="3" />
            <line x1="20" y1="54" x2="80" y2="54" stroke={charcoal} strokeWidth="2.5" />
            <rect x="46" y="50" width="8" height="8" rx="1" fill={amber} stroke={charcoal} strokeWidth="1.5" />
          </g>
        );

      case 'meeting':
        return (
          <g>
            <ellipse cx="50" cy="54" rx="32" ry="16" fill="#E2E8F0" stroke={charcoal} strokeWidth="2.5" />
            <circle cx="50" cy="24" r="8" fill={teal} stroke={charcoal} strokeWidth="2" />
            <circle cx="24" cy="50" r="7" fill={teal} stroke={charcoal} strokeWidth="2" />
            <circle cx="76" cy="50" r="7" fill={teal} stroke={charcoal} strokeWidth="2" />
          </g>
        );

      case 'cart':
      case 'shopping_card':
      case 'shop':
        return (
          <g>
            <polyline points="18,24 28,24 40,60 74,60 82,34 32,34" fill="#F8FAFC" stroke={charcoal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="44" cy="72" r="5" fill={charcoal} />
            <circle cx="70" cy="72" r="5" fill={charcoal} />
          </g>
        );

      default: {
        const cleanLabel = fallbackLabel || (alt ? alt.split(' ')[0] : '');
        const safeText = cleanLabel.replace(/_/g, ' ').slice(0, 12);
        return (
          <g>
            <rect x="12" y="12" width="76" height="76" rx="12" fill="#F4F1DE" stroke={teal} strokeWidth="2.5" strokeDasharray="4 4" />
            <circle cx="50" cy="44" r="16" fill="#E2E8F0" stroke={charcoal} strokeWidth="2" />
            <text x="50" y="49" fontSize="14" fontWeight="bold" textAnchor="middle" fill={teal}>?</text>
            {safeText && !safeText.includes('_') && (
              <text x="50" y="74" fontSize="10" fontWeight="bold" textAnchor="middle" fill={charcoal}>
                {safeText}
              </text>
            )}
          </g>
        );
      }
    }
  };

  if (!alt || alt.trim() === '') {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 100 100"
          width={size}
          height={size}
          className="w-full h-full object-contain"
        >
          {renderIconContent()}
        </svg>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={alt}
    >
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="w-full h-full object-contain"
      >
        {renderIconContent()}
      </svg>
    </div>
  );
};
