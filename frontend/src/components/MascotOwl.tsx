import React from 'react';

interface MascotOwlProps {
  emotion?: 'happy' | 'encouraging' | 'sad' | 'celebrating';
  className?: string;
  width?: number;
  height?: number;
}

export const MascotOwl: React.FC<MascotOwlProps> = ({
  emotion = 'happy',
  className = '',
  width = 120,
  height = 120,
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block filter drop-shadow-md transition-transform duration-300 ${className}`}
    >
      {/* Outer Feather / Body Shadow Base */}
      <ellipse cx="80" cy="142" rx="45" ry="10" fill="#000000" fillOpacity="0.12" />

      {/* Feet */}
      <path d="M58 135 L50 148 M58 135 L58 150 M58 135 L66 147" stroke="#FF9600" strokeWidth="5" strokeLinecap="round" />
      <path d="M102 135 L94 148 M102 135 L102 150 M102 135 L110 147" stroke="#FF9600" strokeWidth="5" strokeLinecap="round" />

      {/* Main Body */}
      <path
        d="M80 20 C42 20 30 52 30 90 C30 125 48 138 80 138 C112 138 130 125 130 90 C130 52 118 20 80 20 Z"
        fill="#58CC02"
        stroke="#46A302"
        strokeWidth="4"
      />

      {/* Light Green Belly Patch */}
      <path
        d="M80 65 C60 65 52 82 52 108 C52 126 64 132 80 132 C96 132 108 126 108 108 C108 82 100 65 80 65 Z"
        fill="#89E219"
      />

      {/* Belly Feather V-shapes */}
      <path d="M72 88 L80 94 L88 88" stroke="#58CC02" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M68 106 L80 114 L92 106" stroke="#58CC02" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

      {/* Left Wing */}
      {emotion === 'celebrating' ? (
        <path
          d="M32 80 C18 60 10 38 25 35 C38 32 40 60 38 78 Z"
          fill="#58CC02"
          stroke="#46A302"
          strokeWidth="3"
        />
      ) : (
        <path
          d="M32 75 C15 82 12 105 24 112 C34 118 40 98 35 80 Z"
          fill="#58CC02"
          stroke="#46A302"
          strokeWidth="3"
        />
      )}

      {/* Right Wing */}
      {emotion === 'celebrating' || emotion === 'encouraging' ? (
        <path
          d="M128 80 C142 60 150 38 135 35 C122 32 120 60 122 78 Z"
          fill="#58CC02"
          stroke="#46A302"
          strokeWidth="3"
        />
      ) : (
        <path
          d="M128 75 C145 82 148 105 136 112 C126 118 120 98 125 80 Z"
          fill="#58CC02"
          stroke="#46A302"
          strokeWidth="3"
        />
      )}

      {/* Face / Eye Circles */}
      <circle cx="58" cy="55" r="21" fill="#FFFFFF" stroke="#3C3C3C" strokeWidth="3" />
      <circle cx="102" cy="55" r="21" fill="#FFFFFF" stroke="#3C3C3C" strokeWidth="3" />

      {/* Eye Pupils & Expressions */}
      {emotion === 'sad' ? (
        <>
          {/* Teary / Sad Eyes */}
          <circle cx="58" cy="58" r="9" fill="#2B2B2B" />
          <circle cx="102" cy="58" r="9" fill="#2B2B2B" />
          <circle cx="55" cy="55" r="3" fill="#FFFFFF" />
          <circle cx="99" cy="55" r="3" fill="#FFFFFF" />
          {/* Tear Drop */}
          <path d="M42 66 C40 74 46 76 46 70 C46 66 42 64 42 66 Z" fill="#1CB0F6" />
        </>
      ) : emotion === 'encouraging' ? (
        <>
          {/* Wink on right, excited pupil on left */}
          <circle cx="58" cy="55" r="10" fill="#2B2B2B" />
          <circle cx="55" cy="51" r="4" fill="#FFFFFF" />
          <path d="M92 55 Q102 46 112 55" stroke="#2B2B2B" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          {/* Happy Big Pupils */}
          <circle cx="58" cy="55" r="10" fill="#2B2B2B" />
          <circle cx="102" cy="55" r="10" fill="#2B2B2B" />
          <circle cx="55" cy="51" r="4" fill="#FFFFFF" />
          <circle cx="99" cy="51" r="4" fill="#FFFFFF" />
        </>
      )}

      {/* Beak */}
      <path
        d="M80 62 L70 72 Q80 82 90 72 Z"
        fill="#FF9600"
        stroke="#E58700"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Party Hat for Celebration */}
      {emotion === 'celebrating' && (
        <g transform="translate(62, -2)">
          <path d="M18 25 L35 0 L0 18 Z" fill="#FFC800" stroke="#FF9600" strokeWidth="2" />
          <circle cx="35" cy="0" r="5" fill="#FF4B4B" />
        </g>
      )}
    </svg>
  );
};
