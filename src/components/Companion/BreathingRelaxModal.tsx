import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Wind, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CompanionCharacterSprite } from './CompanionCharacterSprite';
import { CompanionService } from '../../lib/companionEvents';

interface BreathingRelaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export const BreathingRelaxModal: React.FC<BreathingRelaxModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const TOTAL_SECONDS = 30;
  const [secondsRemaining, setSecondsRemaining] = useState(TOTAL_SECONDS);
  const [isFinished, setIsFinished] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setSecondsRemaining(TOTAL_SECONDS);
      setIsFinished(false);
      setPhase('inhale');
      CompanionService.playSound('relax_chime');
    }
  }, [isOpen]);

  // 30-second Countdown Timer
  useEffect(() => {
    if (!isOpen || isFinished) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
              colors: ['#38bdf8', '#34d399', '#fcd34d', '#818cf8'],
            });
          } catch {
            // ignore
          }
          CompanionService.playSound('success');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isFinished]);

  // Breathing Loop: Inhale (4s) -> Hold (4s) -> Exhale (6s) -> Rest (2s) = 16s cycle
  useEffect(() => {
    if (!isOpen || isFinished) return;

    const elapsed = TOTAL_SECONDS - secondsRemaining;
    const cycleTime = elapsed % 16;

    if (cycleTime < 4) {
      setPhase('inhale');
    } else if (cycleTime < 8) {
      setPhase('hold');
    } else if (cycleTime < 14) {
      setPhase('exhale');
    } else {
      setPhase('rest');
    }
  }, [secondsRemaining, isOpen, isFinished]);

  if (!isOpen) return null;

  const phaseDetails = {
    inhale: {
      text: 'หายใจเข้าลึก ๆ ช้า ๆ...',
      subtext: 'สูดอากาศบริสุทธิ์ ให้หน้าอกและท้องค่อย ๆ พองขึ้น',
      color: 'from-sky-400 to-teal-400',
      scale: 1.45,
    },
    hold: {
      text: 'กลั้นหายใจเบา ๆ อย่างผ่อนคลาย...',
      subtext: 'รับรู้ความนิ่งและปล่อยวางความกังวล',
      color: 'from-teal-400 to-emerald-400',
      scale: 1.45,
    },
    exhale: {
      text: 'ค่อย ๆ ผ่อนลมหายใจออก...',
      subtext: 'ระบายความตึงเครียดและความเมื่อยล้าออกไปทั้งหมด',
      color: 'from-indigo-400 to-sky-400',
      scale: 0.9,
    },
    rest: {
      text: 'พักสบาย ๆ พร้อมเริ่มรอบถัดไป...',
      subtext: 'คลายไหล่ ผ่อนสายตา สบายตัวขึ้น',
      color: 'from-amber-400 to-sky-400',
      scale: 1.0,
    },
  }[phase];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Calming Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden text-center p-6 sm:p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sky-600 font-bold text-sm">
              <Wind className="w-5 h-5 text-sky-500 animate-pulse" />
              <span>โหมดพักผ่อน & ฝึกการหายใจ (Breathing Exercise)</span>
            </div>
            <button
              onClick={onClose}
              aria-label="ปิด"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isFinished ? (
            <>
              {/* Interactive Breathing Canvas */}
              <div className="relative w-64 h-64 mx-auto my-4 flex items-center justify-center">
                {/* Outer Breathing Circle Animation */}
                <motion.div
                  animate={{
                    scale: phaseDetails.scale,
                    boxShadow:
                      phase === 'inhale' || phase === 'hold'
                        ? '0 0 45px rgba(56, 189, 248, 0.45)'
                        : '0 0 15px rgba(99, 102, 241, 0.2)',
                  }}
                  transition={{
                    duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 1.2,
                    ease: 'easeInOut',
                  }}
                  className={`w-44 h-44 rounded-full bg-gradient-to-tr ${phaseDetails.color} opacity-25 absolute blur-xs`}
                />

                <motion.div
                  animate={{
                    scale: phaseDetails.scale,
                  }}
                  transition={{
                    duration: phase === 'inhale' ? 4 : phase === 'exhale' ? 6 : 1.2,
                    ease: 'easeInOut',
                  }}
                  className={`w-36 h-36 rounded-full border-2 border-sky-300/80 bg-gradient-to-br from-sky-50 to-teal-50/50 flex items-center justify-center relative shadow-inner`}
                >
                  {/* Companion in Relax Pose */}
                  <div className="relative z-10 scale-110">
                    <CompanionCharacterSprite mood="relax" size={64} />
                  </div>
                </motion.div>

                {/* Floating soft particle ring */}
                <div className="absolute inset-0 border border-dashed border-sky-200/60 rounded-full animate-spin [animation-duration:28s] pointer-events-none" />
              </div>

              {/* Instructional Text */}
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1.5 min-h-[70px]"
              >
                <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
                  {phaseDetails.text}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {phaseDetails.subtext}
                </p>
              </motion.div>

              {/* Timer Bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="font-semibold text-sky-700">
                  เวลาที่เหลือ: <span className="text-base font-extrabold">{secondsRemaining}</span> วินาที
                </span>
                <button
                  onClick={() => {
                    setIsFinished(true);
                    onComplete();
                  }}
                  className="text-xs text-slate-400 hover:text-slate-700 underline cursor-pointer"
                >
                  ข้ามการพักผ่อน
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                <motion.div
                  className="h-full bg-gradient-to-r from-sky-400 to-teal-400 rounded-full"
                  style={{ width: `${((TOTAL_SECONDS - secondsRemaining) / TOTAL_SECONDS) * 100}%` }}
                />
              </div>
            </>
          ) : (
            // Completed State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-6 space-y-4"
            >
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="flex justify-center">
                <CompanionCharacterSprite mood="happy" size={72} />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-800">
                  เก่งมาก! พักสายตาและผ่อนคลายเรียบร้อยแล้ว ✨
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  สมองได้รับการพักผ่อน กล้ามเนื้อผ่อนคลาย พร้อมกลับไปลุยทำข้อสอบและเรียนรู้ต่อด้วยสมาธิที่ดีเยี่ยมครับ!
                </p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onComplete();
                }}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>พร้อมเรียนต่อแล้ว!</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
