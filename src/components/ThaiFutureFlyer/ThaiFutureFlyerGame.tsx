import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  ArrowLeft,
  Award,
  Sparkles,
  Zap,
  Shield,
  Magnet,
  Maximize2,
  Minimize2,
  Compass,
} from 'lucide-react';
import {
  GameState,
  Player,
  Obstacle,
  Banana,
  Particle,
  FloatingText,
  ObstacleType,
  BananaType,
  PowerUpType,
  GameStats,
} from './types';
import { FlyerAudioEngine } from './audio';
import { FlyerPixelRenderer } from './pixelRenderer';

interface ThaiFutureFlyerGameProps {
  onBackToHub: () => void;
  onUpdateHighScore?: (score: number) => void;
  savedHighScore?: number;
}

export const ThaiFutureFlyerGame: React.FC<ThaiFutureFlyerGameProps> = ({
  onBackToHub,
  onUpdateHighScore,
  savedHighScore = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Audio Engine instance
  const audioRef = useRef<FlyerAudioEngine>(new FlyerAudioEngine());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // High-level UI state
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [isPortrait, setIsPortrait] = useState<boolean>(false);
  const [dismissOrientationWarning, setDismissOrientationWarning] = useState<boolean>(false);

  // Game Statistics
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    bananasCollected: 0,
    distanceMeters: 0,
    highScore: savedHighScore,
    isNewHighScore: false,
    elapsedTime: 0,
  });

  // Active power up HUD tracking
  const [hudPowerUp, setHudPowerUp] = useState<{
    type: PowerUpType;
    remaining: number;
    max: number;
  }>({
    type: 'none',
    remaining: 0,
    max: 1,
  });

  // Game loop & state refs
  const gameRef = useRef<{
    animationFrameId: number;
    lastTime: number;
    width: number;
    height: number;
    groundY: number;
    scrollOffset: number;
    gameSpeed: number;
    elapsedSeconds: number;
    isHoldingFloat: boolean;
    player: Player;
    obstacles: Obstacle[];
    bananas: Banana[];
    particles: Particle[];
    floatingTexts: FloatingText[];
    nextObstacleTimer: number;
    nextBananaPatternTimer: number;
    obstacleIdCounter: number;
    bananaIdCounter: number;
    floatingTextIdCounter: number;
    state: GameState;
  }>({
    animationFrameId: 0,
    lastTime: 0,
    width: 800,
    height: 480,
    groundY: 420,
    scrollOffset: 0,
    gameSpeed: 4.2,
    elapsedSeconds: 0,
    isHoldingFloat: false,
    player: {
      x: 140,
      y: 200,
      width: 48,
      height: 48,
      vy: 0,
      isFloating: false,
      shieldActive: false,
      invulnerableTimer: 0,
      activePowerUp: 'none',
      powerUpTimer: 0,
      powerUpMaxDuration: 1,
      floatAuraPulse: 0,
    },
    obstacles: [],
    bananas: [],
    particles: [],
    floatingTexts: [],
    nextObstacleTimer: 3.5, // 3.5 seconds peace at start
    nextBananaPatternTimer: 0.8,
    obstacleIdCounter: 1,
    bananaIdCounter: 1,
    floatingTextIdCounter: 1,
    state: 'MENU',
  });

  // Handle Audio mute toggle
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioRef.current.setMuted(next);
  };

  // Check orientation on mobile
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        const isPort = window.innerHeight > window.innerWidth && window.innerWidth < 640;
        setIsPortrait(isPort);
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Update canvas sizing dynamically with ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const targetW = Math.floor(width);
          const targetH = Math.floor(height);

          gameRef.current.width = targetW;
          gameRef.current.height = targetH;
          gameRef.current.groundY = targetH * 0.88;

          // Player placed at ~22% from left
          gameRef.current.player.x = Math.max(60, targetW * 0.22);

          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = targetW * dpr;
            canvas.height = targetH * dpr;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.resetTransform();
              ctx.scale(dpr, dpr);
              ctx.imageSmoothingEnabled = false; // Preserve 100% crisp pixel art!
            }
          }
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Start / Reset game instance
  const startNewGame = useCallback(() => {
    audioRef.current.playStart();
    const g = gameRef.current;
    const targetY = g.height * 0.45;

    g.player = {
      x: Math.max(60, g.width * 0.22),
      y: targetY,
      width: 48,
      height: 48,
      vy: 0,
      isFloating: false,
      shieldActive: false,
      invulnerableTimer: 0,
      activePowerUp: 'none',
      powerUpTimer: 0,
      powerUpMaxDuration: 1,
      floatAuraPulse: 0,
    };

    g.obstacles = [];
    g.bananas = [];
    g.particles = [];
    g.floatingTexts = [];
    g.scrollOffset = 0;
    g.gameSpeed = 4.0;
    g.elapsedSeconds = 0;
    g.nextObstacleTimer = 4.0; // 4 seconds peaceful intro for player learning
    g.nextBananaPatternTimer = 0.5;
    g.isHoldingFloat = false;

    setStats((prev) => ({
      ...prev,
      score: 0,
      bananasCollected: 0,
      distanceMeters: 0,
      isNewHighScore: false,
      elapsedTime: 0,
    }));

    setHudPowerUp({ type: 'none', remaining: 0, max: 1 });
    g.state = 'PLAYING';
    setGameState('PLAYING');
  }, []);

  // Trigger floating on
  const handleFloatStart = useCallback(() => {
    if (gameRef.current.state === 'PLAYING') {
      if (!gameRef.current.isHoldingFloat) {
        audioRef.current.startFloatSound();
      }
      gameRef.current.isHoldingFloat = true;
    }
  }, []);

  // Trigger floating off
  const handleFloatEnd = useCallback(() => {
    if (gameRef.current.isHoldingFloat) {
      audioRef.current.stopFloatSound();
    }
    gameRef.current.isHoldingFloat = false;
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        if (gameState === 'MENU') {
          startNewGame();
        } else if (gameState === 'PLAYING') {
          handleFloatStart();
        } else if (gameState === 'GAME_OVER' && e.code === 'Space') {
          startNewGame();
        }
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleFloatEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, handleFloatStart, handleFloatEnd, startNewGame]);

  const togglePause = () => {
    if (gameState === 'PLAYING') {
      gameRef.current.state = 'PAUSED';
      setGameState('PAUSED');
      audioRef.current.stopFloatSound();
    } else if (gameState === 'PAUSED') {
      gameRef.current.state = 'PLAYING';
      setGameState('PLAYING');
      gameRef.current.lastTime = performance.now();
    }
  };

  // Spawn Obstacles with Fair Corridors
  const spawnObstaclePattern = (g: typeof gameRef.current) => {
    const w = g.width;
    const ground = g.groundY;
    const playHeight = ground - 20;

    // Determine available obstacle types based on elapsed seconds
    const time = g.elapsedSeconds;
    const pool: ObstacleType[] = ['laser_horizontal', 'laser_vertical'];

    if (time > 10) pool.push('rotating_saw', 'steam_vent');
    if (time > 18) pool.push('electric_zapper', 'spikes_bottom', 'spikes_top', 'surveillance_drone');
    if (time > 26) pool.push('cyber_rocket', 'swinging_mace');

    const chosenType = pool[Math.floor(Math.random() * pool.length)];
    const id = g.obstacleIdCounter++;

    switch (chosenType) {
      case 'laser_horizontal': {
        // Horizontal laser bar with random safe height
        const barH = 18;
        // Positioned either top, middle, or low, leaving ample room
        const zone = Math.floor(Math.random() * 3);
        const y = zone === 0 ? 35 : zone === 1 ? playHeight * 0.45 : playHeight * 0.72;
        const length = Math.min(220, w * 0.35);
        g.obstacles.push({
          id,
          type: 'laser_horizontal',
          x: w + 20,
          y,
          width: length,
          height: barH,
          vx: g.gameSpeed,
        });
        break;
      }
      case 'laser_vertical': {
        // Vertical beam leaving a safe top or bottom gate
        const beamW = 22;
        const isTopAligned = Math.random() > 0.5;
        const h = playHeight * 0.52;
        const y = isTopAligned ? 24 : ground - h;
        g.obstacles.push({
          id,
          type: 'laser_vertical',
          x: w + 20,
          y,
          width: beamW,
          height: h,
          vx: g.gameSpeed,
        });
        break;
      }
      case 'rotating_saw': {
        // Floating spinning buzzsaw from Image 2
        const sawSize = 46;
        const y = 50 + Math.random() * (playHeight - sawSize - 50);
        g.obstacles.push({
          id,
          type: 'rotating_saw',
          x: w + 20,
          y,
          width: sawSize,
          height: sawSize,
          vx: g.gameSpeed,
          rotationAngle: 0,
          rotationSpeed: 7.5,
        });
        break;
      }
      case 'electric_zapper': {
        // Electric field gate with 3 cyan lightning arcs
        const zh = 84;
        const y = 40 + Math.random() * (playHeight - zh - 40);
        g.obstacles.push({
          id,
          type: 'electric_zapper',
          x: w + 20,
          y,
          width: 36,
          height: zh,
          vx: g.gameSpeed,
        });
        break;
      }
      case 'spikes_bottom': {
        const spikeW = 75;
        const spikeH = 24;
        g.obstacles.push({
          id,
          type: 'spikes_bottom',
          x: w + 20,
          y: ground - spikeH,
          width: spikeW,
          height: spikeH,
          vx: g.gameSpeed,
        });
        break;
      }
      case 'spikes_top': {
        const spikeW = 75;
        const spikeH = 24;
        g.obstacles.push({
          id,
          type: 'spikes_top',
          x: w + 20,
          y: 24,
          width: spikeW,
          height: spikeH,
          vx: g.gameSpeed,
        });
        break;
      }
      case 'cyber_rocket': {
        // High-speed missile with right-side warning indicator!
        audioRef.current.playWarningBeep();
        const ry = 40 + Math.random() * (playHeight - 60);
        g.obstacles.push({
          id,
          type: 'cyber_rocket',
          x: w,
          y: ry,
          width: 48,
          height: 22,
          vx: g.gameSpeed * 1.7, // Rocket is faster than regular scroll!
          warningTimer: 1.1, // 1.1s warning before launching across
          hasLaunched: false,
        });
        break;
      }
      case 'surveillance_drone': {
        // Floating drone with downward red spotlight
        const dw = 38;
        const dh = 90;
        const dy = 30 + Math.random() * (playHeight - dh - 20);
        g.obstacles.push({
          id,
          type: 'surveillance_drone',
          x: w + 20,
          y: dy,
          width: dw,
          height: dh,
          vx: g.gameSpeed,
        });
        break;
      }
      case 'steam_vent': {
        // Ceiling vent blasting smoke downward
        const vw = 50;
        const vh = 95;
        g.obstacles.push({
          id,
          type: 'steam_vent',
          x: w + 20,
          y: 24,
          width: vw,
          height: vh,
          vx: g.gameSpeed,
        });
        break;
      }
      case 'swinging_mace': {
        // Ceiling swinging spiked flail
        const mw = 32;
        const mh = 110;
        g.obstacles.push({
          id,
          type: 'swinging_mace',
          x: w + 20,
          y: 24,
          width: mw,
          height: mh,
          vx: g.gameSpeed,
        });
        break;
      }
      case 'energy_emitter': {
        const ew = 36;
        const eh = 36;
        const ey = 50 + Math.random() * (playHeight - 80);
        g.obstacles.push({
          id,
          type: 'energy_emitter',
          x: w + 20,
          y: ey,
          width: ew,
          height: eh,
          vx: g.gameSpeed,
        });
        break;
      }
    }
  };

  // Spawn Banana Trails (Curves, Waves, Clusters, Rings, Power-ups)
  const spawnBananaPattern = (g: typeof gameRef.current) => {
    const w = g.width;
    const ground = g.groundY;
    const playH = ground - 60;
    const patternType = Math.floor(Math.random() * 5);

    // Occasional special banana power-up (Shield, Magnet, Energy, Speed, Sparkle)
    const canSpawnPowerUp = g.elapsedSeconds > 8 && Math.random() < 0.32;
    const powerUpTypes: BananaType[] = ['shield', 'magnet', 'energy', 'speed', 'ring', 'sparkle'];
    const chosenSpecial = canSpawnPowerUp
      ? powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)]
      : 'standard';

    const startX = w + 40;
    const baseY = 60 + Math.random() * (playH - 80);

    if (patternType === 0) {
      // 1. Straight Line (4-6 bananas)
      const count = 5;
      for (let i = 0; i < count; i++) {
        g.bananas.push({
          id: g.bananaIdCounter++,
          type: i === 2 && canSpawnPowerUp ? chosenSpecial : 'standard',
          x: startX + i * 28,
          y: baseY,
          radius: 12,
          points: 10,
          collected: false,
          pulsePhase: Math.random() * Math.PI,
        });
      }
    } else if (patternType === 1) {
      // 2. Sine Wave
      const count = 6;
      for (let i = 0; i < count; i++) {
        const offsetAngle = (i / count) * Math.PI * 2;
        g.bananas.push({
          id: g.bananaIdCounter++,
          type: i === 3 && canSpawnPowerUp ? chosenSpecial : 'standard',
          x: startX + i * 28,
          y: baseY + Math.sin(offsetAngle) * 36,
          radius: 12,
          points: 10,
          collected: false,
          pulsePhase: Math.random() * Math.PI,
        });
      }
    } else if (patternType === 2) {
      // 3. Arc / Rainbow
      const count = 5;
      for (let i = 0; i < count; i++) {
        const arcY = baseY - Math.sin((i / (count - 1)) * Math.PI) * 44;
        g.bananas.push({
          id: g.bananaIdCounter++,
          type: i === 2 && canSpawnPowerUp ? chosenSpecial : 'standard',
          x: startX + i * 30,
          y: arcY,
          radius: 12,
          points: 10,
          collected: false,
          pulsePhase: Math.random() * Math.PI,
        });
      }
    } else if (patternType === 3) {
      // 4. Staircase (Ascending or Descending)
      const count = 4;
      const stepDir = Math.random() > 0.5 ? 1 : -1;
      for (let i = 0; i < count; i++) {
        g.bananas.push({
          id: g.bananaIdCounter++,
          type: i === count - 1 && canSpawnPowerUp ? chosenSpecial : 'standard',
          x: startX + i * 26,
          y: Math.max(40, Math.min(ground - 30, baseY + i * 16 * stepDir)),
          radius: 12,
          points: 10,
          collected: false,
          pulsePhase: Math.random() * Math.PI,
        });
      }
    } else {
      // 5. Gem Cluster / Ring formation
      const count = 5;
      for (let i = 0; i < count; i++) {
        const angle = (i * Math.PI * 2) / count;
        g.bananas.push({
          id: g.bananaIdCounter++,
          type: i === 0 ? 'ring' : 'standard',
          x: startX + Math.cos(angle) * 22,
          y: baseY + Math.sin(angle) * 22,
          radius: 12,
          points: 15,
          collected: false,
          pulsePhase: Math.random() * Math.PI,
        });
      }
    }
  };

  // Add Particle Burst
  const addParticleBurst = (
    g: typeof gameRef.current,
    x: number,
    y: number,
    color: string,
    count: number = 8,
    shape: 'pixel' | 'spark' | 'ring' = 'pixel'
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      g.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3.5 + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 0.35 + 0.25,
        shape,
      });
    }
  };

  // Add Floating Score / Status Text
  const addFloatingText = (
    g: typeof gameRef.current,
    text: string,
    x: number,
    y: number,
    color: string
  ) => {
    g.floatingTexts.push({
      id: g.floatingTextIdCounter++,
      text,
      x,
      y,
      color,
      alpha: 1,
      life: 0,
      maxLife: 0.8,
    });
  };

  // Trigger Game Over
  const handleGameOver = (g: typeof gameRef.current) => {
    audioRef.current.playCrash();
    audioRef.current.stopFloatSound();
    g.state = 'GAME_OVER';
    setGameState('GAME_OVER');

    // Massive spark explosion at monkey position
    addParticleBurst(g, g.player.x + g.player.width / 2, g.player.y + g.player.height / 2, '#ef4444', 20);
    addParticleBurst(g, g.player.x + g.player.width / 2, g.player.y + g.player.height / 2, '#fbbf24', 16);

    const finalScore = Math.floor(stats.score);
    const isNewHigh = finalScore > stats.highScore;

    setStats((prev) => ({
      ...prev,
      highScore: Math.max(prev.highScore, finalScore),
      isNewHighScore: isNewHigh,
    }));

    if (onUpdateHighScore && finalScore > savedHighScore) {
      onUpdateHighScore(finalScore);
    }
  };

  // Main Engine Update & Render Loop
  useEffect(() => {
    let animationId: number;

    const gameLoop = (timestamp: number) => {
      const g = gameRef.current;
      if (!g.lastTime) g.lastTime = timestamp;
      const dt = Math.min((timestamp - g.lastTime) / 1000, 0.05); // Cap delta time
      g.lastTime = timestamp;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (ctx && canvas) {
        // Clear canvas
        ctx.clearRect(0, 0, g.width, g.height);

        // ==========================================
        // 1. UPDATE GAME PHYSICS & LOGIC (PLAYING)
        // ==========================================
        if (g.state === 'PLAYING') {
          g.elapsedSeconds += dt;
          g.scrollOffset += g.gameSpeed * (dt * 60);

          // Progressive Game Speed Ramping
          // Smoothly increases over time
          g.gameSpeed = 4.0 + Math.min(4.5, (g.elapsedSeconds / 35) * 1.5);

          // Distance in meters (1 pixel ~= 0.15 meters)
          const currentDistance = Math.floor(g.scrollOffset * 0.15);

          // Score multiplier if speed powerup active
          const scoreMultiplier = g.player.activePowerUp === 'speed' ? 2 : 1;
          const scoreDelta = (g.gameSpeed * dt * 25) * scoreMultiplier;

          // Update Timers
          if (g.player.invulnerableTimer > 0) {
            g.player.invulnerableTimer -= dt;
          }

          if (g.player.powerUpTimer > 0) {
            g.player.powerUpTimer -= dt;
            setHudPowerUp({
              type: g.player.activePowerUp,
              remaining: Math.max(0, g.player.powerUpTimer),
              max: g.player.powerUpMaxDuration,
            });

            if (g.player.powerUpTimer <= 0) {
              g.player.activePowerUp = 'none';
              setHudPowerUp({ type: 'none', remaining: 0, max: 1 });
            }
          }

          // ------------------------------------------
          // PLAYER PHYSICS: "FLOATING POWER"
          // Absolutely NO Jetpack! Upward buoyancy force
          // ------------------------------------------
          const gravity = 18.0; // downwards acceleration
          // If energy powerup is active, float force is even smoother
          const floatLift = g.player.activePowerUp === 'energy' ? -38.0 : -32.0;

          if (g.isHoldingFloat) {
            g.player.isFloating = true;
            g.player.vy += floatLift * dt;

            // Generate mystical cyan levitation particle dust
            if (Math.random() < 0.6) {
              g.particles.push({
                x: g.player.x + 12 + Math.random() * (g.player.width - 24),
                y: g.player.y + g.player.height - 2,
                vx: -g.gameSpeed * 0.4 + (Math.random() - 0.5) * 2,
                vy: Math.random() * 2.5 + 1.2,
                size: Math.random() * 3 + 2,
                color: Math.random() > 0.4 ? '#38bdf8' : '#facc15',
                alpha: 0.9,
                life: 0,
                maxLife: 0.35,
                shape: 'spark',
              });
            }
          } else {
            g.player.isFloating = false;
            g.player.vy += gravity * dt;
          }

          // Terminal Velocity Clamping
          const maxDownSpeed = 8.5;
          const maxUpSpeed = -9.0;
          g.player.vy = Math.max(maxUpSpeed, Math.min(maxDownSpeed, g.player.vy));

          // Apply displacement
          g.player.y += g.player.vy;

          // Ceiling & Floor Bounds Clamping
          const ceilingY = 16;
          const floorY = g.groundY - g.player.height;

          if (g.player.y < ceilingY) {
            g.player.y = ceilingY;
            g.player.vy = 0;
          } else if (g.player.y > floorY) {
            g.player.y = floorY;
            g.player.vy = 0;
          }

          // ------------------------------------------
          // OBSTACLE SPAWNING & LIFECYCLE
          // ------------------------------------------
          g.nextObstacleTimer -= dt;
          if (g.nextObstacleTimer <= 0) {
            spawnObstaclePattern(g);
            // Spawn interval decreases smoothly as speed increases
            const minInterval = Math.max(1.6, 3.2 - (g.elapsedSeconds / 45) * 1.2);
            g.nextObstacleTimer = minInterval + Math.random() * 0.8;
          }

          // Update Obstacles
          for (let i = g.obstacles.length - 1; i >= 0; i--) {
            const obs = g.obstacles[i];

            // Cyber rocket warning logic
            if (obs.type === 'cyber_rocket') {
              if (obs.warningTimer && obs.warningTimer > 0) {
                obs.warningTimer -= dt;
                if (obs.warningTimer <= 0) {
                  obs.hasLaunched = true;
                }
              }
            }

            // Move obstacle leftwards
            if (obs.type !== 'cyber_rocket' || obs.hasLaunched) {
              obs.x -= obs.vx * (dt * 60);
            }

            // Spin saws
            if (obs.rotationAngle !== undefined && obs.rotationSpeed) {
              obs.rotationAngle += obs.rotationSpeed * dt;
            }

            // Remove offscreen
            if (obs.x + obs.width < -100) {
              g.obstacles.splice(i, 1);
              continue;
            }

            // ------------------------------------------
            // COLLISION DETECTION (FAIR HITBOX)
            // Player visual: 48x48. Hitbox: 28x30 centered
            // ------------------------------------------
            const pHitBox = {
              x: g.player.x + 10,
              y: g.player.y + 9,
              width: 28,
              height: 30,
            };

            // Obstacle hitbox (tailored per obstacle type for fair player experience)
            let isColliding = false;

            if (obs.type === 'swinging_mace') {
              const pivotX = obs.x + obs.width / 2;
              const armLen = obs.height - 24;
              const angle = Math.sin(g.elapsedSeconds * 3.5) * 0.55;
              const ballX = pivotX + Math.sin(angle) * armLen;
              const ballY = obs.y + Math.cos(angle) * armLen + 12;
              const pCenterX = pHitBox.x + pHitBox.width / 2;
              const pCenterY = pHitBox.y + pHitBox.height / 2;
              const dist = Math.hypot(pCenterX - ballX, pCenterY - ballY);
              if (dist < 26) {
                isColliding = true;
              }
            } else {
              const obsHitBox = {
                x: obs.x + (obs.type === 'surveillance_drone' ? 6 : 4),
                y: obs.y + 4,
                width: Math.max(6, obs.width - (obs.type === 'surveillance_drone' ? 12 : 8)),
                height: Math.max(6, obs.height - 8),
              };

              isColliding =
                pHitBox.x < obsHitBox.x + obsHitBox.width &&
                pHitBox.x + pHitBox.width > obsHitBox.x &&
                pHitBox.y < obsHitBox.y + obsHitBox.height &&
                pHitBox.y + pHitBox.height > obsHitBox.y;
            }

            if (isColliding && g.player.invulnerableTimer <= 0) {
              // Check if Shield is active
              if (g.player.shieldActive) {
                // Shield absorbs hit!
                audioRef.current.playShieldBreak();
                g.player.shieldActive = false;
                g.player.invulnerableTimer = 1.4; // 1.4s grace period
                addParticleBurst(g, pHitBox.x + 14, pHitBox.y + 15, '#10b981', 16, 'ring');
                addFloatingText(g, 'SHIELD BROKEN!', g.player.x, g.player.y - 12, '#34d399');
                // Destroy obstacle
                g.obstacles.splice(i, 1);
              } else {
                // Crash & Game Over!
                handleGameOver(g);
                break;
              }
            }
          }

          // ------------------------------------------
          // BANANA SPAWNING & COLLECTION
          // ------------------------------------------
          g.nextBananaPatternTimer -= dt;
          if (g.nextBananaPatternTimer <= 0) {
            spawnBananaPattern(g);
            g.nextBananaPatternTimer = 1.8 + Math.random() * 1.5;
          }

          // Magnet Powerup range check
          const hasMagnet = g.player.activePowerUp === 'magnet';
          const magnetRadius = 180;
          const playerCenterX = g.player.x + g.player.width / 2;
          const playerCenterY = g.player.y + g.player.height / 2;

          for (let i = g.bananas.length - 1; i >= 0; i--) {
            const b = g.bananas[i];

            // Magnet attraction
            if (hasMagnet && !b.collected) {
              const dx = playerCenterX - b.x;
              const dy = playerCenterY - b.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < magnetRadius) {
                const pullSpeed = 8.5;
                b.x += (dx / dist) * pullSpeed;
                b.y += (dy / dist) * pullSpeed;
              }
            }

            // Normal scroll
            b.x -= g.gameSpeed * (dt * 60);

            // Remove offscreen
            if (b.x < -40) {
              g.bananas.splice(i, 1);
              continue;
            }

            // Collision with Monkey
            const distToPlayer = Math.hypot(playerCenterX - b.x, playerCenterY - b.y);
            const collectRadius = 26;

            if (distToPlayer < collectRadius && !b.collected) {
              b.collected = true;

              // Audio & Points
              audioRef.current.playBanana(b.type);
              const pts = b.points * scoreMultiplier;

              // Particle burst & floating text
              const color =
                b.type === 'shield'
                  ? '#00f0ff'
                  : b.type === 'energy'
                  ? '#38bdf8'
                  : b.type === 'magnet'
                  ? '#00f0ff'
                  : b.type === 'speed'
                  ? '#f472b6'
                  : b.type === 'sparkle'
                  ? '#00f0ff'
                  : '#facc15';

              addParticleBurst(g, b.x, b.y, color, b.type === 'sparkle' ? 14 : 8, 'spark');

              // Apply Powerup Effects
              if (b.type === 'shield') {
                audioRef.current.playPowerUp();
                g.player.shieldActive = true;
                addFloatingText(g, 'SHIELD +1!', b.x, b.y - 12, '#34d399');
              } else if (b.type === 'magnet') {
                audioRef.current.playPowerUp();
                g.player.activePowerUp = 'magnet';
                g.player.powerUpTimer = 8.0;
                g.player.powerUpMaxDuration = 8.0;
                addFloatingText(g, 'MAGNET 8s!', b.x, b.y - 12, '#00f0ff');
              } else if (b.type === 'energy') {
                audioRef.current.playPowerUp();
                g.player.activePowerUp = 'energy';
                g.player.powerUpTimer = 6.0;
                g.player.powerUpMaxDuration = 6.0;
                addFloatingText(g, 'SUPER FLOAT!', b.x, b.y - 12, '#38bdf8');
              } else if (b.type === 'speed') {
                audioRef.current.playPowerUp();
                g.player.activePowerUp = 'speed';
                g.player.powerUpTimer = 5.0;
                g.player.powerUpMaxDuration = 5.0;
                addFloatingText(g, '2X SPEED & PTS!', b.x, b.y - 12, '#f472b6');
              } else if (b.type === 'sparkle') {
                audioRef.current.playPowerUp();
                const bonusPts = 50 * scoreMultiplier;
                addFloatingText(g, `+${bonusPts} STAR BONUS!`, b.x, b.y - 12, '#00f0ff');
                setStats((prev) => ({
                  ...prev,
                  score: prev.score + bonusPts,
                }));
              } else if (b.type === 'ring') {
                addFloatingText(g, `+${pts} RING!`, b.x, b.y - 10, '#00f0ff');
              } else {
                addFloatingText(g, `+${pts}`, b.x, b.y - 10, '#fde047');
              }

              // Update React Stats State
              setStats((prev) => ({
                ...prev,
                score: prev.score + pts,
                bananasCollected: prev.bananasCollected + 1,
              }));

              g.bananas.splice(i, 1);
            }
          }

          // Update Score state
          setStats((prev) => ({
            ...prev,
            score: prev.score + scoreDelta,
            distanceMeters: currentDistance,
            elapsedTime: g.elapsedSeconds,
          }));
        }

        // ==========================================
        // 2. UPDATE PARTICLES & TEXTS
        // ==========================================
        const timeNow = timestamp / 1000;

        for (let i = g.particles.length - 1; i >= 0; i--) {
          const p = g.particles[i];
          p.life += dt;
          p.x += p.vx;
          p.y += p.vy;
          p.alpha = 1 - p.life / p.maxLife;
          if (p.life >= p.maxLife) {
            g.particles.splice(i, 1);
          }
        }

        for (let i = g.floatingTexts.length - 1; i >= 0; i--) {
          const t = g.floatingTexts[i];
          t.life += dt;
          t.y -= dt * 28; // float gently upwards
          t.alpha = 1 - t.life / t.maxLife;
          if (t.life >= t.maxLife) {
            g.floatingTexts.splice(i, 1);
          }
        }

        // ==========================================
        // 3. RENDER SCENE (PARALLAX 3 LAYERS)
        // ==========================================

        // Layer 1: Distant Cyberpunk Sky, Moon & Stars
        FlyerPixelRenderer.drawSkyLayer(ctx, g.width, g.height, g.scrollOffset);

        // Layer 2: Futuristic Thai Temples & Cyber Bangkok
        FlyerPixelRenderer.drawMidCityLayer(ctx, g.width, g.height, g.scrollOffset);

        // Layer 3: Foreground River & Elevated Track
        FlyerPixelRenderer.drawForegroundLayer(ctx, g.width, g.height, g.scrollOffset);

        // Obstacles (Lasers, Saws, Spikes, Zappers, Rockets)
        for (const obs of g.obstacles) {
          FlyerPixelRenderer.drawObstacle(ctx, obs, timeNow);
        }

        // Bananas & Power-ups
        for (const b of g.bananas) {
          FlyerPixelRenderer.drawBanana(ctx, b, timeNow);
        }

        // Floating Levitation Particles & Sparks
        FlyerPixelRenderer.drawParticles(ctx, g.particles);

        // Character: Thai Cyber Monkey (Hanuman)
        // Rendered in all states except initial MENU when idle
        if (g.state !== 'MENU') {
          FlyerPixelRenderer.drawPlayer(ctx, g.player, timeNow);
        }

        // Floating Text Popups (+10, SHIELD!)
        FlyerPixelRenderer.drawFloatingTexts(ctx, g.floatingTexts);
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [handleGameOver]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] max-h-[85vh] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/20 select-none flex flex-col justify-between"
      style={{
        imageRendering: 'pixelated',
        fontFamily: '"Courier New", monospace',
      }}
      onMouseDown={(e) => {
        if (gameState === 'PLAYING') {
          handleFloatStart();
        }
      }}
      onMouseUp={() => handleFloatEnd()}
      onTouchStart={(e) => {
        if (gameState === 'PLAYING') {
          handleFloatStart();
        }
      }}
      onTouchEnd={() => handleFloatEnd()}
      onTouchCancel={() => handleFloatEnd()}
    >
      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-pointer touch-none"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* ============================================================ */}
      {/* 1. TOP HUD (High-Tech Cyber Thai Pixel Bar) */}
      {/* ============================================================ */}
      <div className="relative z-20 flex items-center justify-between p-4 pointer-events-none">
        {/* Left: Back button & Mute */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              audioRef.current.stopFloatSound();
              onBackToHub();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:text-white transition-all text-xs font-bold shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>MINI GAMES</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all shadow-md cursor-pointer"
            title={isMuted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {gameState === 'PLAYING' && (
            <button
              onClick={togglePause}
              className="p-1.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-500/20 transition-all shadow-md cursor-pointer"
              title="Pause (P)"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Center: Live Stats Scoreboard */}
        <div className="flex items-center gap-3 sm:gap-6 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-cyan-500/40 shadow-lg shadow-cyan-950/50">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-cyan-400 tracking-wider font-bold">SCORE</span>
            <span className="text-sm sm:text-base font-black text-white tracking-widest">
              {String(Math.floor(stats.score)).padStart(6, '0')}
            </span>
          </div>

          <div className="h-6 w-px bg-cyan-800/60" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-amber-400 tracking-wider font-bold flex items-center gap-1">
              🍌 BANANA
            </span>
            <span className="text-sm sm:text-base font-black text-amber-300 tracking-wider">
              {String(stats.bananasCollected).padStart(2, '0')}
            </span>
          </div>

          <div className="h-6 w-px bg-cyan-800/60" />

          <div className="flex flex-col items-center">
            <span className="text-[10px] text-purple-400 tracking-wider font-bold">DISTANCE</span>
            <span className="text-sm sm:text-base font-black text-purple-300 tracking-wider">
              {String(stats.distanceMeters).padStart(3, '0')}m
            </span>
          </div>
        </div>

        {/* Right: Active Power-up Gauge & High Score */}
        <div className="flex items-center gap-3">
          {hudPowerUp.type !== 'none' && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-md animate-pulse">
              {hudPowerUp.type === 'shield' && <Shield className="w-4 h-4 text-emerald-400" />}
              {hudPowerUp.type === 'magnet' && <Magnet className="w-4 h-4 text-blue-400" />}
              {hudPowerUp.type === 'energy' && <Zap className="w-4 h-4 text-cyan-400" />}
              {hudPowerUp.type === 'speed' && <Sparkles className="w-4 h-4 text-pink-400" />}
              <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-emerald-400 transition-all duration-100"
                  style={{
                    width: `${(hudPowerUp.remaining / hudPowerUp.max) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="hidden md:flex flex-col items-end bg-slate-900/70 border border-slate-800 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[9px] text-slate-400 font-bold">HIGH SCORE</span>
            <span className="text-xs font-black text-amber-400 tracking-wider">
              {stats.highScore}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Floating Touch Area Prompt at Bottom */}
      {gameState === 'PLAYING' && (
        <div className="relative z-10 text-center pb-3 pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
          <span className="text-[10px] tracking-widest text-cyan-300 bg-slate-900/80 px-4 py-1.5 rounded-full border border-cyan-500/20">
            HOLD SCREEN OR SPACE TO FLOAT • RELEASE TO FALL
          </span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MENU SCREEN OVERLAY (Start Screen) */}
      {/* ============================================================ */}
      {gameState === 'MENU' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/75 backdrop-blur-xs text-center">
          {/* Cyber Thai Glow Banner */}
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/95 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-500/20 flex flex-col items-center">
            {/* Thai Cyber Emblem */}
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border-2 border-cyan-400 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
              <span className="text-3xl">🐒</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 tracking-wider">
              THAI FUTURE FLYER
            </h1>

            <p className="text-xs sm:text-sm text-cyan-400 font-bold tracking-widest mt-1 mb-6 uppercase">
              "FLOAT THROUGH THE FUTURE"
            </p>

            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left text-xs text-slate-300 space-y-2 mb-6">
              <div className="flex items-center gap-2 text-cyan-300 font-bold">
                <Compass className="w-4 h-4 text-amber-400 shrink-0" />
                <span>HOW TO PLAY (วิธีเล่น)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                ควบคุมพลังลอยตัวทะลุสกายบริดจ์กรุงเทพฯ ชมวิววัดอรุณ เสาชิงช้า และโฮโลแกรมยักษ์ไซเบอร์! หลบเสาเลเซอร์ 3 ลำแสง เลื่อยหมุนคาดแถบเหลืองดำ สายฟ้าฟาด โดรนตรวจจับ และลูกตุ้มหนาม
              </p>
              <div className="flex items-center justify-between gap-1 py-1.5 px-2 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-[10px]">
                <span className="text-cyan-300 font-bold">🍌 ไซเบอร์บานาน่า:</span>
                <span className="text-slate-300">เกราะหกเหลี่ยม ⬢ | เรดาร์แม่เหล็ก ⌖ | ดาวโบนัส ✨ | บูสต์สปีด ⚡</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[10px]">
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-cyan-400 font-bold block">💻 PC / Keyboard</span>
                  <span className="text-slate-300">Space / Mouse ค้าง = ลอยตัว</span>
                </div>
                <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-amber-400 font-bold block">📱 Mobile</span>
                  <span className="text-slate-300">แตะหน้าจอค้าง = ลอยตัว</span>
                </div>
              </div>
            </div>

            {/* Big Play Button */}
            <button
              onClick={startNewGame}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-widest text-base shadow-lg shadow-cyan-500/30 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>[ PLAY GAME ]</span>
            </button>

            <p className="text-[10px] text-slate-400 mt-4 tracking-wider">
              Hold to Float • Release to Fall
            </p>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. PAUSE SCREEN OVERLAY */}
      {/* ============================================================ */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xs text-center">
          <div className="max-w-xs w-full p-6 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl flex flex-col items-center">
            <h2 className="text-xl font-black text-cyan-300 tracking-widest mb-4">GAME PAUSED</h2>

            <div className="w-full space-y-3">
              <button
                onClick={togglePause}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md cursor-pointer"
              >
                RESUME
              </button>
              <button
                onClick={startNewGame}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-sm cursor-pointer"
              >
                RESTART
              </button>
              <button
                onClick={() => {
                  audioRef.current.stopFloatSound();
                  onBackToHub();
                }}
                className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold cursor-pointer"
              >
                EXIT TO HUB
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. GAME OVER SCREEN OVERLAY */}
      {/* ============================================================ */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-slate-950/85 backdrop-blur-xs text-center animate-fade-in">
          <div className="max-w-sm w-full p-8 rounded-3xl bg-slate-900 border-2 border-rose-500/50 shadow-2xl shadow-rose-950/50 flex flex-col items-center">
            {/* Header Title */}
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-3">
              <span className="text-2xl">💥</span>
            </div>

            <h2 className="text-2xl font-black text-rose-400 tracking-widest">GAME OVER</h2>

            {stats.isNewHighScore && (
              <div className="my-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-bounce">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>NEW HIGH SCORE RECORD!</span>
              </div>
            )}

            {/* Scoreboard Result Box */}
            <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 my-4 space-y-2 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">SCORE:</span>
                <span className="font-black text-cyan-300 text-sm tracking-wider">
                  {String(Math.floor(stats.score)).padStart(6, '0')}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">BANANAS COLLECTED:</span>
                <span className="font-black text-amber-400 text-sm tracking-wider">
                  🍌 {stats.bananasCollected}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">DISTANCE REACHED:</span>
                <span className="font-black text-purple-300 text-sm tracking-wider">
                  {stats.distanceMeters}m
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-amber-500 font-bold">ALL-TIME BEST:</span>
                <span className="font-black text-amber-300 text-sm tracking-wider">
                  {stats.highScore}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2.5">
              <button
                onClick={startNewGame}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-wider text-sm shadow-lg shadow-cyan-500/30 hover:scale-102 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>[ PLAY AGAIN ]</span>
              </button>

              <button
                onClick={() => {
                  audioRef.current.stopFloatSound();
                  onBackToHub();
                }}
                className="w-full py-2.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold cursor-pointer transition-colors"
              >
                [ MAIN MENU ]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Portrait Orientation Prompt */}
      {isPortrait && !dismissOrientationWarning && (
        <div className="absolute inset-0 z-40 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-2xl mb-4 animate-pulse">
            🔄
          </div>
          <h3 className="text-base font-black text-cyan-300 tracking-wider mb-2">
            ROTATE YOUR DEVICE
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
            เกมนี้ออกแบบมาให้เล่นในแนวนอน (Landscape) เพื่อมุมมองเมืองไซเบอร์ไทยแลนด์ที่กว้างขึ้น
          </p>
          <button
            onClick={() => setDismissOrientationWarning(true)}
            className="px-5 py-2 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-bold hover:bg-cyan-500/20 cursor-pointer"
          >
            เล่นในแนวตั้งต่อไป
          </button>
        </div>
      )}
    </div>
  );
};
