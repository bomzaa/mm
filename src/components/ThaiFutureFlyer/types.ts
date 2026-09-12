export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type PowerUpType = 'none' | 'shield' | 'magnet' | 'energy' | 'speed';

export interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  isFloating: boolean;
  shieldActive: boolean;
  invulnerableTimer: number; // in seconds
  activePowerUp: PowerUpType;
  powerUpTimer: number; // remaining duration in seconds
  powerUpMaxDuration: number;
  floatAuraPulse: number;
}

export type ObstacleType =
  | 'laser_horizontal'
  | 'laser_vertical'
  | 'rotating_saw'
  | 'spikes_bottom'
  | 'spikes_top'
  | 'electric_zapper'
  | 'cyber_rocket'
  | 'surveillance_drone'
  | 'steam_vent'
  | 'swinging_mace'
  | 'energy_emitter';

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy?: number;
  // Specific properties
  rotationAngle?: number;
  rotationSpeed?: number;
  pulsePhase?: number;
  warningTimer?: number; // for rockets: countdown before rocket dashes in
  hasLaunched?: boolean;
  passedPlayer?: boolean;
  swingAngle?: number;
  swingSpeed?: number;
  steamTimer?: number;
}

export type BananaType = 'standard' | 'energy' | 'ring' | 'shield' | 'magnet' | 'speed' | 'sparkle';

export interface Banana {
  id: number;
  type: BananaType;
  x: number;
  y: number;
  radius: number;
  points: number;
  collected: boolean;
  pulsePhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'pixel' | 'spark' | 'ring';
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface ParallaxLayer {
  speedMultiplier: number;
  offset: number;
}

export interface GameStats {
  score: number;
  bananasCollected: number;
  distanceMeters: number;
  highScore: number;
  isNewHighScore: boolean;
  elapsedTime: number;
}
