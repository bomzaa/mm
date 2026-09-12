import React from 'react';
import katex from 'katex';
import { formatHumanReadableText } from '../utils/examFormatter';

/**
 * Maps unicode superscripts and subscripts to standard LaTeX notation
 */
const SUPERSCRIPT_MAP: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
  '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
  '⁺': '+', '⁻': '-', '⁼': '=', '⁽': '(', '⁾': ')',
  'ⁿ': 'n', 'ⁱ': 'i', 'ˣ': 'x', 'ʸ': 'y'
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
  '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
  '₊': '+', '₋': '-', '₌': '=', '₍': '(', '₎': ')',
  'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x'
};

/**
 * Normalizes plain/pseudo math text, computer code notations, and Unicode symbols into clean LaTeX.
 * Converts:
 * - sqrt39, sqrt 39, sqrt(49), sqrt{x}, √x -> \sqrt{x}
 * - x^2, x^3, y^n, 10^-3 -> x^{2}, x^{3}, 10^{-3}
 * - a/b, 3/5, 7/25, (x+1)/(x-1) -> \frac{a}{b}, \frac{3}{5}, etc.
 * - sin(x), cos(x), tan(x), sin x, cos \theta -> \sin x, \cos x, \tan x
 * - pi, theta, alpha, beta, gamma, lambda, mu, omega, Delta, Sigma -> \pi, \theta, etc.
 * - π, θ, ≤, ≥, ≠, ≈, ∠, ⟂, ∥, °, ±, ×, ÷, ∞
 */
export function normalizeMathSyntax(raw: string): string {
  if (!raw) return '';
  let text = raw;

  // 0. Normalize double backslashes before LaTeX commands (e.g. \\frac -> \frac, \\sqrt -> \sqrt)
  text = text.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  // 1. Convert Unicode Superscripts (e.g. x², x³, yⁿ, 10⁻³, cm²)
  text = text.replace(/([a-zA-Z0-9\)\}\]|\\])([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿⁱˣʸ]+)/g, (_, base, supers) => {
    const converted = Array.from(supers).map((c: any) => SUPERSCRIPT_MAP[c] || c).join('');
    return `${base}^{${converted}}`;
  });

  // 2. Convert Unicode Subscripts (e.g. H₂O, CO₂, x₁, aₙ)
  text = text.replace(/([a-zA-Z0-9\)\}\]|\\])([₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ₐₑₒₓ]+)/g, (_, base, subs) => {
    const converted = Array.from(subs).map((c: any) => SUBSCRIPT_MAP[c] || c).join('');
    return `${base}_{${converted}}`;
  });

  // 3. Convert Square Roots (sqrt39, sqrt 39, sqrt(49), sqrt{49}, √39, √(39))
  // sqrt39 or sqrt 39
  text = text.replace(/(?<![\\a-zA-Z])sqrt\s*(\d+|[a-zA-Z])/gi, '\\sqrt{$1}');
  // sqrt(x+1) or sqrt(49)
  text = text.replace(/(?<![\\a-zA-Z])sqrt\s*\(([^)]+)\)/gi, '\\sqrt{$1}');
  // sqrt{x}
  text = text.replace(/(?<![\\a-zA-Z])sqrt\s*\{([^}]+)\}/gi, '\\sqrt{$1}');
  // Unicode √
  text = text.replace(/√\(([^\)]+)\)/g, '\\sqrt{$1}');
  text = text.replace(/√([0-9a-zA-Z]+)/g, '\\sqrt{$1}');
  text = text.replace(/√\{([^}]+)\}/g, '\\sqrt{$1}');
  text = text.replace(/√/g, '\\sqrt{}');

  // 4. Convert Trigonometric, Log, and Calculus Functions
  // sin(x) -> \sin(x), cos(2A) -> \cos(2A), tan(30^\circ) -> \tan(30^\circ)
  text = text.replace(/(?<![\\a-zA-Z])\b(sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|log|ln|lim)\s*\(([^)]+)\)/gi, '\\$1($2)');
  // sin x, cos theta, tan theta
  text = text.replace(/(?<![\\a-zA-Z])\b(sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|log|ln|lim)\b(?!\s*\{)/gi, '\\$1 ');

  // 5. Convert Constants & Greek Words
  // Standalone pi, theta, alpha, beta, gamma, lambda, mu, omega, Delta, Sigma (avoid replacing inside Thai words)
  text = text.replace(/(?<![\\a-zA-Z])\b(theta|alpha|beta|gamma|lambda|mu|omega)\b(?![a-zA-Z])/gi, '\\$1');
  text = text.replace(/(?<![\\a-zA-Z])\bpi\b(?![a-zA-Z])/gi, '\\pi');
  text = text.replace(/(?<![\\a-zA-Z])\bDelta\b(?![a-zA-Z])/g, '\\Delta');
  text = text.replace(/(?<![\\a-zA-Z])\bSigma\b(?![a-zA-Z])/g, '\\Sigma');
  text = text.replace(/(?<![\\a-zA-Z])\bOmega\b(?![a-zA-Z])/g, '\\Omega');

  // 6. Convert Unicode Math Operators & Greek Symbols
  text = text.replace(/π/g, '\\pi ');
  text = text.replace(/θ/g, '\\theta ');
  text = text.replace(/α/g, '\\alpha ');
  text = text.replace(/β/g, '\\beta ');
  text = text.replace(/γ/g, '\\gamma ');
  text = text.replace(/λ/g, '\\lambda ');
  text = text.replace(/μ/g, '\\mu ');
  text = text.replace(/ω/g, '\\omega ');
  text = text.replace(/Δ/g, '\\Delta ');
  text = text.replace(/Σ/g, '\\Sigma ');
  text = text.replace(/Ω/g, '\\Omega ');
  text = text.replace(/ϕ|φ/g, '\\phi ');

  text = text.replace(/∑/g, '\\sum ');
  text = text.replace(/∫/g, '\\int ');
  text = text.replace(/≤|<=/g, '\\le ');
  text = text.replace(/≥|>=/g, '\\ge ');
  text = text.replace(/≠|!=/g, '\\ne ');
  text = text.replace(/≈|~=/g, '\\approx ');
  text = text.replace(/∠([A-Za-z0-9_]+)/g, '\\angle $1');
  text = text.replace(/∠/g, '\\angle ');
  text = text.replace(/⟂|⊥/g, '\\perp ');
  text = text.replace(/∥/g, '\\parallel ');
  text = text.replace(/°/g, '^\\circ ');
  text = text.replace(/±|\+\/-/g, '\\pm ');
  text = text.replace(/×/g, '\\times ');
  text = text.replace(/÷/g, '\\div ');
  text = text.replace(/∞/g, '\\infty ');
  text = text.replace(/∈/g, '\\in ');
  text = text.replace(/∉/g, '\\notin ');
  text = text.replace(/⊂/g, '\\subset ');
  text = text.replace(/⊆/g, '\\subseteq ');
  text = text.replace(/∪/g, '\\cup ');
  text = text.replace(/∩/g, '\\cap ');
  text = text.replace(/∅/g, '\\emptyset ');
  text = text.replace(/⇒|->/g, '\\implies ');
  text = text.replace(/⇔|<->/g, '\\iff ');

  // 7. Fix Chemistry Formulas
  text = text.replace(/\bH2O\b/g, '\\text{H}_2\\text{O}');
  text = text.replace(/\bCO2\b/g, '\\text{CO}_2');
  text = text.replace(/\bO2\b/g, '\\text{O}_2');
  text = text.replace(/\bN2\b/g, '\\text{N}_2');
  text = text.replace(/\bH2SO4\b/g, '\\text{H}_2\\text{SO}_4');
  text = text.replace(/\bCaCO3\b/g, '\\text{CaCO}_3');
  text = text.replace(/\bHCl\b/g, '\\text{HCl}');
  text = text.replace(/\bNaOH\b/g, '\\text{NaOH}');
  text = text.replace(/\bNaCl\b/g, '\\text{NaCl}');

  // 8. Convert powers written with ^ like x^2, x^3, 10^-3 to x^{2}, x^{3}, 10^{-3}
  text = text.replace(/([a-zA-Z0-9\)\}\]\\])\^([0-9a-zA-Z\-+]+)/g, '$1^{$2}');

  // 9. Convert simple fractions like a/b or 3/5 or 7/25 or (x+1)/(x-1) or 5\pi/2
  // But avoid replacing dates (e.g. 23/08/2026) or units like m/s or km/h
  text = text.replace(/(^|[\s\(\[\{=+\-*<>:,])(\d+|[a-zA-Z\\]+)\/(\d+|[a-zA-Z\\]+)([\s\)\]\},.;:?!]|$)/g, (match, prefix, num, den, suffix) => {
    // Avoid m/s or km/h or text units
    if ((num === 'm' || num === 'km') && (den === 's' || den === 'h')) {
      return match;
    }
    return `${prefix}\\frac{${num}}{${den}}${suffix}`;
  });

  return text;
}

/**
 * Safely renders a LaTeX math formula to HTML string using KaTeX.
 * If KaTeX fails or throws, gracefully falls back to formatHumanReadableText
 * so raw LaTeX markup like \frac or \sqrt never leaks onto the screen.
 */
function renderKatexHtml(formula: string, displayMode: boolean = false): string {
  try {
    let cleanFormula = formula.trim();
    if (!cleanFormula) return '';
    cleanFormula = cleanFormula.replace(/\\\\([a-zA-Z]+)/g, '\\$1');
    const html = katex.renderToString(cleanFormula, {
      throwOnError: false,
      displayMode,
    });
    if (html.includes('katex-error')) {
      const readable = formatHumanReadableText(cleanFormula);
      return `<span class="inline-math-fallback font-medium px-0.5">${readable}</span>`;
    }
    return html;
  } catch {
    const readable = formatHumanReadableText(formula);
    return `<span class="inline-math-fallback font-medium px-0.5">${readable}</span>`;
  }
}

/**
 * Helper to extract balanced brackets/braces from string starting at index
 */
function extractBalanced(str: string, startIndex: number, openChar = '{', closeChar = '}'): { content: string; endIndex: number } | null {
  if (str[startIndex] !== openChar) return null;
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '\\' && i + 1 < str.length) {
      i++;
      continue;
    }
    if (str[i] === openChar) depth++;
    else if (str[i] === closeChar) {
      depth--;
      if (depth === 0) {
        return { content: str.slice(startIndex + 1, i), endIndex: i };
      }
    }
  }
  return null;
}

/**
 * Parses full raw LaTeX expression starting at startIndex, including arguments with arbitrary nested braces
 */
function parseRawLatexAt(str: string, startIndex: number): { formula: string; endIndex: number } | null {
  const cmdRegex = /^(?:\\\\|\\)(?:frac|dfrac|tfrac|cfrac|sqrt|sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|log|ln|pi|theta|alpha|beta|gamma|lambda|mu|omega|Delta|Sigma|Omega|le|ge|ne|approx|pm|times|div|infty|in|notin|angle|perp|parallel|circ|sum|int|text|mathrm|mathbf|mathit)\b/i;
  const match = cmdRegex.exec(str.slice(startIndex));
  if (!match) return null;

  let idx = startIndex + match[0].length;

  while (idx < str.length) {
    while (idx < str.length && /\s/.test(str[idx])) idx++;
    if (idx >= str.length) break;

    if (str[idx] === '{') {
      const b = extractBalanced(str, idx, '{', '}');
      if (!b) break;
      idx = b.endIndex + 1;
    } else if (str[idx] === '[') {
      const b = extractBalanced(str, idx, '[', ']');
      if (!b) break;
      idx = b.endIndex + 1;
    } else if (str[idx] === '(') {
      const b = extractBalanced(str, idx, '(', ')');
      if (!b) break;
      idx = b.endIndex + 1;
    } else if (str[idx] === '^' || str[idx] === '_') {
      idx++;
      while (idx < str.length && /\s/.test(str[idx])) idx++;
      if (str[idx] === '{') {
        const b = extractBalanced(str, idx, '{', '}');
        if (b) idx = b.endIndex + 1;
      } else if (/[0-9a-zA-Z]/.test(str[idx])) {
        idx++;
      }
    } else if (/[=+\-*/<>]/.test(str[idx])) {
      // Possible continuation of math equation (e.g. \frac{1}{2} + \frac{1}{3} = \frac{5}{6})
      const nextSlice = str.slice(idx + 1).trimStart();
      if (nextSlice.startsWith('\\') || /^[0-9a-zA-Z(]/.test(nextSlice)) {
        idx++;
        while (idx < str.length && /\s/.test(str[idx])) idx++;
        if (str[idx] === '\\') {
          const nextCmd = /^(\\[a-zA-Z]+)/.exec(str.slice(idx));
          if (nextCmd) {
            idx += nextCmd[0].length;
            continue;
          }
        } else if (/[0-9a-zA-Z]/.test(str[idx])) {
          idx++;
        } else {
          break;
        }
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return { formula: str.slice(startIndex, idx), endIndex: idx };
}

/**
 * Parses mixed text containing markdown and LaTeX formulas ($...$ or $$...$$ or raw LaTeX commands)
 * and returns rich structured React nodes with KaTeX rendered math.
 */
function parseAndRenderRichMath(text: string, inline: boolean = false): React.ReactNode[] {
  if (!text) return [];

  // Pre-normalize math notations (sqrt, ^, fractions, unicode, functions)
  const normalized = normalizeMathSyntax(text);

  // Split by $$...$$ (display math) or $...$ (inline math)
  // Also check for raw LaTeX commands that might be outside dollar signs
  const nodes: React.ReactNode[] = [];
  const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(normalized)) !== null) {
    // 1. Process text segment before math block
    const textSegment = normalized.slice(lastIndex, match.index);
    if (textSegment) {
      nodes.push(...renderTextOrRawMathSegments(textSegment, nodes.length));
    }

    // 2. Process math block
    const rawMatch = match[0];
    const isDisplay = rawMatch.startsWith('$$');
    const mathContent = isDisplay ? rawMatch.slice(2, -2).trim() : rawMatch.slice(1, -1).trim();

    const html = renderKatexHtml(mathContent, isDisplay);
    if (isDisplay) {
      nodes.push(
        <div
          key={`math-disp-${nodes.length}`}
          className="my-3 overflow-x-auto py-1 text-center"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else {
      nodes.push(
        <span
          key={`math-inline-${nodes.length}`}
          className="inline-math-item inline-block align-middle px-0.5"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    lastIndex = match.index + rawMatch.length;
  }

  // 3. Process remaining trailing text
  const trailing = normalized.slice(lastIndex);
  if (trailing) {
    nodes.push(...renderTextOrRawMathSegments(trailing, nodes.length));
  }

  return nodes;
}

/**
 * Handles text that may contain naked LaTeX commands like \frac{a}{b}, \sqrt{39}, \sin \theta, etc.
 * without dollar signs, or markdown text (bold, lists, newlines).
 */
function renderTextOrRawMathSegments(text: string, baseKey: number): React.ReactNode[] {
  if (!text) return [];

  const result: React.ReactNode[] = [];
  let lastIdx = 0;
  let idx = 0;

  while (idx < text.length) {
    if (text[idx] === '\\') {
      const parsed = parseRawLatexAt(text, idx);
      if (parsed && parsed.formula.trim().length > 0) {
        // Render plain text before math
        const plain = text.slice(lastIdx, idx);
        if (plain) {
          result.push(renderPlainTextWithFormatting(plain, `${baseKey}-plain-${result.length}`));
        }

        const formula = parsed.formula.trim();
        const html = renderKatexHtml(formula, false);
        result.push(
          <span
            key={`rawmath-${baseKey}-${result.length}`}
            className="inline-math-item inline-block align-middle px-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );

        lastIdx = parsed.endIndex;
        idx = parsed.endIndex;
        continue;
      }
    }
    idx++;
  }

  const remainder = text.slice(lastIdx);
  if (remainder) {
    result.push(renderPlainTextWithFormatting(remainder, `${baseKey}-rem-${result.length}`));
  }

  return result;
}

/**
 * Renders plain text with support for bold (**text**), line breaks (\n), and bullet lists
 */
function renderPlainTextWithFormatting(text: string, keyPrefix: string): React.ReactNode {
  // Split by newlines
  const lines = text.split('\n');

  return (
    <span key={keyPrefix} className="text-segment">
      {lines.map((line, lIdx) => {
        // Parse bold **...**
        const boldParts = line.split(/(\*\*[^*]+?\*\*)/g);
        const lineContent = boldParts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={`b-${lIdx}-${pIdx}`} className="font-bold text-slate-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.startsWith('### ')) {
            return (
              <span key={`h3-${lIdx}-${pIdx}`} className="block font-bold text-slate-900 text-sm sm:text-base my-1">
                {part.slice(4)}
              </span>
            );
          }
          return <span key={`t-${lIdx}-${pIdx}`}>{part}</span>;
        });

        return (
          <React.Fragment key={`l-${lIdx}`}>
            {lineContent}
            {lIdx < lines.length - 1 && <br className="my-0.5" />}
          </React.Fragment>
        );
      })}
    </span>
  );
}

interface MathRendererProps {
  content?: string;
  text?: string;
  className?: string;
  inline?: boolean;
}

/**
 * MathRenderer component for rendering text with embedded LaTeX / mathematical formulas.
 * Supports:
 * - KaTeX mathematical notation (fractions, square roots, trig functions, powers, subscripts, calculus, Greek symbols)
 * - Auto-converts computer code math (sqrt39, x^2, a/b, sin(x), pi) to true textbook mathematical typography
 * - Markdown bold (**text**) and structured line formatting
 * - Zero raw LaTeX code strings visible on screen
 */
export const MathRenderer: React.FC<MathRendererProps> = ({
  content,
  text,
  className = '',
  inline = false,
}) => {
  const targetText = content || text || '';
  if (!targetText) return null;

  const renderedElements = parseAndRenderRichMath(targetText, inline);

  if (inline) {
    return <span className={`math-renderer-inline font-medium ${className}`}>{renderedElements}</span>;
  }

  return (
    <div className={`math-renderer-block leading-relaxed ${className}`}>
      {renderedElements}
    </div>
  );
};

export default MathRenderer;
