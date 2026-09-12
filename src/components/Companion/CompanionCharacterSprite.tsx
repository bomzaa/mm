import React from 'react';
import { motion } from 'motion/react';
import { CompanionMood } from '../../lib/companionEvents';

interface CompanionCharacterSpriteProps {
  mood?: CompanionMood;
  direction?: 'left' | 'right';
  isMoving?: boolean;
  size?: number; // pixel width/height (default 68)
  className?: string;
}

export const CompanionCharacterSprite: React.FC<CompanionCharacterSpriteProps> = ({
  mood = 'idle',
  direction = 'right',
  isMoving = false,
  size = 68,
  className = '',
}) => {
  // Determine eye expression based on mood
  const isHappy = mood === 'happy' || mood === 'excited';
  const isSad = mood === 'sad';
  const isSleep = mood === 'sleep';
  const isRelax = mood === 'relax';

  return (
    <div
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        // Pixel-perfect crisp scaling
        imageRendering: 'pixelated',
      }}
    >
      {/* Floating Animated Particles depending on mood */}
      {isHappy && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], y: -22, scale: [0.6, 1.1, 0.8] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black text-rose-500 pointer-events-none z-30 flex items-center gap-1"
        >
          <span>💖</span>
          <span className="text-[10px] text-amber-400">✨</span>
        </motion.div>
      )}

      {mood === 'excited' && (
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.25, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
          className="absolute -top-2 -right-1 text-xs pointer-events-none z-30"
        >
          ⭐
        </motion.div>
      )}

      {isSleep && (
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            y: [-2, -18],
            x: [0, 6, 12],
            scale: [0.7, 1.1, 0.9],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 right-1 text-sky-500 font-extrabold text-[11px] select-none pointer-events-none z-30"
        >
          Zzz...
        </motion.div>
      )}

      {isSad && (
        <motion.div
          animate={{
            opacity: [0, 1, 0],
            y: [0, 10],
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeIn' }}
          className="absolute top-7 right-4 w-1.5 h-2 rounded-b-full bg-cyan-400 border border-cyan-600 shadow-xs pointer-events-none z-30"
        />
      )}

      {/* Main SVG Character Pixel Canvas */}
      <motion.svg
        viewBox="0 0 48 56"
        className="w-full h-full"
        style={{
          shapeRendering: 'crispEdges',
          transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          transformOrigin: '50% 50%',
        }}
        animate={
          mood === 'excited'
            ? { y: [0, -6, 0], rotate: [-2, 2, -2] }
            : isMoving
            ? { y: [0, -3, 0], rotate: [-1.5, 1.5, -1.5] }
            : isHappy
            ? { y: [0, -4, 0] }
            : isRelax
            ? { scale: [1, 1.03, 1] }
            : { y: [0, -1.5, 0] }
        }
        transition={{
          duration: mood === 'excited' ? 0.35 : isMoving ? 0.45 : isRelax ? 2.5 : 1.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <defs>
          {/* Flame Glow Filter */}
          <filter id="pixelFlameGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#f97316" floodOpacity="0.6" />
          </filter>
          {/* Green Cube Glow Filter */}
          <filter id="pixelCubeGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="1" floodColor="#10b981" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* ---------------------------------------------------- */}
        {/* 1. TAIL (Curling up behind on the right side) */}
        {/* ---------------------------------------------------- */}
        <g id="tail-layer">
          <motion.g
            animate={{ rotate: [-2, 4, -2] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '28px 42px' }}
          >
            {/* Tail Outline & Body */}
            <rect x="28" y="42" width="5" height="3" fill="#1c0e05" />
            <rect x="29" y="43" width="3" height="1" fill="#78350f" />

            <rect x="33" y="40" width="5" height="4" fill="#1c0e05" />
            <rect x="34" y="41" width="3" height="2" fill="#92400e" />

            <rect x="36" y="35" width="4" height="6" fill="#1c0e05" />
            <rect x="37" y="36" width="2" height="4" fill="#92400e" />

            <rect x="36" y="28" width="4" height="8" fill="#1c0e05" />
            <rect x="37" y="29" width="2" height="6" fill="#b45309" />

            <rect x="35" y="23" width="4" height="6" fill="#1c0e05" />
            <rect x="36" y="24" width="2" height="4" fill="#92400e" />

            {/* Tail Curl Tip */}
            <rect x="33" y="21" width="4" height="4" fill="#1c0e05" />
            <rect x="34" y="22" width="2" height="2" fill="#b45309" />
          </motion.g>
        </g>

        {/* ---------------------------------------------------- */}
        {/* 2. LEGS & FEET */}
        {/* ---------------------------------------------------- */}
        <g id="legs-layer">
          {/* Dark Slate Trousers */}
          {/* Left Leg */}
          <rect x="17" y="38" width="5" height="10" fill="#0f172a" />
          <rect x="18" y="39" width="3" height="8" fill="#1e293b" />
          <rect x="18" y="40" width="1" height="6" fill="#334155" />

          {/* Right Leg */}
          <rect x="24" y="38" width="5" height="10" fill="#0f172a" />
          <rect x="25" y="39" width="3" height="8" fill="#1e293b" />
          <rect x="25" y="40" width="1" height="6" fill="#334155" />

          {/* Crotch Inset */}
          <rect x="22" y="38" width="2" height="3" fill="#0f172a" />

          {/* Feet (Peach-Brown Monkey Feet with toes) */}
          <rect x="16" y="48" width="6" height="3" fill="#1c0e05" />
          <rect x="17" y="48" width="4" height="2" fill="#f8c29b" />
          <rect x="16" y="49" width="1" height="1" fill="#e59a68" />
          <rect x="18" y="49" width="1" height="1" fill="#e59a68" />
          <rect x="20" y="49" width="1" height="1" fill="#e59a68" />

          <rect x="24" y="48" width="6" height="3" fill="#1c0e05" />
          <rect x="25" y="48" width="4" height="2" fill="#f8c29b" />
          <rect x="25" y="49" width="1" height="1" fill="#e59a68" />
          <rect x="27" y="49" width="1" height="1" fill="#e59a68" />
          <rect x="29" y="49" width="1" height="1" fill="#e59a68" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 3. TORSO, JACKET, BELT & WALLET CHAIN */}
        {/* ---------------------------------------------------- */}
        <g id="torso-layer">
          {/* Inner Dark Shirt */}
          <rect x="19" y="27" width="8" height="8" fill="#0f172a" />
          <rect x="20" y="28" width="6" height="6" fill="#1e293b" />

          {/* Light Blue Jacket Body */}
          {/* Left Side of Jacket */}
          <rect x="14" y="25" width="6" height="11" fill="#0b314b" />
          <rect x="15" y="26" width="4" height="9" fill="#38bdf8" />
          <rect x="15" y="26" width="2" height="7" fill="#7dd3fc" />
          {/* Left Lapel */}
          <polygon points="19,26 21,30 19,33 17,29" fill="#bae6fd" />

          {/* Right Side of Jacket */}
          <rect x="26" y="25" width="6" height="11" fill="#0b314b" />
          <rect x="27" y="26" width="4" height="9" fill="#38bdf8" />
          <rect x="27" y="26" width="2" height="7" fill="#7dd3fc" />
          {/* Right Lapel */}
          <polygon points="27,26 25,30 27,33 29,29" fill="#bae6fd" />

          {/* Jacket Collar V-Neck Neckline */}
          <rect x="21" y="24" width="4" height="4" fill="#f8c29b" />
          <rect x="22" y="24" width="2" height="2" fill="#fde68a" />

          {/* Belt with Rectangular Silver Buckle */}
          <rect x="16" y="35" width="14" height="3" fill="#0f172a" />
          <rect x="20" y="35" width="5" height="3" fill="#e2e8f0" />
          <rect x="21" y="36" width="3" height="1" fill="#94a3b8" />

          {/* Silver Chain on the right hip */}
          <rect x="26" y="37" width="1" height="1" fill="#e2e8f0" />
          <rect x="27" y="38" width="1" height="1" fill="#cbd5e1" />
          <rect x="28" y="39" width="1" height="1" fill="#94a3b8" />
          <rect x="29" y="40" width="1" height="1" fill="#cbd5e1" />
        </g>

        {/* ---------------------------------------------------- */}
        {/* 4. LEFT ARM & TORCH WITH FLAME (Viewer's Right) */}
        {/* ---------------------------------------------------- */}
        <g id="torch-arm-layer">
          {/* Light Blue Sleeve */}
          <rect x="30" y="26" width="5" height="5" fill="#0b314b" />
          <rect x="31" y="27" width="3" height="3" fill="#7dd3fc" />

          <rect x="33" y="28" width="5" height="6" fill="#0b314b" />
          <rect x="34" y="29" width="3" height="4" fill="#38bdf8" />

          {/* Hand holding Torch */}
          <rect x="35" y="24" width="4" height="5" fill="#1c0e05" />
          <rect x="36" y="25" width="2" height="3" fill="#f8c29b" />

          {/* Torch Handle (Brown Wood) */}
          <rect x="36" y="22" width="2" height="6" fill="#78350f" />
          <rect x="35" y="21" width="4" height="2" fill="#451a03" />

          {/* Animated Pixel Fire Flame */}
          <motion.g
            filter="url(#pixelFlameGlow)"
            animate={{
              y: [0, -1, 0, -2, 0],
              scaleY: [1, 1.08, 0.96, 1.05, 1],
            }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '37px 20px' }}
          >
            {/* Outer Flame (Red/Dark Orange) */}
            <rect x="34" y="14" width="6" height="7" fill="#dc2626" rx="1" />
            <rect x="35" y="12" width="4" height="4" fill="#ea580c" />
            <rect x="36" y="10" width="2" height="3" fill="#f97316" />
            <rect x="37" y="8" width="1" height="3" fill="#ef4444" />

            {/* Mid Flame (Bright Orange/Yellow) */}
            <rect x="35" y="15" width="4" height="5" fill="#f97316" />
            <rect x="36" y="13" width="2" height="4" fill="#f59e0b" />

            {/* Inner Core Flame (Bright Yellow/White) */}
            <rect x="36" y="16" width="2" height="3" fill="#fef08a" />
            <rect x="36" y="14" width="1" height="2" fill="#ffffff" />
          </motion.g>
        </g>

        {/* ---------------------------------------------------- */}
        {/* 5. RIGHT ARM & FLOATING GLOWING GREEN CUBE (Viewer's Left) */}
        {/* ---------------------------------------------------- */}
        <g id="cube-arm-layer">
          {/* Light Blue Sleeve */}
          <rect x="11" y="26" width="5" height="5" fill="#0b314b" />
          <rect x="12" y="27" width="3" height="3" fill="#7dd3fc" />

          <rect x="8" y="28" width="5" height="6" fill="#0b314b" />
          <rect x="9" y="29" width="3" height="4" fill="#38bdf8" />

          {/* Outstretched Palm Facing Up */}
          <rect x="6" y="27" width="5" height="4" fill="#1c0e05" />
          <rect x="7" y="28" width="4" height="2" fill="#f8c29b" />
          <rect x="7" y="30" width="3" height="1" fill="#e59a68" />

          {/* Floating Isometric Glowing Green Cube */}
          <motion.g
            filter="url(#pixelCubeGlow)"
            animate={{
              y: [0, -3, 0],
              rotate: [-2, 2, -2],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '8px 20px' }}
          >
            {/* Isometric 3D Green Pixel Cube Outline */}
            <polygon
              points="9,14 14,17 14,23 9,26 4,23 4,17"
              fill="#064e3b"
              stroke="#022c22"
              strokeWidth="0.8"
            />
            {/* Top Face (Bright Mint/Emerald) */}
            <polygon points="9,15 13,17.5 9,20 5,17.5" fill="#6ee7b7" />
            {/* Left Face (Mid Emerald) */}
            <polygon points="5,17.5 9,20 9,25 5,22.5" fill="#10b981" />
            {/* Right Face (Darker Shaded Emerald) */}
            <polygon points="9,20 13,17.5 13,22.5 9,25" fill="#059669" />

            {/* Emblem / Core Shine on Cube */}
            <rect x="8" y="16" width="2" height="2" fill="#a7f3d0" />
            <rect x="7" y="20" width="1" height="2" fill="#34d399" />
            <rect x="10" y="20" width="1" height="2" fill="#047857" />
          </motion.g>
        </g>

        {/* ---------------------------------------------------- */}
        {/* 6. HEAD, MASK, EARS, EYES & CROWN */}
        {/* ---------------------------------------------------- */}
        <g id="head-layer">
          {/* Outer Ears */}
          {/* Left Ear */}
          <rect x="10" y="13" width="4" height="6" fill="#1c0e05" rx="1" />
          <rect x="11" y="14" width="2" height="4" fill="#f8c29b" />

          {/* Right Ear */}
          <rect x="32" y="13" width="4" height="6" fill="#1c0e05" rx="1" />
          <rect x="33" y="14" width="2" height="4" fill="#f8c29b" />

          {/* Brown Monkey Head Fur Base */}
          <rect x="13" y="8" width="20" height="17" fill="#1c0e05" rx="2" />
          <rect x="14" y="9" width="18" height="15" fill="#8c451b" />
          <rect x="15" y="9" width="16" height="3" fill="#a65322" />

          {/* Distinctive Hanuman White Face Mask (Heart Shape Framing Eyes/Forehead) */}
          <path
            d="M 16 11 C 18 11, 21 14, 23 15 C 25 14, 28 11, 30 11 C 32 11, 32 16, 31 19 C 30 22, 26 23, 23 23 C 20 23, 16 22, 15 19 C 14 16, 14 11, 16 11 Z"
            fill="#ffffff"
          />

          {/* Peach Face Cheek & Chin Underneath */}
          <rect x="17" y="14" width="12" height="8" fill="#f8c29b" rx="2" />
          <rect x="18" y="19" width="10" height="3" fill="#fcd3b0" />

          {/* Cute Nose */}
          <rect x="22" y="17" width="2" height="1" fill="#78350f" />

          {/* Dynamic Mouth based on Mood */}
          {isHappy ? (
            // Big Joyful Open Smile
            <polygon points="21,19 25,19 24,21 22,21" fill="#7c2d12" />
          ) : isSad ? (
            // Frown
            <rect x="21" y="20" width="4" height="1" fill="#7c2d12" />
          ) : isSleep ? (
            // Tiny peaceful dot
            <rect x="22" y="19" width="2" height="1" fill="#78350f" />
          ) : (
            // Gentle Content Smile
            <path d="M 21 19 Q 23 21 25 19" stroke="#78350f" strokeWidth="1" fill="none" />
          )}

          {/* Dynamic Eyes based on Mood */}
          {isHappy ? (
            // Curved Cheerful Eyes: ^ ^
            <g>
              <path d="M 18 15 Q 19.5 13 21 15" stroke="#0f172a" strokeWidth="1.2" fill="none" />
              <path d="M 25 15 Q 26.5 13 28 15" stroke="#0f172a" strokeWidth="1.2" fill="none" />
            </g>
          ) : isSleep || isRelax ? (
            // Closed Peaceful Eyes: - -
            <g>
              <rect x="18" y="15" width="3" height="1" fill="#0f172a" />
              <rect x="25" y="15" width="3" height="1" fill="#0f172a" />
            </g>
          ) : isSad ? (
            // Droopy Downcast Eyes
            <g>
              <path d="M 18 14 Q 19.5 16 21 15" stroke="#0f172a" strokeWidth="1.2" fill="none" />
              <path d="M 25 15 Q 26.5 16 28 14" stroke="#0f172a" strokeWidth="1.2" fill="none" />
            </g>
          ) : (
            // Normal Crisp Big Pixel Eyes with Catchlight
            <g>
              {/* Left Eye */}
              <rect x="18" y="14" width="3" height="3" fill="#0f172a" rx="0.5" />
              <rect x="18" y="14" width="1" height="1" fill="#ffffff" />
              {/* Right Eye */}
              <rect x="25" y="14" width="3" height="3" fill="#0f172a" rx="0.5" />
              <rect x="25" y="14" width="1" height="1" fill="#ffffff" />
            </g>
          )}

          {/* Crown / Tiara with Cyan Gem (Top of Head) */}
          <g id="crown">
            {/* Crown Base */}
            <rect x="19" y="5" width="8" height="3" fill="#1c0e05" />
            <rect x="20" y="5" width="6" height="2" fill="#e2e8f0" />
            {/* Crown Peaks */}
            <rect x="19" y="3" width="2" height="3" fill="#cbd5e1" />
            <rect x="22" y="2" width="2" height="4" fill="#ffffff" />
            <rect x="25" y="3" width="2" height="3" fill="#cbd5e1" />
            {/* Center Cyan Gemstone */}
            <rect x="22" y="4" width="2" height="2" fill="#0284c7" />
            <rect x="22.5" y="4.5" width="1" height="1" fill="#38bdf8" />
          </g>
        </g>
      </motion.svg>
    </div>
  );
};
