import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings2, Volume2, VolumeX, MessageSquare, Sparkles, Gauge, Maximize2 } from 'lucide-react';
import { CompanionConfig, CompanionService } from '../../lib/companionEvents';
import { CompanionCharacterSprite } from './CompanionCharacterSprite';

interface CompanionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CompanionConfig;
  onUpdateConfig: (newConfig: CompanionConfig) => void;
  onOpenRelaxModal: () => void;
}

export const CompanionSettingsModal: React.FC<CompanionSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onOpenRelaxModal,
}) => {
  if (!isOpen) return null;

  const handleToggle = (key: keyof CompanionConfig, val: boolean) => {
    const updated = { ...config, [key]: val };
    onUpdateConfig(updated);
    CompanionService.saveConfig(updated);
    if (key === 'soundEnabled' && val) {
      CompanionService.playSound('pop');
    }
  };

  const handleChangeSize = (size: 'sm' | 'md' | 'lg') => {
    const updated = { ...config, size };
    onUpdateConfig(updated);
    CompanionService.saveConfig(updated);
    CompanionService.playSound('pop');
  };

  const handleChangeSpeed = (speed: 'slow' | 'normal' | 'fast') => {
    const updated = { ...config, speed };
    onUpdateConfig(updated);
    CompanionService.saveConfig(updated);
    CompanionService.playSound('pop');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left p-5 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Settings2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">ตั้งค่า AI Companion</h3>
                <p className="text-[11px] text-slate-500">เพื่อนคู่คิดตัวละคร Pixel Art ลดความเครียด</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="ปิด"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preview Badge */}
          <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <CompanionCharacterSprite
                mood="happy"
                size={config.size === 'sm' ? 44 : config.size === 'md' ? 52 : 60}
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">เพื่อนตัวน้อย (Study Buddy)</span>
                <span className="text-[10px] text-slate-500">กำลังเดินทางบนหน้าจออย่างนุ่มนวล</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenRelaxModal();
              }}
              className="px-2.5 py-1.5 bg-gradient-to-r from-sky-500 to-teal-500 text-white text-[11px] font-bold rounded-lg shadow-xs hover:brightness-105 transition-all cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>พักผ่อน 30s</span>
            </button>
          </div>

          {/* Setting Items */}
          <div className="space-y-3 text-xs">
            {/* 1. Toggle On/Off */}
            <div className="flex items-center justify-between py-1">
              <div>
                <span className="font-semibold text-slate-800 block">แสดงตัวละคร Companion</span>
                <span className="text-[10px] text-slate-500">เปิดหรือปิดการแสดงตัวละครบนหน้าจอ</span>
              </div>
              <button
                onClick={() => handleToggle('enabled', !config.enabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  config.enabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    config.enabled ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 2. Character Size */}
            <div className="space-y-1.5 py-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Maximize2 className="w-3.5 h-3.5 text-slate-500" />
                <span>ขนาดตัวละคร (Size)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'sm', label: 'เล็ก (48px)' },
                  { key: 'md', label: 'กลาง (64px)' },
                  { key: 'lg', label: 'ใหญ่ (80px)' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleChangeSize(s.key as 'sm' | 'md' | 'lg')}
                    className={`py-1.5 px-2 rounded-lg text-center font-medium border text-[11px] transition-all cursor-pointer ${
                      config.size === s.key
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Movement Speed */}
            <div className="space-y-1.5 py-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <Gauge className="w-3.5 h-3.5 text-slate-500" />
                <span>ความเร็วการเดิน (Speed)</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: 'slow', label: 'ช้าสบาย ๆ' },
                  { key: 'normal', label: 'ปานกลาง' },
                  { key: 'fast', label: 'ว่องไว' },
                ].map((sp) => (
                  <button
                    key={sp.key}
                    onClick={() => handleChangeSpeed(sp.key as 'slow' | 'normal' | 'fast')}
                    className={`py-1.5 px-2 rounded-lg text-center font-medium border text-[11px] transition-all cursor-pointer ${
                      config.speed === sp.key
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Encouragement Messages */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                <div>
                  <span className="font-semibold text-slate-800 block">ข้อความให้กำลังใจ</span>
                  <span className="text-[10px] text-slate-500">แสดงกล่องคำพูดเมื่อแตะ หรือขณะเรียน</span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('encouragementEnabled', !config.encouragementEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  config.encouragementEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    config.encouragementEnabled ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* 5. Sound Effects */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {config.soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <div>
                  <span className="font-semibold text-slate-800 block">เสียงเอฟเฟกต์ (Sound FX)</span>
                  <span className="text-[10px] text-slate-500">เสียงป๊อป เสียงกระดิ่ง และเสียงผ่อนคลาย</span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('soundEnabled', !config.soundEnabled)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                  config.soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    config.soundEnabled ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              บันทึกและปิด
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
