import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Wind, Settings2, EyeOff, Gamepad2 } from 'lucide-react';
import { CompanionCharacterSprite } from './CompanionCharacterSprite';
import { BreathingRelaxModal } from './BreathingRelaxModal';
import { CompanionSettingsModal } from './CompanionSettingsModal';
import {
  CompanionConfig,
  CompanionMood,
  CompanionReactionPayload,
  CompanionService,
} from '../../lib/companionEvents';

const ENCOURAGEMENT_MESSAGES = [
  'ทุกข้อที่ทำ คือความก้าวหน้าของคุณนะ ✨',
  'จำไว้ว่า ความพยายามไม่เคยทรยศใคร 🌟',
  'เก่งมากเลย! พยายามต่อไปนะคนเก่ง 😊',
  'เหนื่อยไหม? สู้ ๆ นะ อีกนิดเดียวจะเก่งขึ้นแล้ว 💪',
  'ค่อย ๆ ทำความเข้าใจ ไม่ต้องรีบเลยครับ 💡',
  'สมองกำลังพัฒนาทุกครั้งที่ฝึกทำโจทย์นะ! 🚀',
  'พักสายตาสักครู่ แล้วมาลุยกันต่อนะ 💧',
  'เพื่อนตัวน้อยเป็นกำลังใจให้อยู่ตรงนี้นะ สู้ๆ! 🎉',
  'ทำได้ดีมาก วันนี้ก้าวหน้าขึ้นอีกขั้นแล้ว 🌈',
  'ถ้าเจอโจทย์ยาก ค่อยๆ คิดแยกทีละขั้นตอนนะ 🎯',
  'หายใจเข้าลึกๆ ผ่อนคลาย แล้วไปต่อกันเลย! 🌿',
  'คุณทำได้แน่นอน! มั่นใจในศักยภาพตัวเองนะ 💫',
  'สะสมความรู้ทีละนิด ก้าวสู่เป้าหมายที่ตั้งใจ 📚',
  'มีสมาธิ และเชื่อมั่นในตัวเองนะคนเก่ง 💖',
];

interface PixelCompanionProps {
  currentTab?: string;
  onNavigateToMiniGame?: () => void;
}

export const PixelCompanion: React.FC<PixelCompanionProps> = ({ currentTab, onNavigateToMiniGame }) => {
  // If user is currently on the Mini-Game screen, completely hide the companion
  if (currentTab === 'minigame' || currentTab === 'games') {
    return null;
  }

  // Load Configuration
  const [config, setConfig] = useState<CompanionConfig>(() => CompanionService.getConfig());
  const [isRelaxOpen, setIsRelaxOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Position & Movement States
  // Displayed at the top band of the screen (e.g. Y between 12px and 85px)
  // X between 20px and screen width - width
  const [posX, setPosX] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Math.max(40, Math.min(window.innerWidth - 120, 240));
    }
    return 100;
  });
  const [posY, setPosY] = useState<number>(20);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [mood, setMood] = useState<CompanionMood>('idle');

  // Speech Bubble & Dialogue State
  const [speechText, setSpeechText] = useState<string | null>(null);
  const [showRelaxPromptInBubble, setShowRelaxPromptInBubble] = useState<boolean>(false);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resumeWanderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dragging support
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startPosX: number; startPosY: number } | null>(null);
  const hasDraggedRef = useRef<boolean>(false);

  // Periodic Encouragement Message every 15 seconds
  useEffect(() => {
    if (!config.enabled || !config.encouragementEnabled) {
      return;
    }

    const encouragementInterval = setInterval(() => {
      // Don't interrupt if user is actively dragging or in guided breathing relaxation
      if (isDragging || isRelaxOpen) return;

      // Pick a random encouragement message (preferably different from the previous one)
      setSpeechText((prev) => {
        let available = ENCOURAGEMENT_MESSAGES;
        if (prev) {
          available = ENCOURAGEMENT_MESSAGES.filter((m) => m !== prev);
        }
        const nextMsg = available[Math.floor(Math.random() * available.length)];
        return nextMsg;
      });

      setShowRelaxPromptInBubble(false);
      setMood('happy');
      CompanionService.playSound('pop');

      if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = setTimeout(() => {
        setSpeechText(null);
        setMood('idle');
      }, 5500); // Display for 5.5s for comfortable reading
    }, 15000); // Every 15 seconds

    return () => {
      clearInterval(encouragementInterval);
    };
  }, [config.enabled, config.encouragementEnabled, isDragging, isRelaxOpen]);

  // Continuous study timer (20 minutes reminder)
  useEffect(() => {
    const studyInterval = setInterval(() => {
      if (config.enabled && config.encouragementEnabled) {
        setMood('idle');
        setSpeechText('คุณเรียนมาสักพักแล้ว พักสายตาและผ่อนคลายสักครู่ไหมครับ 💧');
        setShowRelaxPromptInBubble(true);
        CompanionService.playSound('pop');
        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = setTimeout(() => {
          setSpeechText(null);
          setShowRelaxPromptInBubble(false);
        }, 8000);
      }
    }, 20 * 60 * 1000); // 20 minutes

    return () => clearInterval(studyInterval);
  }, [config.enabled, config.encouragementEnabled]);

  // Subscribe to config changes
  useEffect(() => {
    const unsubscribe = CompanionService.subscribeConfig((newConf) => {
      setConfig(newConf);
    });
    return unsubscribe;
  }, []);

  // Subscribe to external learning & system reactions
  useEffect(() => {
    const unsubscribe = CompanionService.subscribeReaction((payload: CompanionReactionPayload) => {
      if (!config.enabled) return;

      setMood(payload.mood);
      setIsMoving(false);

      if (payload.message && config.encouragementEnabled) {
        setSpeechText(payload.message);
        setShowRelaxPromptInBubble(false);
        CompanionService.playSound(payload.mood === 'happy' || payload.mood === 'excited' ? 'success' : 'pop');

        if (speechTimeoutRef.current) clearTimeout(speechTimeoutRef.current);
        speechTimeoutRef.current = setTimeout(() => {
          setSpeechText(null);
          setMood('idle');
        }, payload.durationMs || 3500);
      }

      if (resumeWanderTimeoutRef.current) clearTimeout(resumeWanderTimeoutRef.current);
      resumeWanderTimeoutRef.current = setTimeout(() => {
        setMood('idle');
      }, (payload.durationMs || 3500) + 1000);
    });

    return unsubscribe;
  }, [config.enabled, config.encouragementEnabled]);

  // Size mapping
  const spriteSize = config.size === 'sm' ? 52 : config.size === 'md' ? 68 : 84;

  // Speed multiplier
  const speedFactor = config.speed === 'slow' ? 0.6 : config.speed === 'fast' ? 1.4 : 1.0;

  // Natural Random Wandering AI
  useEffect(() => {
    if (!config.enabled || isDragging || isRelaxOpen || speechText !== null || mood === 'sleep' || mood === 'relax') {
      setIsMoving(false);
      return;
    }

    let isCancelled = false;
    let wanderTimeout: NodeJS.Timeout | null = null;
    let moveInterval: NodeJS.Timeout | null = null;

    const scheduleNextDecision = () => {
      if (isCancelled) return;

      // Random wait between 2.5s and 6s
      const waitTime = Math.random() * 3500 + 2500;
      wanderTimeout = setTimeout(() => {
        if (isCancelled) return;

        // Choose behavior: 65% chance wander, 25% idle/look around, 10% sleepy yawn
        const roll = Math.random();

        if (roll < 0.1) {
          // Sleepy yawn/stretch
          setMood('sleep');
          setIsMoving(false);
          wanderTimeout = setTimeout(() => {
            if (!isCancelled) {
              setMood('idle');
              scheduleNextDecision();
            }
          }, 4000);
          return;
        }

        if (roll < 0.35) {
          // Just pause and be idle
          setMood('idle');
          setIsMoving(false);
          scheduleNextDecision();
          return;
        }

        // Wander to a new target within the top band
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1000;
        // Keep inside top header area: X between 40 and screenW - spriteSize - 40, Y between 10 and 80
        const minX = 30;
        const maxX = Math.max(minX + 100, screenW - spriteSize - 40);
        const targetX = Math.floor(Math.random() * (maxX - minX) + minX);
        const targetY = Math.floor(Math.random() * 65 + 15); // Y between 15px and 80px

        const deltaX = targetX - posX;
        const deltaY = targetY - posY;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance < 20) {
          scheduleNextDecision();
          return;
        }

        // Set facing direction
        const nextDir = deltaX > 0 ? 'right' : 'left';
        setDirection(nextDir);
        setIsMoving(true);
        setMood('walk');

        // Step movement with smooth frame interval
        const stepSpeed = 1.6 * speedFactor;
        const totalSteps = Math.ceil(distance / stepSpeed);
        let currentStep = 0;

        const startX = posX;
        const startY = posY;

        moveInterval = setInterval(() => {
          if (isCancelled) {
            if (moveInterval) clearInterval(moveInterval);
            return;
          }

          currentStep++;
          const progress = currentStep / totalSteps;
          const currentX = startX + deltaX * progress;
          const currentY = startY + deltaY * progress;

          setPosX(currentX);
          setPosY(currentY);

          if (currentStep >= totalSteps) {
            if (moveInterval) clearInterval(moveInterval);
            setIsMoving(false);
            setMood('idle');
            scheduleNextDecision();
          }
        }, 32); // ~30fps smooth stepping
      }, waitTime);
    };

    scheduleNextDecision();

    return () => {
      isCancelled = true;
      if (wanderTimeout) clearTimeout(wanderTimeout);
      if (moveInterval) clearInterval(moveInterval);
    };
  }, [config.enabled, isDragging, isRelaxOpen, speechText, mood, posX, posY, spriteSize, speedFactor]);

  // Handle companion click/tap interaction
  const handleCompanionClick = useCallback(() => {
    if (hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    // Stop moving, play lively sound, and cheer
    setIsMoving(false);
    setMood('happy');
    CompanionService.playSound('cheer');

    // Directly navigate to Mini-Game page
    if (onNavigateToMiniGame) {
      onNavigateToMiniGame();
    }
  }, [onNavigateToMiniGame]);

  // Pointer drag events so user can reposition companion if desired
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPosX: posX,
      startPosY: posY,
    };
    hasDraggedRef.current = false;
    setIsDragging(true);
    setIsMoving(false);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      hasDraggedRef.current = true;
    }

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const newX = Math.max(10, Math.min(screenW - spriteSize - 10, dragStartRef.current.startPosX + dx));
    const newY = Math.max(10, Math.min(screenH - spriteSize - 60, dragStartRef.current.startPosY + dy));

    setPosX(newX);
    setPosY(newY);
    if (dx !== 0) {
      setDirection(dx > 0 ? 'right' : 'left');
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  if (!config.enabled) {
    // Show a tiny discreet toggle button in the bottom corner so users can easily re-enable companion
    return (
      <>
        <button
          onClick={() => {
            const updated = { ...config, enabled: true };
            setConfig(updated);
            CompanionService.saveConfig(updated);
            CompanionService.playSound('pop');
          }}
          title="เปิดแสดง AI Pixel Companion"
          className="fixed bottom-3 right-3 z-40 p-2.5 bg-white/90 hover:bg-white text-slate-600 hover:text-blue-600 rounded-full shadow-lg border border-slate-200 transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <CompanionCharacterSprite mood="happy" size={24} />
          </div>
          <span className="hidden sm:inline">เปิด Companion</span>
        </button>
      </>
    );
  }

  return (
    <>
      {/* Companion Floating Element */}
      <div
        id="pixel-art-companion"
        style={{
          position: 'fixed',
          left: `${posX}px`,
          top: `${posY}px`,
          zIndex: 45,
          touchAction: 'none',
        }}
        className="group select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Interactive Speech Bubble */}
        <AnimatePresence>
          {speechText && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 5, scale: 0.85 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max max-w-[240px] sm:max-w-[280px] bg-white/95 backdrop-blur-md text-slate-800 px-3.5 py-2 rounded-2xl shadow-xl border border-sky-100 text-xs font-medium pointer-events-auto cursor-default z-50 text-center"
            >
              <p className="leading-snug">{speechText}</p>

              {/* Extra button if prompted to relax */}
              {showRelaxPromptInBubble && (
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSpeechText(null);
                      setIsRelaxOpen(true);
                    }}
                    className="px-2.5 py-1 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded-lg text-[11px] font-bold shadow-xs hover:brightness-105 cursor-pointer flex items-center gap-1"
                  >
                    <Wind className="w-3 h-3" />
                    <span>เริ่มพัก 30 วินาที</span>
                  </button>
                </div>
              )}

              {/* Speech bubble tail pointer */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-solid border-t-white/95 border-t-8 border-x-transparent border-x-6 border-b-0 filter drop-shadow-xs" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hover/Tap Quick Action Pill (Games, Relax & Settings) */}
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-900/85 backdrop-blur-xs px-2 py-0.5 rounded-full text-white text-[10px] pointer-events-auto whitespace-nowrap shadow-md">
          {onNavigateToMiniGame && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateToMiniGame();
                }}
                title="ไปที่หน้ามินิเกม"
                className="flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer px-1 py-0.5"
              >
                <Gamepad2 className="w-3 h-3 text-amber-400" />
                <span>มินิเกม</span>
              </button>
              <span className="text-slate-500">|</span>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsRelaxOpen(true);
            }}
            title="เริ่มฝึกหายใจคลายเครียด 30 วินาที"
            className="flex items-center gap-1 hover:text-sky-300 transition-colors cursor-pointer px-1 py-0.5"
          >
            <Wind className="w-3 h-3 text-sky-400" />
            <span>พักผ่อน</span>
          </button>
          <span className="text-slate-500">|</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSettingsOpen(true);
            }}
            title="ตั้งค่า Companion"
            className="p-1 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3 h-3" />
          </button>
        </div>

        {/* Character Sprite with Click Trigger */}
        <div
          onClick={handleCompanionClick}
          className="cursor-pointer active:scale-95 transition-transform relative"
          title="เพื่อนตัวน้อย (Study Buddy) - คลิกเพื่อไปหน้ามินิเกม หรือลากเพื่อย้ายตำแหน่ง"
        >
          <CompanionCharacterSprite
            mood={mood}
            direction={direction}
            isMoving={isMoving}
            size={spriteSize}
          />
        </div>
      </div>

      {/* 30-Second Guided Breathing Relaxation Modal */}
      <BreathingRelaxModal
        isOpen={isRelaxOpen}
        onClose={() => setIsRelaxOpen(false)}
        onComplete={() => {
          setIsRelaxOpen(false);
          setMood('happy');
          setSpeechText('รู้สึกสดชื่นแล้วใช่ไหมครับ! พร้อมลุยต่อเลย ✨');
          CompanionService.playSound('success');
          setTimeout(() => {
            setSpeechText(null);
            setMood('idle');
          }, 3500);
        }}
      />

      {/* Companion Settings Modal */}
      <CompanionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onUpdateConfig={setConfig}
        onOpenRelaxModal={() => setIsRelaxOpen(true)}
      />
    </>
  );
};
