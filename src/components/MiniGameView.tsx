import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Clock,
  Flame,
  Award,
  ChevronRight,
  HelpCircle,
  BookOpen,
  Calculator,
  Compass,
  ArrowRight,
  Star,
  Shuffle,
  ShieldAlert,
  GraduationCap,
  Play,
  ArrowLeft,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';
import { ThaiFutureFlyerGame } from './ThaiFutureFlyer/ThaiFutureFlyerGame';

// Sound Synthesizer using Web Audio API (Zero external assets needed)
class SoundFX {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    // Lazy audio context init
  }

  setMuted(mute: boolean) {
    this.muted = mute;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playCorrect() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  playWrong() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.linearRampToValueAtTime(140, now + 0.18);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (_) {}
  }

  playFlip() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch (_) {}
  }

  playCombo() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.12, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } catch (_) {}
  }

  playGameOver() {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.4);
      });
    } catch (_) {}
  }
}

const sfx = new SoundFX();

// Game Types
type GameMode = 'hub' | 'speed_math' | 'memory_match' | 'speed_quiz' | 'vocab_sprint' | 'thai_future_flyer';

// -------------------------------------------------------------
// GAME 1 DATA & GENERATOR: Speed Math
// -------------------------------------------------------------
interface MathProblem {
  question: string;
  latex?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function generateMathProblem(level: 'easy' | 'medium' | 'hard'): MathProblem {
  const r = Math.random();

  if (level === 'easy') {
    if (r < 0.35) {
      // Basic 2-digit addition / subtraction
      const a = Math.floor(Math.random() * 80) + 12;
      const b = Math.floor(Math.random() * 80) + 8;
      const isAdd = Math.random() > 0.5;
      const ans = isAdd ? a + b : a - b;
      const opts = [
        String(ans),
        String(ans + (Math.random() > 0.5 ? 10 : -10)),
        String(ans + (Math.random() > 0.5 ? 2 : -2)),
        String(ans + (Math.random() > 0.5 ? 5 : -5)),
      ];
      // shuffle
      const uniqueOpts = Array.from(new Set(opts));
      while (uniqueOpts.length < 4) uniqueOpts.push(String(ans + uniqueOpts.length * 3));
      const shuffled = uniqueOpts.sort(() => Math.random() - 0.5);
      return {
        question: `คำนวณค่าของ: ${a} ${isAdd ? '+' : '-'} ${b}`,
        latex: `${a} ${isAdd ? '+' : '-'} ${b} = ?`,
        options: shuffled,
        correctIndex: shuffled.indexOf(String(ans)),
        explanation: `${a} ${isAdd ? '+' : '-'} ${b} = ${ans}`,
      };
    } else if (r < 0.7) {
      // Multiplication table & division
      const a = Math.floor(Math.random() * 11) + 3;
      const b = Math.floor(Math.random() * 9) + 4;
      const prod = a * b;
      const isDiv = Math.random() > 0.5;
      if (isDiv) {
        const ans = a;
        const opts = [String(ans), String(ans + 1), String(ans - 1 || 2), String(ans + 2)].sort(
          () => Math.random() - 0.5
        );
        return {
          question: `คำนวณค่าของ: ${prod} ÷ ${b}`,
          latex: `\\frac{${prod}}{${b}} = ?`,
          options: opts,
          correctIndex: opts.indexOf(String(ans)),
          explanation: `${prod} ÷ ${b} = ${ans}`,
        };
      } else {
        const ans = prod;
        const opts = [
          String(ans),
          String(ans + b),
          String(ans - b || ans + 2),
          String(ans + 10),
        ].sort(() => Math.random() - 0.5);
        return {
          question: `คำนวณค่าของ: ${a} × ${b}`,
          latex: `${a} \\times ${b} = ?`,
          options: opts,
          correctIndex: opts.indexOf(String(ans)),
          explanation: `${a} × ${b} = ${ans}`,
        };
      }
    } else {
      // Perfect squares
      const num = Math.floor(Math.random() * 10) + 4;
      const sq = num * num;
      const ans = sq;
      const opts = [
        String(ans),
        String((num + 1) * (num + 1)),
        String((num - 1) * (num - 1)),
        String(ans + 10),
      ].sort(() => Math.random() - 0.5);
      return {
        question: `คำนวณค่าของ: ${num}²`,
        latex: `${num}^2 = ?`,
        options: opts,
        correctIndex: opts.indexOf(String(ans)),
        explanation: `${num} × ${num} = ${ans}`,
      };
    }
  } else if (level === 'medium') {
    if (r < 0.4) {
      // Linear equation: a*x + b = c
      const x = Math.floor(Math.random() * 9) + 2;
      const a = Math.floor(Math.random() * 6) + 2;
      const b = Math.floor(Math.random() * 15) + 3;
      const c = a * x + b;
      const ans = x;
      const opts = [String(ans), String(ans + 1), String(ans - 1 || 1), String(ans + 2)].sort(
        () => Math.random() - 0.5
      );
      return {
        question: `จงหาค่าของ x จากสมการ: ${a}x + ${b} = ${c}`,
        latex: `${a}x + ${b} = ${c} \\implies x = ?`,
        options: opts,
        correctIndex: opts.indexOf(String(ans)),
        explanation: `${a}x = ${c} - ${b} = ${c - b} \\implies x = ${ans}`,
      };
    } else if (r < 0.7) {
      // Percentage: P% of Total
      const percentages = [10, 20, 25, 50, 75];
      const p = percentages[Math.floor(Math.random() * percentages.length)];
      const totals = [40, 80, 120, 160, 200, 240, 300, 400];
      const total = totals[Math.floor(Math.random() * totals.length)];
      const ans = (p * total) / 100;
      const opts = [
        String(ans),
        String(ans + 10),
        String(ans - 10 > 0 ? ans - 10 : ans + 20),
        String(ans + 5),
      ].sort(() => Math.random() - 0.5);
      return {
        question: `คำนวณ ${p}% ของ ${total}`,
        latex: `${p}\\% \\text{ ของ } ${total} = ?`,
        options: opts,
        correctIndex: opts.indexOf(String(ans)),
        explanation: `(${p} / 100) × ${total} = ${ans}`,
      };
    } else {
      // Square roots
      const bases = [11, 12, 13, 14, 15, 16, 20, 25];
      const b = bases[Math.floor(Math.random() * bases.length)];
      const sq = b * b;
      const ans = b;
      const opts = [String(ans), String(ans + 1), String(ans - 1), String(ans + 2)].sort(
        () => Math.random() - 0.5
      );
      return {
        question: `คำนวณค่าของ: √${sq}`,
        latex: `\\sqrt{${sq}} = ?`,
        options: opts,
        correctIndex: opts.indexOf(String(ans)),
        explanation: `\\sqrt{${sq}} = ${ans}`,
      };
    }
  } else {
    // Hard: Exponents & Quadratic / Trigonometry basics
    if (r < 0.5) {
      const angles = [
        { label: '\\sin(30^\\circ)', val: '1/2' },
        { label: '\\cos(60^\\circ)', val: '1/2' },
        { label: '\\sin(90^\\circ)', val: '1' },
        { label: '\\cos(0^\\circ)', val: '1' },
        { label: '\\tan(45^\\circ)', val: '1' },
        { label: '\\sin(45^\\circ)', val: '\\frac{\\sqrt{2}}{2}' },
        { label: '\\cos(30^\\circ)', val: '\\frac{\\sqrt{3}}{2}' },
        { label: '\\tan(60^\\circ)', val: '\\sqrt{3}' },
      ];
      const pick = angles[Math.floor(Math.random() * angles.length)];
      const choices = ['1/2', '1', '\\frac{\\sqrt{2}}{2}', '\\frac{\\sqrt{3}}{2}', '\\sqrt{3}', '0'];
      const wrong = choices.filter((c) => c !== pick.val).slice(0, 3);
      const allOpts = [pick.val, ...wrong].sort(() => Math.random() - 0.5);
      return {
        question: `จงหาค่าตรีโกณมิติของ ${pick.label}`,
        latex: `${pick.label} = ?`,
        options: allOpts,
        correctIndex: allOpts.indexOf(pick.val),
        explanation: `ค่าของ ${pick.label} มีค่าเท่ากับ ${pick.val}`,
      };
    } else {
      // Exponents power rule: 2^a * 2^b
      const a = Math.floor(Math.random() * 4) + 2;
      const b = Math.floor(Math.random() * 4) + 2;
      const ansExp = a + b;
      const opts = [`2^{${ansExp}}`, `2^{${a * b}}`, `4^{${ansExp}}`, `2^{${ansExp - 1}}`].sort(
        () => Math.random() - 0.5
      );
      return {
        question: `หาผลลัพธ์ของ 2^${a} × 2^${b}`,
        latex: `2^{${a}} \\times 2^{${b}} = ?`,
        options: opts,
        correctIndex: opts.indexOf(`2^{${ansExp}}`),
        explanation: `2^{${a}} \\times 2^{${b}} = 2^{${a}+${b}} = 2^{${ansExp}}`,
      };
    }
  }
}

// -------------------------------------------------------------
// GAME 2 DATA: Formula & Vocab Memory Match (16 Cards / 8 Pairs)
// -------------------------------------------------------------
interface MemoryCard {
  id: string;
  pairId: string;
  content: string;
  isLatex?: boolean;
  type: 'prompt' | 'target';
  isFlipped: boolean;
  isMatched: boolean;
}

const MEMORY_THEMES = [
  {
    id: 'math',
    name: 'สูตรคณิตศาสตร์ ม.ปลาย',
    icon: Calculator,
    pairs: [
      { id: 'm1', a: 'a^2 - b^2', b: '(a-b)(a+b)', latex: true },
      { id: 'm2', a: '(a+b)^2', b: 'a^2 + 2ab + b^2', latex: true },
      { id: 'm3', a: '\\sin^2\\theta + \\cos^2\\theta', b: '1', latex: true },
      { id: 'm4', a: '\\tan\\theta', b: '\\frac{\\sin\\theta}{\\cos\\theta}', latex: true },
      { id: 'm5', a: '\\log(ab)', b: '\\log a + \\log b', latex: true },
      { id: 'm6', a: 'S_n (เลขคณิต)', b: '\\frac{n}{2}(a_1 + a_n)', latex: true },
      { id: 'm7', a: 'c^2 (พีทาโกรัส)', b: 'a^2 + b^2', latex: true },
      { id: 'm8', a: '\\frac{d}{dx}(x^n)', b: 'nx^{n-1}', latex: true },
    ],
  },
  {
    id: 'physics',
    name: 'สูตรฟิสิกส์ & วิทย์ (TPAT3/A-Level)',
    icon: Compass,
    pairs: [
      { id: 'p1', a: 'แรงลัพธ์ (กฎนิวตัน)', b: 'F = ma', latex: true },
      { id: 'p2', a: 'พลังงานจลน์ (E_k)', b: '\\frac{1}{2}mv^2', latex: true },
      { id: 'p3', a: 'พลังงานศักย์โน้มถ่วง (E_p)', b: 'mgh', latex: true },
      { id: 'p4', a: 'ความเร็ว (v)', b: 'u + at', latex: true },
      { id: 'p5', a: 'กฎของโอห์ม (ไฟฟ้า)', b: 'V = IR', latex: true },
      { id: 'p6', a: 'กฎแก๊สสมบูรณ์แบบ', b: 'PV = nRT', latex: true },
      { id: 'p7', a: 'งาน (Work)', b: 'W = Fs\\cos\\theta', latex: true },
      { id: 'p8', a: 'กำลังไฟฟ้า (P)', b: 'IV = I^2R', latex: true },
    ],
  },
  {
    id: 'english',
    name: 'TGAT1 คำศัพท์อังกฤษออกบ่อย',
    icon: BookOpen,
    pairs: [
      { id: 'e1', a: 'Ubiquitous', b: 'มีอยู่ทุกหนทุกแห่ง', latex: false },
      { id: 'e2', a: 'Reluctant', b: 'ลังเล / ไม่เต็มใจ', latex: false },
      { id: 'e3', a: 'Deteriorate', b: 'ทรุดโทรม / แย่ลง', latex: false },
      { id: 'e4', a: 'Comprehensive', b: 'ครอบคลุม / สมบูรณ์', latex: false },
      { id: 'e5', a: 'Crucial / Vital', b: 'สำคัญยิ่งยวด', latex: false },
      { id: 'e6', a: 'Implement', b: 'นำไปปฏิบัติ / บังคับใช้', latex: false },
      { id: 'e7', a: 'Plausible', b: 'สมเหตุสมผล / เป็นไปได้', latex: false },
      { id: 'e8', a: 'Prohibit', b: 'ห้าม / ขัดขวาง', latex: false },
    ],
  },
];

// -------------------------------------------------------------
// GAME 3 DATA: Speed Quiz (Rapid 10-Second Trivia)
// -------------------------------------------------------------
interface SpeedQuizQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SPEED_QUIZ_BANK: SpeedQuizQuestion[] = [
  {
    id: 'sq-1',
    subject: 'TGAT2 การคิดอย่างมีเหตุผล',
    question: 'หากกำหนดให้ "นกทุกตัวบินได้" และ "เพนกวินเป็นนก" ข้อสรุปเชิงตรรกะแบบนิรนัยคือข้อใด?',
    options: ['เพนกวินบินได้', 'เพนกวินว่ายน้ำได้', 'นกบางตัวว่ายน้ำได้', 'ข้อความนี้ขัดแย้งกับหลักชีววิทยา'],
    correctIndex: 0,
    explanation: 'ตามหลักตรรกศาสตร์นิรนัย (Deductive Reasoning) เมื่อยอมรับข้อตั้งทั้งหมด ข้อสรุปต้องตามมาจากข้อตั้งอย่างสมเหตุสมผลคือ "เพนกวินบินได้"',
  },
  {
    id: 'sq-2',
    subject: 'เคมี (Chemistry)',
    question: 'สารละลายที่มีค่า pH = 3 มีคุณสมบัติความเป็นกรดหรือเบสอย่างไร?',
    options: ['เป็นกรด (Acidic)', 'เป็นเบส (Basic)', 'เป็นกลาง (Neutral)', 'เป็นเกลือที่ไม่ละลายน้ำ'],
    correctIndex: 0,
    explanation: 'สารละลายที่มี pH < 7 จะมีสมบัติเป็นกรด ยิ่งค่าน้อยยิ่งมีความเป็นกรดสูง',
  },
  {
    id: 'sq-3',
    subject: 'TGAT1 ภาษาอังกฤษ',
    question: 'Choose the correct form: "Neither of the candidates ______ qualified for the position."',
    options: ['is', 'are', 'were', 'have been'],
    correctIndex: 0,
    explanation: '"Neither of + plural noun" ถือเป็น Singular Subject จึงต้องใช้กริยาเอกพจน์ "is"',
  },
  {
    id: 'sq-4',
    subject: 'คณิตศาสตร์ (Math)',
    question: 'ลำดับเลขคณิต 3, 7, 11, 15, ... พจน์ที่ 10 (a₁₀) มีค่าเท่ากับเท่าใด?',
    options: ['39', '40', '43', '36'],
    correctIndex: 0,
    explanation: 'สูตร an = a1 + (n-1)d -> a10 = 3 + (9)(4) = 3 + 36 = 39',
  },
  {
    id: 'sq-5',
    subject: 'ชีววิทยา (Biology)',
    question: 'ออร์แกเนลล์ใดทำหน้าที่เปรียบเสมือน "โรงงานผลิตพลังงานไฟฟ้า (ATP)" ของเซลล์?',
    options: ['ไมโทคอนเดรีย (Mitochondria)', 'ไรโบโซม (Ribosome)', 'กอลจิบอดี (Golgi Body)', 'ไลโซโซม (Lysosome)'],
    correctIndex: 0,
    explanation: 'ไมโทคอนเดรียคือแหล่งสร้างพลังงานหลักในรูปของสาร ATP ผ่านกระบวนการหายใจระดับเซลล์',
  },
  {
    id: 'sq-6',
    subject: 'ฟิสิกส์ (Physics)',
    question: 'เมื่อปล่อยวัตถุตกแบบอิสระในสุญญากาศภายใต้แรงโน้มถ่วง ความเร่งของวัตถุจะมีค่าเท่าใด?',
    options: ['ประมาณ 9.8 m/s²', '0 m/s²', 'ขึ้นอยู่กับมวลของวัตถุ', 'เพิ่มขึ้นเรื่อยๆ ตามความเร็ว'],
    correctIndex: 0,
    explanation: 'ในสุญญากาศ วัตถุทุกชิ้นจะตกลงด้วยความเร่งโน้มถ่วง g ≈ 9.8 m/s² เท่ากันโดยไม่ขึ้นกับมวล',
  },
  {
    id: 'sq-7',
    subject: 'ภาษาไทย (A-Level)',
    question: 'คำในข้อใดเป็น "คำสมาสแบบมีสนธิ"?',
    options: ['มหาวิทยาลัย', 'ราชวัง', 'ผลไม้', 'รถเมล์'],
    correctIndex: 0,
    explanation: 'มหาวิทยาลัย มาจาก มหา + วิทยาลัย มีการเชื่อมเสียงสระเข้าด้วยกัน',
  },
  {
    id: 'sq-8',
    subject: 'สังคมศึกษา (Social)',
    question: 'แม่น้ำสายใดมีความยาวมากที่สุดในทวีปเอเชีย?',
    options: ['แม่น้ำแยงซีเกียง (Yangtze)', 'แม่น้ำคงคา (Ganges)', 'แม่น้ำโขง (Mekong)', 'แม่น้ำฮวงโห (Yellow River)'],
    correctIndex: 0,
    explanation: 'แม่น้ำแยงซีเกียงในประเทศจีนเป็นแม่น้ำที่ยาวที่สุดในทวีปเอเชีย และยาวเป็นอันดับ 3 ของโลก',
  },
];

// -------------------------------------------------------------
// GAME 4 DATA: TGAT Vocab Scramble
// -------------------------------------------------------------
interface VocabItem {
  word: string;
  meaning: string;
  partOfSpeech: string;
  clue: string;
  options: string[];
  correctIndex: number;
}

const VOCAB_SCRAMBLE_LIST: VocabItem[] = [
  {
    word: 'ADAPT',
    meaning: 'ปรับตัว / ปรับให้เหมาะสม',
    partOfSpeech: 'verb',
    clue: 'to change your behavior in order to deal more successfully with a new situation',
    options: ['ปรับตัว', 'ยอมจำนน', 'ทำลายล้าง', 'ปฏิเสธ'],
    correctIndex: 0,
  },
  {
    word: 'INNOVATE',
    meaning: 'สร้างสรรค์นวัตกรรมใหม่',
    partOfSpeech: 'verb',
    clue: 'to introduce new things, ideas, or ways of doing something',
    options: ['สร้างสิ่งใหม่', 'คัดลอกงาน', 'หยุดนิ่ง', 'เลียนแบบ'],
    correctIndex: 0,
  },
  {
    word: 'EFFICIENT',
    meaning: 'มีประสิทธิภาพสูง',
    partOfSpeech: 'adjective',
    clue: 'doing something in a good, careful and complete way with no waste of time, money or energy',
    options: ['มีประสิทธิภาพ', 'เชื่องช้า', 'สิ้นเปลือง', 'ขาดทุน'],
    correctIndex: 0,
  },
  {
    word: 'PERSISTENT',
    meaning: 'มุ่งมั่นไม่ยอมแพ้ / ยืนหยัด',
    partOfSpeech: 'adjective',
    clue: 'continuing for a long period of time without giving up',
    options: ['มุ่งมั่นยืนหยัด', 'ขี้เกียจ', 'ลังเลใจ', 'ยอมแพ้ง่าย'],
    correctIndex: 0,
  },
  {
    word: 'ACCURATE',
    meaning: 'ถูกต้องแม่นยำ',
    partOfSpeech: 'adjective',
    clue: 'correct and true in every detail',
    options: ['ถูกต้องแม่นยำ', 'คลาดเคลื่อน', 'สับสน', 'คาดเดา'],
    correctIndex: 0,
  },
];

export const MiniGameView: React.FC = () => {
  const [activeGame, setActiveGame] = useState<GameMode>('hub');
  const [soundMuted, setSoundMuted] = useState(false);

  // Persistent High Scores & Total XP
  const [totalXP, setTotalXP] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('ai_game_total_xp') || '450', 10);
    } catch {
      return 450;
    }
  });

  const [highScores, setHighScores] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('ai_game_high_scores') ||
          JSON.stringify({
            speed_math: 180,
            memory_match: 300,
            speed_quiz: 240,
            vocab_sprint: 210,
            thai_future_flyer: 850,
          })
      );
    } catch {
      return { speed_math: 180, memory_match: 300, speed_quiz: 240, vocab_sprint: 210, thai_future_flyer: 850 };
    }
  });

  const updateHighScore = (gameKey: string, score: number) => {
    setHighScores((prev) => {
      const current = prev[gameKey] || 0;
      if (score > current) {
        const next = { ...prev, [gameKey]: score };
        try {
          localStorage.setItem('ai_game_high_scores', JSON.stringify(next));
        } catch (_) {}
        return next;
      }
      return prev;
    });
    // Add XP
    setTotalXP((prev) => {
      const nextXP = prev + Math.max(10, Math.floor(score / 2));
      try {
        localStorage.setItem('ai_game_total_xp', String(nextXP));
      } catch (_) {}
      return nextXP;
    });
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sfx.setMuted(next);
  };

  // =========================================================================
  // SUB-GAME 1: SPEED MATH (60-second Rush)
  // =========================================================================
  const SpeedMathGame = () => {
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(1);
    const [maxCombo, setMaxCombo] = useState(1);
    const [timeLeft, setTimeLeft] = useState(45);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [currentProblem, setCurrentProblem] = useState<MathProblem | null>(null);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const timerRef = useRef<any>(null);

    const startNewGame = (lvl = difficulty) => {
      setDifficulty(lvl);
      setScore(0);
      setCombo(1);
      setMaxCombo(1);
      setTimeLeft(45);
      setIsGameOver(false);
      setIsPlaying(true);
      setSelectedOpt(null);
      setIsAnswered(false);
      setCurrentProblem(generateMathProblem(lvl));
    };

    // Timer loop
    useEffect(() => {
      if (isPlaying && timeLeft > 0 && !isGameOver) {
        timerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timerRef.current);
              setIsPlaying(false);
              setIsGameOver(true);
              sfx.playGameOver();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [isPlaying, timeLeft, isGameOver]);

    // Update high score on game over
    useEffect(() => {
      if (isGameOver) {
        updateHighScore('speed_math', score);
      }
    }, [isGameOver, score]);

    const handleSelectOption = (idx: number) => {
      if (!isPlaying || isAnswered || !currentProblem) return;
      setSelectedOpt(idx);
      setIsAnswered(true);

      const isCorrect = idx === currentProblem.correctIndex;
      if (isCorrect) {
        sfx.playCorrect();
        const basePts = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 35;
        const earned = Math.round(basePts * combo);
        setScore((prev) => prev + earned);
        const nextCombo = combo + 0.5;
        setCombo(nextCombo);
        if (nextCombo > maxCombo) setMaxCombo(nextCombo);
        if (nextCombo >= 2.5) sfx.playCombo();
      } else {
        sfx.playWrong();
        setCombo(1);
      }

      // Next question fast
      setTimeout(() => {
        setIsAnswered(false);
        setSelectedOpt(null);
        setCurrentProblem(generateMathProblem(difficulty));
      }, 400);
    };

    return (
      <div className="space-y-6">
        {/* Top Game Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveGame('hub');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับเมนูหลัก</span>
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Combo Meter */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 font-bold text-xs">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Combo x{combo.toFixed(1)}</span>
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">คะแนน</div>
              <div className="text-lg sm:text-xl font-black text-blue-600 tracking-tight">
                {score.toLocaleString()}
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-black text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Not Started State */}
        {!isPlaying && !isGameOver && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-blue-500 text-white rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-lg shadow-blue-500/25">
              <Zap className="w-8 h-8 fill-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">⚡ คิดเลขเร็ว Speed Math</h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              ตอบโจทย์คำนวณและสมการให้ถูกต้องและเร็วที่สุดในเวลา 45 วินาที
              ยิ่งตอบถูกต่อเนื่องจะยิ่งได้ตัวคูณคอมโบคะแนนสูงสุด!
            </p>

            {/* Difficulty Selector */}
            <div className="flex justify-center gap-2 mb-8">
              {(['easy', 'medium', 'hard'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setDifficulty(lvl)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer capitalize ${
                    difficulty === lvl
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {lvl === 'easy' ? 'ระดับง่าย' : lvl === 'medium' ? 'ระดับปานกลาง' : 'ระดับเซียน'}
                </button>
              ))}
            </div>

            <button
              onClick={() => startNewGame()}
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>เริ่มคิดเลขสายฟ้า</span>
            </button>
          </div>
        )}

        {/* Active Game Play */}
        {isPlaying && currentProblem && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto shadow-sm space-y-8">
            {/* Question Card */}
            <div className="text-center space-y-3 py-4">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                {currentProblem.question}
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 pt-2 min-h-[60px] flex items-center justify-center">
                {currentProblem.latex ? (
                  <MathRenderer content={`$$${currentProblem.latex}$$`} />
                ) : (
                  currentProblem.question
                )}
              </div>
            </div>

            {/* 4 Choices */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {currentProblem.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = idx === currentProblem.correctIndex;
                let btnStyle =
                  'bg-slate-50 hover:bg-blue-50/80 border-slate-200 hover:border-blue-300 text-slate-800';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 sm:p-6 rounded-2xl border-2 font-bold text-lg sm:text-2xl transition-all cursor-pointer flex items-center justify-center min-h-[75px] ${btnStyle}`}
                  >
                    <MathRenderer content={opt} inline />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {isGameOver && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-amber-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">หมดเวลา! ยอดเยี่ยมมาก</h2>
              <p className="text-sm text-slate-500">ผลงานการคิดเลขเร็วรอบนี้ของคุณ</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="bg-blue-50/70 border border-blue-100 p-4 rounded-2xl">
                <div className="text-xs text-blue-600 font-semibold mb-1">คะแนนรวม</div>
                <div className="text-3xl font-black text-blue-700">{score.toLocaleString()}</div>
              </div>
              <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-2xl">
                <div className="text-xs text-amber-600 font-semibold mb-1">Max Combo</div>
                <div className="text-3xl font-black text-amber-700">x{maxCombo.toFixed(1)}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => startNewGame()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นอีกครั้ง</span>
              </button>
              <button
                onClick={() => setActiveGame('hub')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>เลือกเกมอื่น</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // SUB-GAME 2: FORMULA & VOCAB MEMORY DUEL (Flip Cards Match)
  // =========================================================================
  const MemoryMatchGame = () => {
    const [selectedThemeId, setSelectedThemeId] = useState('math');
    const [cards, setCards] = useState<MemoryCard[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [matchedCount, setMatchedCount] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const initBoard = (themeId = selectedThemeId) => {
      setSelectedThemeId(themeId);
      const theme = MEMORY_THEMES.find((t) => t.id === themeId) || MEMORY_THEMES[0];
      const deck: MemoryCard[] = [];

      theme.pairs.forEach((pair) => {
        deck.push({
          id: `${pair.id}-a`,
          pairId: pair.id,
          content: pair.a,
          isLatex: pair.latex,
          type: 'prompt',
          isFlipped: false,
          isMatched: false,
        });
        deck.push({
          id: `${pair.id}-b`,
          pairId: pair.id,
          content: pair.b,
          isLatex: pair.latex,
          type: 'target',
          isFlipped: false,
          isMatched: false,
        });
      });

      // Shuffle deck
      const shuffled = deck.sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setFlippedCards([]);
      setMoves(0);
      setMatchedCount(0);
      setIsWon(false);
      setStartTime(Date.now());
      setTimeElapsed(0);
      setIsPlaying(true);
    };

    // Timer
    useEffect(() => {
      let interval: any = null;
      if (isPlaying && !isWon) {
        interval = setInterval(() => {
          setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
      }
      return () => clearInterval(interval);
    }, [isPlaying, isWon, startTime]);

    // Handle Card Click
    const handleCardClick = (idx: number) => {
      if (!isPlaying || isWon) return;
      if (cards[idx].isFlipped || cards[idx].isMatched) return;
      if (flippedCards.length >= 2) return;

      sfx.playFlip();

      const nextCards = [...cards];
      nextCards[idx].isFlipped = true;
      setCards(nextCards);

      const newFlipped = [...flippedCards, idx];
      setFlippedCards(newFlipped);

      if (newFlipped.length === 2) {
        setMoves((m) => m + 1);
        const [firstIdx, secondIdx] = newFlipped;
        const firstCard = nextCards[firstIdx];
        const secondCard = nextCards[secondIdx];

        if (firstCard.pairId === secondCard.pairId) {
          // MATCH!
          sfx.playCorrect();
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
              )
            );
            setFlippedCards([]);
            setMatchedCount((cnt) => {
              const next = cnt + 1;
              if (next === 8) {
                setIsWon(true);
                setIsPlaying(false);
                sfx.playGameOver();
                const scoreCalc = Math.max(100, 500 - moves * 15 - timeElapsed * 3);
                updateHighScore('memory_match', scoreCalc);
              }
              return next;
            });
          }, 350);
        } else {
          // NO MATCH
          sfx.playWrong();
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c, i) =>
                i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
              )
            );
            setFlippedCards([]);
          }, 900);
        }
      }
    };

    return (
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveGame('hub');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับเมนูหลัก</span>
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-xs font-semibold text-slate-500">
              จำนวนครั้งที่เปิด:{' '}
              <span className="font-bold text-slate-900 text-sm">{moves}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold text-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>จับคู่สำเร็จ: {matchedCount} / 8</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 font-black text-sm">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>{timeElapsed}s</span>
            </div>
          </div>
        </div>

        {/* Mode Selector / Not Started */}
        {!isPlaying && !isWon && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-purple-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                🃏 จับคู่การ์ดความจำสูตร & ศัพท์
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                เปิดการ์ด 16 ใบเพื่อจับคู่สูตรคณิตศาสตร์ ฟิสิกส์ หรือคำศัพท์ภาษาอังกฤษให้ครบ 8 คู่
                ฝึกความจำระยะสั้นและความแม่นยำของสูตร!
              </p>
            </div>

            {/* Theme Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              {MEMORY_THEMES.map((theme) => {
                const Icon = theme.icon;
                const isSelected = selectedThemeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => setSelectedThemeId(theme.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 ${
                        isSelected ? 'text-purple-600' : 'text-slate-500'
                      }`}
                    />
                    <div className="text-xs font-bold text-slate-800">{theme.name}</div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => initBoard(selectedThemeId)}
              className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>เริ่มเปิดการ์ดประลองความจำ</span>
            </button>
          </div>
        )}

        {/* 4x4 Cards Grid */}
        {isPlaying && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-2xl mx-auto">
            {cards.map((card, idx) => {
              const isFaceUp = card.isFlipped || card.isMatched;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  className={`h-24 sm:h-28 rounded-2xl p-3 flex items-center justify-center text-center font-bold text-sm sm:text-base border-2 cursor-pointer transition-all duration-300 transform select-none ${
                    card.isMatched
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-800 opacity-90 scale-95'
                      : isFaceUp
                      ? 'bg-white border-purple-500 text-purple-900 shadow-md rotate-y-0'
                      : 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:scale-[1.02]'
                  }`}
                >
                  {isFaceUp ? (
                    <div className="overflow-hidden line-clamp-3">
                      {card.isLatex ? (
                        <MathRenderer content={`$$${card.content}$$`} inline />
                      ) : (
                        card.content
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 opacity-70">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span className="text-[10px] uppercase tracking-wider text-slate-400">
                        CARD
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Victory Screen */}
        {isWon && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-emerald-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Star className="w-8 h-8 fill-white" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">🎉 ยอดเยี่ยม! ผ่านด่านสมบูรณ์</h2>
              <p className="text-sm text-slate-500">คุณจับคู่สูตรและนิยามครบ 8 คู่แล้ว</p>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-2xl">
                <div className="text-xs text-purple-600 font-semibold mb-1">จำนวนการเปิด</div>
                <div className="text-3xl font-black text-purple-700">{moves} ครั้ง</div>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 p-4 rounded-2xl">
                <div className="text-xs text-emerald-600 font-semibold mb-1">เวลาที่ใช้</div>
                <div className="text-3xl font-black text-emerald-700">{timeElapsed} วินาที</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => initBoard(selectedThemeId)}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นใหม่อีกรอบ</span>
              </button>
              <button
                onClick={() => setActiveGame('hub')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>เลือกเกมอื่น</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // SUB-GAME 3: SPEED QUIZ (Rapid 10-Second Trivia)
  // =========================================================================
  const SpeedQuizGame = () => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [timeLeft, setTimeLeft] = useState(10);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const timerRef = useRef<any>(null);

    const questions = SPEED_QUIZ_BANK;

    const startNewQuiz = () => {
      setCurrentIdx(0);
      setScore(0);
      setLives(3);
      setTimeLeft(10);
      setIsGameOver(false);
      setIsPlaying(true);
      setSelectedOpt(null);
      setIsAnswered(false);
    };

    // 10-second countdown
    useEffect(() => {
      if (isPlaying && !isAnswered && !isGameOver && timeLeft > 0) {
        timerRef.current = setInterval(() => {
          setTimeLeft((t) => {
            if (t <= 1) {
              clearInterval(timerRef.current);
              handleTimeout();
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      }
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [isPlaying, isAnswered, isGameOver, timeLeft, currentIdx]);

    const handleTimeout = () => {
      sfx.playWrong();
      setIsAnswered(true);
      setLives((l) => {
        const next = l - 1;
        if (next <= 0) {
          setTimeout(() => {
            setIsPlaying(false);
            setIsGameOver(true);
            sfx.playGameOver();
          }, 800);
        } else {
          setTimeout(goToNextQuestion, 1200);
        }
        return next;
      });
    };

    const handleAnswer = (idx: number) => {
      if (isAnswered || !isPlaying) return;
      if (timerRef.current) clearInterval(timerRef.current);

      setSelectedOpt(idx);
      setIsAnswered(true);

      const q = questions[currentIdx];
      const isCorrect = idx === q.correctIndex;

      if (isCorrect) {
        sfx.playCorrect();
        setScore((s) => s + 50 + timeLeft * 5);
        setTimeout(goToNextQuestion, 1000);
      } else {
        sfx.playWrong();
        setLives((l) => {
          const next = l - 1;
          if (next <= 0) {
            setTimeout(() => {
              setIsPlaying(false);
              setIsGameOver(true);
              sfx.playGameOver();
            }, 900);
          } else {
            setTimeout(goToNextQuestion, 1200);
          }
          return next;
        });
      }
    };

    const goToNextQuestion = () => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((c) => c + 1);
        setTimeLeft(10);
        setSelectedOpt(null);
        setIsAnswered(false);
      } else {
        setIsPlaying(false);
        setIsGameOver(true);
        sfx.playGameOver();
        updateHighScore('speed_quiz', score + 100);
      }
    };

    useEffect(() => {
      if (isGameOver) {
        updateHighScore('speed_quiz', score);
      }
    }, [isGameOver, score]);

    const currQ = questions[currentIdx];

    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveGame('hub');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับเมนูหลัก</span>
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            {/* Lives */}
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((heart) => (
                <span
                  key={heart}
                  className={`text-lg transition-transform ${
                    heart <= lives ? 'scale-100 opacity-100' : 'scale-75 opacity-25 grayscale'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>

            {/* Score */}
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">คะแนน</div>
              <div className="text-lg sm:text-xl font-black text-rose-600 tracking-tight">
                {score}
              </div>
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-sm border ${
                timeLeft <= 3
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>
        </div>

        {/* Start Hub */}
        {!isPlaying && !isGameOver && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-rose-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Flame className="w-8 h-8 fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                🎯 Speed Quiz ตอบไว 10 วินาที
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                ตอบคำถามวิชาการรอบตัวและแนวข้อสอบจริง ข้อละ 10 วินาที มีหัวใจ 3 ดวง
                ตอบเร็วได้คะแนนโบนัสเพิ่ม!
              </p>
            </div>

            <button
              onClick={startNewQuiz}
              className="w-full sm:w-auto px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>เริ่ม Speed Quiz ทันที</span>
            </button>
          </div>
        )}

        {/* Active Question */}
        {isPlaying && currQ && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                {currQ.subject}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                ข้อ {currentIdx + 1} / {questions.length}
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
              {currQ.question}
            </h3>

            {/* Options */}
            <div className="space-y-3 pt-2">
              {currQ.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = idx === currQ.correctIndex;
                let btnStyle =
                  'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-4 rounded-2xl border-2 font-bold text-sm sm:text-base text-left transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                  >
                    <span>
                      {['A.', 'B.', 'C.', 'D.'][idx]} {opt}
                    </span>
                    {isAnswered && isCorrect && <Check className="w-5 h-5" />}
                    {isAnswered && isSelected && !isCorrect && <X className="w-5 h-5" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation snippet */}
            {isAnswered && (
              <div className="p-3 bg-blue-50/70 rounded-xl text-xs text-blue-900 border border-blue-100 leading-relaxed">
                💡 <strong>เฉลย:</strong> {currQ.explanation}
              </div>
            )}
          </div>
        )}

        {/* Game Over */}
        {isGameOver && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-rose-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">สรุปคะแนน Speed Quiz</h2>
              <p className="text-sm text-slate-500">ตอบถูกทั้งหมด {Math.floor(score / 50)} ข้อ</p>
            </div>

            <div className="bg-rose-50/70 border border-rose-100 p-5 rounded-2xl max-w-xs mx-auto">
              <div className="text-xs text-rose-600 font-semibold mb-1">คะแนนรวมที่ได้</div>
              <div className="text-4xl font-black text-rose-700">{score}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={startNewQuiz}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นใหม่อีกครั้ง</span>
              </button>
              <button
                onClick={() => setActiveGame('hub')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>เลือกเกมอื่น</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // SUB-GAME 4: VOCAB SPRINT (TGAT English Flash Challenge)
  // =========================================================================
  const VocabSprintGame = () => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [isAnswered, setIsAnswered] = useState(false);
    const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    const vocabList = VOCAB_SCRAMBLE_LIST;

    const startVocabGame = () => {
      setCurrentIdx(0);
      setScore(0);
      setIsAnswered(false);
      setSelectedOpt(null);
      setIsGameOver(false);
      setIsPlaying(true);
    };

    const handleSelect = (idx: number) => {
      if (isAnswered || !isPlaying) return;
      setSelectedOpt(idx);
      setIsAnswered(true);

      const item = vocabList[currentIdx];
      const isCorrect = idx === item.correctIndex;

      if (isCorrect) {
        sfx.playCorrect();
        setScore((s) => s + 50);
      } else {
        sfx.playWrong();
      }

      setTimeout(() => {
        if (currentIdx + 1 < vocabList.length) {
          setCurrentIdx((c) => c + 1);
          setSelectedOpt(null);
          setIsAnswered(false);
        } else {
          setIsPlaying(false);
          setIsGameOver(true);
          sfx.playGameOver();
          updateHighScore('vocab_sprint', score + 50);
        }
      }, 1000);
    };

    useEffect(() => {
      if (isGameOver) {
        updateHighScore('vocab_sprint', score);
      }
    }, [isGameOver, score]);

    const item = vocabList[currentIdx];

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-xs">
          <button
            onClick={() => {
              setIsPlaying(false);
              setActiveGame('hub');
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับเมนูหลัก</span>
          </button>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">คะแนน</div>
              <div className="text-lg sm:text-xl font-black text-indigo-600 tracking-tight">
                {score}
              </div>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
              คำที่ {currentIdx + 1} / {vocabList.length}
            </div>
          </div>
        </div>

        {!isPlaying && !isGameOver && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-indigo-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">
                🔤 TGAT Vocab Sprint คำศัพท์อังกฤษ
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                ทายความหมายและบริบทของคำศัพท์ภาษาอังกฤษที่ออกสอบ TGAT1 และ A-Level บ่อยที่สุด!
              </p>
            </div>

            <button
              onClick={startVocabGame}
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>เริ่มตะลุยคำศัพท์</span>
            </button>
          </div>
        )}

        {isPlaying && item && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-sm space-y-6 text-center">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
              {item.partOfSpeech}
            </span>

            <div className="space-y-2">
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-wider">
                {item.word}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto italic">"{item.clue}"</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              {item.options.map((opt, idx) => {
                const isSelected = selectedOpt === idx;
                const isCorrect = idx === item.correctIndex;
                let btnStyle =
                  'bg-slate-50 hover:bg-indigo-50/80 border-slate-200 hover:border-indigo-300 text-slate-800';

                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'bg-rose-500 text-white border-rose-600';
                  } else {
                    btnStyle = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelect(idx)}
                    className={`p-4 rounded-2xl border-2 font-bold text-base transition-all cursor-pointer flex items-center justify-center min-h-[60px] ${btnStyle}`}
                  >
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isGameOver && (
          <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-6">
            <div className="w-16 h-16 bg-indigo-500 text-white rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">🎉 ตะลุยศัพท์ครบทุกคำ!</h2>
              <p className="text-sm text-slate-500">ผลงานการจำศัพท์รอบนี้</p>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 p-5 rounded-2xl max-w-xs mx-auto">
              <div className="text-xs text-indigo-600 font-semibold mb-1">คะแนนรวม</div>
              <div className="text-4xl font-black text-indigo-700">{score}</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={startVocabGame}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>เล่นใหม่อีกครั้ง</span>
              </button>
              <button
                onClick={() => setActiveGame('hub')}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>เลือกเกมอื่น</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // =========================================================================
  // MAIN HUB VIEW (4 Mini Game Cards + Stats + Sound Toggle)
  // =========================================================================
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-white">
              🎮 Mini-Game Station
            </span>
            <button
              onClick={toggleSound}
              className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors cursor-pointer text-white"
              title={soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            มินิเกมฝึกทักษะ & ทบทวนบทเรียน
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
            ผ่อนคลายและฝึกสมองไปกับเกมคิดเลขเร็ว จับคู่สูตรความจำ และประลองคำศัพท์ TGAT / TPAT
            สะสมแต้ม XP และปลดล็อกสถิติใหม่!
          </p>
        </div>

        {/* Total XP Badge */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 self-start md:self-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
            <Award className="w-6 h-6 stroke-[2.4]" />
          </div>
          <div>
            <div className="text-[11px] text-blue-100 uppercase font-semibold">Total Game XP</div>
            <div className="text-2xl font-black text-white">{totalXP.toLocaleString()} XP</div>
          </div>
        </div>
      </div>

      {/* Render Active Sub-Game OR Hub */}
      {activeGame === 'speed_math' && <SpeedMathGame />}
      {activeGame === 'memory_match' && <MemoryMatchGame />}
      {activeGame === 'speed_quiz' && <SpeedQuizGame />}
      {activeGame === 'vocab_sprint' && <VocabSprintGame />}
      {activeGame === 'thai_future_flyer' && (
        <ThaiFutureFlyerGame
          onBackToHub={() => setActiveGame('hub')}
          onUpdateHighScore={(score) => updateHighScore('thai_future_flyer', score)}
          savedHighScore={highScores.thai_future_flyer || 0}
        />
      )}

      {/* HUB: Game Mode Cards */}
      {activeGame === 'hub' && (
        <div className="space-y-6">
          {/* FEATURED GAME: Thai Future Flyer */}
          <div
            onClick={() => setActiveGame('thai_future_flyer')}
            className="group relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/40 hover:border-cyan-400 rounded-3xl p-6 md:p-8 cursor-pointer transition-all duration-300 shadow-xl shadow-cyan-950/40 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-1"
          >
            {/* Background Cyber Grid Lines & Neon Glow */}
            <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            <div className="absolute top-0 right-0 p-6 opacity-15 text-8xl pointer-events-none group-hover:opacity-25 group-hover:rotate-6 transition-all duration-300">
              🐒
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    ⚡ NEW ARCADE GAME
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    PIXEL ART
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Endless Runner • Float Power
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">🍌</span>
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-cyan-300 transition-colors tracking-wide">
                      THAI FUTURE FLYER: ไซเบอร์ไทยแลนด์
                    </h3>
                    <p className="text-xs text-cyan-400/90 font-medium">
                      "Float Through The Future"
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  ควบคุมลิงไซเบอร์ไทยแลนด์ ลอยตัวทะลุมหานครกรุงเทพแห่งอนาคต หลบเลเซอร์ เลื่อยหมุน
                  และจรวดไฮเทค เก็บกล้วยพลังงานสะสมคะแนนสูงสุด
                </p>

                <div className="flex items-center gap-4 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-slate-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>High Score: {highScores.thai_future_flyer || 0}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    รองรับ Spacebar • Mouse • Touch Mobile
                  </span>
                </div>
              </div>

              <div className="flex items-center">
                <div className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-cyan-500/30 group-hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0">
                  <Play className="w-4 h-4 fill-current" />
                  <span>เข้าเล่นเกม</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-lg font-bold text-slate-900">โหมดการเรียนรู้และเกมฝึกทักษะ</h2>
            <span className="text-xs text-slate-500 font-medium">5 โหมดการเล่น</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Speed Math */}
            <div
              onClick={() => setActiveGame('speed_math')}
              className="group relative bg-white border border-slate-100 hover:border-blue-300 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-xs hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-13 h-13 rounded-2xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      ⚡ คิดเลขเร็ว Speed Math
                    </h3>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                      45s
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    แข่งคำนวณบวกลบคูณหาร รูท และสมการเส้นตรง สะสมคอมโบรับโบนัสคะแนน
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                <span className="text-slate-400 font-semibold">
                  High Score: {highScores.speed_math || 0}
                </span>
                <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* 2. Formula & Vocab Memory Match */}
            <div
              onClick={() => setActiveGame('memory_match')}
              className="group relative bg-white border border-slate-100 hover:border-purple-300 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-xs hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-13 h-13 rounded-2xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/25 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      🃏 จับคู่การ์ดความจำสูตร
                    </h3>
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-600 px-2 py-0.5 rounded-md">
                      Memory
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    เปิดการ์ดจับคู่สูตรคณิตศาสตร์ ฟิสิกส์ เคมี หรือคำศัพท์ TGAT กับความหมาย
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                <span className="text-slate-400 font-semibold">
                  High Score: {highScores.memory_match || 0}
                </span>
                <span className="font-bold text-purple-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* 3. Speed Quiz 10s */}
            <div
              onClick={() => setActiveGame('speed_quiz')}
              className="group relative bg-white border border-slate-100 hover:border-rose-300 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-xs hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-13 h-13 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-500/25 group-hover:scale-110 transition-transform">
                  <Flame className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                      🎯 Speed Quiz ตอบไว 10 วินาที
                    </h3>
                    <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md">
                      3 Lives
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ตอบคำถามวิชาการรอบด้าน TGAT, TPAT, วิทย์-คณิต ไวปานสายฟ้า
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                <span className="text-slate-400 font-semibold">
                  High Score: {highScores.speed_quiz || 0}
                </span>
                <span className="font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>

            {/* 4. TGAT Vocab Sprint */}
            <div
              onClick={() => setActiveGame('vocab_sprint')}
              className="group relative bg-white border border-slate-100 hover:border-indigo-300 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 shadow-xs hover:shadow-lg hover:-translate-y-1"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-13 h-13 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      🔤 TGAT Vocab Sprint
                    </h3>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md">
                      Vocab
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    ทายความหมายคำศัพท์ภาษาอังกฤษออกสอบบ่อย ฝึกการวิเคราะห์บริบท
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-xs">
                <span className="text-slate-400 font-semibold">
                  High Score: {highScores.vocab_sprint || 0}
                </span>
                <span className="font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  เข้าเล่นเกม <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
