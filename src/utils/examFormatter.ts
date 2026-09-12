/**
 * Exam and Mathematical Text Formatter
 * 
 * Converts LaTeX formulas, pseudo-math syntax, and computer notations
 * into clean, human-readable plain text for display, copying, speech synthesis,
 * and accessible screen reading.
 */

// Global debug log storage for unreplaced tokens
export interface UnreplacedLogEntry {
  timestamp: string;
  original: string;
  result: string;
  unreplacedTokens: string[];
}

export const unreplacedTokensLog: UnreplacedLogEntry[] = [];

// Flag to control logging in console (enabled by default for diagnostic purposes)
let isLoggingEnabled = true;

export function setExamFormatterLogging(enabled: boolean): void {
  isLoggingEnabled = enabled;
}

export function getExamFormatterLogs(): UnreplacedLogEntry[] {
  return [...unreplacedTokensLog];
}

export function clearExamFormatterLogs(): void {
  unreplacedTokensLog.length = 0;
}

// Expose diagnostic tools to window for browser DevTools inspection
if (typeof window !== 'undefined') {
  (window as any).__EXAM_FORMATTER_LOGS__ = unreplacedTokensLog;
  (window as any).__GET_EXAM_FORMATTER_LOGS__ = getExamFormatterLogs;
  (window as any).__CLEAR_EXAM_FORMATTER_LOGS__ = clearExamFormatterLogs;
}

/**
 * Superscript and subscript Unicode character maps
 */
const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ',
  'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
  'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ',
  'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
  'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
};

const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
  'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
  'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
  'v': 'ᵥ', 'x': 'ₓ',
};

const GREEK_MAP: Record<string, string> = {
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ε',
  varepsilon: 'ε', zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'θ',
  iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν',
  xi: 'ξ', pi: 'π', varpi: 'ϖ', rho: 'ρ', varrho: 'ρ',
  sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ', phi: 'φ',
  varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  Alpha: 'Α', Beta: 'Β', Gamma: 'Γ', Delta: 'Δ', Epsilon: 'Ε',
  Zeta: 'Ζ', Eta: 'Η', Theta: 'Θ', Iota: 'Ι', Kappa: 'Κ',
  Lambda: 'Λ', Mu: 'Μ', Nu: 'Ν', Xi: 'Ξ', Pi: 'Π',
  Rho: 'Ρ', Sigma: 'Σ', Tau: 'Τ', Upsilon: 'Υ', Phi: 'Φ',
  Chi: 'Χ', Psi: 'Ψ', Omega: 'Ω',
};

/**
 * Extracts balanced bracket or brace content starting from startIndex.
 * Supports '{...}', '[...]', or '(...)'
 */
function extractBalancedDelimiter(
  str: string,
  startIndex: number,
  openChar = '{',
  closeChar = '}'
): { content: string; endIndex: number } | null {
  if (startIndex >= str.length || str[startIndex] !== openChar) {
    return null;
  }

  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '\\' && i + 1 < str.length) {
      i++; // Skip escaped character
      continue;
    }
    if (str[i] === openChar) {
      depth++;
    } else if (str[i] === closeChar) {
      depth--;
      if (depth === 0) {
        return {
          content: str.slice(startIndex + 1, i),
          endIndex: i,
        };
      }
    }
  }

  return null;
}

/**
 * Parses single argument (either {balanced}, [balanced], (balanced), single macro, or single character/digit)
 */
function extractArgument(
  str: string,
  startIndex: number,
  allowMultiCharWord = false
): { arg: string; nextIndex: number } | null {
  let idx = startIndex;
  while (idx < str.length && /\s/.test(str[idx])) {
    idx++;
  }
  if (idx >= str.length) return null;

  if (str[idx] === '{') {
    const balanced = extractBalancedDelimiter(str, idx, '{', '}');
    if (balanced) {
      return { arg: balanced.content, nextIndex: balanced.endIndex + 1 };
    }
  }

  if (str[idx] === '(') {
    const balanced = extractBalancedDelimiter(str, idx, '(', ')');
    if (balanced) {
      return { arg: balanced.content, nextIndex: balanced.endIndex + 1 };
    }
  }

  // If it starts with a backslash command e.g. \pi or \theta or \sqrt{...} (supports single \ and double \\)
  if (str[idx] === '\\') {
    const cmdMatch = /^(?:\\\\|\\)([a-zA-Z]+)/.exec(str.slice(idx));
    if (cmdMatch) {
      let nextPos = idx + cmdMatch[0].length;
      while (nextPos < str.length && /\s/.test(str[nextPos])) nextPos++;
      if (nextPos < str.length && str[nextPos] === '[') {
        const bracketRes = extractBalancedDelimiter(str, nextPos, '[', ']');
        if (bracketRes) {
          nextPos = bracketRes.endIndex + 1;
          while (nextPos < str.length && /\s/.test(str[nextPos])) nextPos++;
        }
      }
      if (nextPos < str.length && str[nextPos] === '{') {
        const braceRes = extractBalancedDelimiter(str, nextPos, '{', '}');
        if (braceRes) {
          return {
            arg: str.slice(idx, braceRes.endIndex + 1),
            nextIndex: braceRes.endIndex + 1,
          };
        }
      }
      return { arg: str.slice(idx, nextPos), nextIndex: nextPos };
    }
  }

  if (allowMultiCharWord) {
    // Single number/word token (e.g. 39 in \sqrt 39)
    const tokenMatch = /^([0-9a-zA-Z]+|[^\s{}()])/ .exec(str.slice(idx));
    if (tokenMatch) {
      return { arg: tokenMatch[1], nextIndex: idx + tokenMatch[1].length };
    }
  } else {
    // In standard TeX, unbraced fraction arguments are a single token/character e.g. \frac 1 2 or \frac 12
    const char = str[idx];
    return { arg: char, nextIndex: idx + 1 };
  }

  return null;
}

/**
 * Recursively resolves \frac, \dfrac, \tfrac, \cfrac with support for:
 * - Arbitrary nesting (e.g. \frac{\sqrt{3}}{2}, \frac{1}{\frac{2}{3}})
 * - Spaces around/inside braces (\frac {a} {b})
 * - Braceless forms (\frac 1 2, \frac 12, \frac12)
 * - Escaped backslashes (\\frac)
 */
export function replaceFractions(input: string): string {
  let text = input;
  const fracPattern = /(?:\\|\\\\)(?:d|t|c)?frac\b/i;

  let iterations = 0;
  const maxIterations = 60; // Guard against infinite loop

  while (fracPattern.test(text) && iterations < maxIterations) {
    iterations++;
    const match = fracPattern.exec(text);
    if (!match) break;

    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    // Check if arguments use braces
    let lookAhead = matchEnd;
    while (lookAhead < text.length && /\s/.test(text[lookAhead])) {
      lookAhead++;
    }
    const hasBraces = lookAhead < text.length && (text[lookAhead] === '{' || text[lookAhead] === '(');

    // Extract first argument (numerator)
    const numRes = extractArgument(text, matchEnd, false);
    if (!numRes) {
      text = text.slice(0, matchStart) + text.slice(matchEnd);
      continue;
    }

    // Extract second argument (denominator)
    const denRes = extractArgument(text, numRes.nextIndex, false);
    if (!denRes) {
      text = text.slice(0, matchStart) + numRes.arg + text.slice(numRes.nextIndex);
      continue;
    }

    // Format numerator and denominator recursively
    const formattedNum = replaceFractions(numRes.arg.trim());
    const formattedDen = replaceFractions(denRes.arg.trim());

    // Determine if parentheses are needed for readability
    const numNeedsParen = /[+\-\s]/.test(formattedNum) && !formattedNum.startsWith('(') && !formattedNum.startsWith('[');
    const denNeedsParen = /[+\-\s\/]/.test(formattedDen) && !formattedDen.startsWith('(') && !formattedDen.startsWith('[');

    const safeNum = numNeedsParen ? `(${formattedNum})` : formattedNum;
    const safeDen = denNeedsParen ? `(${formattedDen})` : formattedDen;

    const replacement = `${safeNum}/${safeDen}`;
    text = text.slice(0, matchStart) + replacement + text.slice(denRes.nextIndex);
  }

  return text;
}

/**
 * Recursively resolves \sqrt and sqrt notation with support for:
 * - \sqrt{x}, \sqrt {x}
 * - \sqrt[3]{x} (cube root), \sqrt[n]{x}
 * - \sqrt(x), \sqrt 39, \sqrt x
 * - sqrt39, sqrt(49), sqrt 49
 * - Nested square roots (\sqrt{1 - \frac{16}{25}}, \sqrt{\sqrt{x}})
 */
export function replaceRoots(input: string): string {
  let text = input;
  const rootPattern = /(?:(?:\\|\\\\)sqrt\b|(?<![a-zA-Z\\])sqrt\b)/i;

  let iterations = 0;
  const maxIterations = 50;

  while (rootPattern.test(text) && iterations < maxIterations) {
    iterations++;
    const match = rootPattern.exec(text);
    if (!match) break;

    const matchStart = match.index;
    let idx = matchStart + match[0].length;

    // Skip optional spaces
    while (idx < text.length && /\s/.test(text[idx])) {
      idx++;
    }

    // Check for optional root index in brackets e.g. \sqrt[3]{...}
    let rootIndex = '';
    if (idx < text.length && text[idx] === '[') {
      const bracketRes = extractBalancedDelimiter(text, idx, '[', ']');
      if (bracketRes) {
        rootIndex = bracketRes.content.trim();
        idx = bracketRes.endIndex + 1;
        while (idx < text.length && /\s/.test(text[idx])) {
          idx++;
        }
      }
    }

    // Extract radicand
    let radicand = '';
    let endIdx = idx;

    if (idx < text.length && text[idx] === '{') {
      const braceRes = extractBalancedDelimiter(text, idx, '{', '}');
      if (braceRes) {
        radicand = braceRes.content;
        endIdx = braceRes.endIndex + 1;
      }
    } else if (idx < text.length && text[idx] === '(') {
      const parenRes = extractBalancedDelimiter(text, idx, '(', ')');
      if (parenRes) {
        radicand = parenRes.content;
        endIdx = parenRes.endIndex + 1;
      }
    } else {
      // Single token or digits
      const tokenMatch = /^([0-9a-zA-Z]+|[^\s{}()])/ .exec(text.slice(idx));
      if (tokenMatch) {
        radicand = tokenMatch[1];
        endIdx = idx + tokenMatch[1].length;
      }
    }

    if (!radicand) {
      // Just bare \sqrt without argument
      text = text.slice(0, matchStart) + '√' + text.slice(idx);
      continue;
    }

    // Recursively format the radicand
    const formattedRadicand = replaceRoots(radicand.trim());

    // Choose symbol based on root index
    let prefix = '√';
    if (rootIndex === '3') {
      prefix = '∛';
    } else if (rootIndex === '4') {
      prefix = '∜';
    } else if (rootIndex && rootIndex !== '2') {
      // Format index with superscript digits if possible
      const superIndex = Array.from(rootIndex)
        .map((c) => SUPERSCRIPTS[c] || c)
        .join('');
      prefix = `${superIndex}√`;
    }

    // Radicand parenthesizing
    const needsParen =
      formattedRadicand.length > 1 &&
      !/^\d+$/.test(formattedRadicand) &&
      !formattedRadicand.startsWith('(') &&
      !formattedRadicand.startsWith('[');

    const replacement = needsParen
      ? `${prefix}(${formattedRadicand})`
      : `${prefix}${formattedRadicand}`;

    text = text.slice(0, matchStart) + replacement + text.slice(endIdx);
  }

  // Also replace bare unicode √ with clean formatting if followed by (x) or digits
  text = text.replace(/√\s*\(([^)]+)\)/g, '√($1)');
  text = text.replace(/√\s*\{([^}]+)\}/g, '√($1)');

  return text;
}

/**
 * Replaces exponents and superscripts:
 * x^{2} -> x², 10^{-3} -> 10⁻³, a^(b) -> aᵇ or a^(b)
 */
export function replaceExponents(input: string): string {
  let text = input;

  // Handle ^{...}
  text = text.replace(/\^\{([^}]+)\}/g, (_, exp) => {
    const cleanExp = exp.trim();
    // Check if degree symbol ^\circ
    if (cleanExp === '\\circ' || cleanExp === 'circ') {
      return '°';
    }
    // Attempt unicode conversion
    const unicodeExp = Array.from(cleanExp)
      .map((ch: any) => SUPERSCRIPTS[ch])
      .join('');
    if (unicodeExp && unicodeExp.length === cleanExp.length) {
      return unicodeExp;
    }
    return `^(${cleanExp})`;
  });

  // Handle ^([0-9a-zA-Z+\-]+)
  text = text.replace(/\^([0-9a-zA-Z+\-]+)/g, (_, exp) => {
    if (exp === '\\circ') return '°';
    const unicodeExp = Array.from(exp)
      .map((ch: any) => SUPERSCRIPTS[ch])
      .join('');
    if (unicodeExp && unicodeExp.length === exp.length) {
      return unicodeExp;
    }
    return `^${exp}`;
  });

  return text;
}

/**
 * Replaces subscripts:
 * x_{1} -> x₁, CO_{2} -> CO₂, a_n -> aₙ
 */
export function replaceSubscripts(input: string): string {
  let text = input;

  // Handle _{...}
  text = text.replace(/_\{([^}]+)\}/g, (_, sub) => {
    const cleanSub = sub.trim();
    const unicodeSub = Array.from(cleanSub)
      .map((ch: any) => SUBSCRIPTS[ch])
      .join('');
    if (unicodeSub && unicodeSub.length === cleanSub.length) {
      return unicodeSub;
    }
    return `_(${cleanSub})`;
  });

  // Handle _([0-9a-zA-Z])
  text = text.replace(/_([0-9a-zA-Z])/g, (_, sub) => {
    return SUBSCRIPTS[sub] || `_${sub}`;
  });

  return text;
}

/**
 * Replaces trigonometric, calculus, and standard functions:
 * \sin, \cos, \tan, \arcsin, \arccos, \arctan, \log, \ln, \lim, \det, \int, \sum
 */
export function replaceMathFunctions(input: string): string {
  let text = input;

  // Standard math functions
  text = text.replace(/(?:\\|\\\\)(sin|cos|tan|csc|sec|cot|arcsin|arccos|arctan|sinh|cosh|tanh|log|ln|exp|lim|det|max|min)\b/gi, '$1');

  // Integrals and Summations
  text = text.replace(/(?:\\|\\\\)iint\b/g, '∬');
  text = text.replace(/(?:\\|\\\\)iiint\b/g, '∭');
  text = text.replace(/(?:\\|\\\\)oint\b/g, '∮');
  text = text.replace(/(?:\\|\\\\)int\b/g, '∫');
  text = text.replace(/(?:\\|\\\\)sum\b/g, '∑');
  text = text.replace(/(?:\\|\\\\)prod\b/g, '∏');

  // Differentials and vectors
  text = text.replace(/(?:\\|\\\\)partial\b/g, '∂');
  text = text.replace(/(?:\\|\\\\)nabla\b/g, '∇');

  return text;
}

/**
 * Replaces Greek letters and common mathematical constants:
 * \pi -> π, \theta -> θ, \Delta -> Δ, \alpha -> α, etc.
 */
export function replaceGreekAndConstants(input: string): string {
  let text = input;

  // Match \(GreekLetter)
  text = text.replace(/(?:\\|\\\\)([A-Za-z]+)\b/g, (match, word) => {
    if (GREEK_MAP[word]) {
      return GREEK_MAP[word];
    }
    return match;
  });

  return text;
}

/**
 * Replaces relational, arithmetic, logical, and set theory symbols:
 * \times -> ×, \pm -> ±, \leq -> ≤, \geq -> ≥, \neq -> ≠, \approx -> ≈,
 * \in -> ∈, \subset -> ⊂, \cup -> ∪, \cap -> ∩, \implies -> ⇒, \iff -> ⇔
 */
export function replaceMathSymbols(input: string): string {
  let text = input;

  const symbolReplacements: [RegExp, string][] = [
    // Arithmetic & basic operations
    [/(?:\\|\\\\)(?:times|cdot|bullet)\b/g, '×'],
    [/(?:\\|\\\\)(?:div|divided)\b/g, '÷'],
    [/(?:\\|\\\\)pm\b/g, '±'],
    [/(?:\\|\\\\)mp\b/g, '∓'],
    [/(?:\\|\\\\)circ\b/g, '°'],
    [/(?:\\|\\\\)(?:ast|star)\b/g, '*'],

    // Relations
    [/(?:\\|\\\\)(?:le|leq)\b/g, '≤'],
    [/(?:\\|\\\\)(?:ge|geq)\b/g, '≥'],
    [/(?:\\|\\\\)(?:ne|neq)\b/g, '≠'],
    [/(?:\\|\\\\)(?:approx|sim|simeq|cong)\b/g, '≈'],
    [/(?:\\|\\\\)equiv\b/g, '≡'],
    [/(?:\\|\\\\)propto\b/g, '∝'],
    [/(?:\\|\\\\)infty\b/g, '∞'],

    // Sets & Logic
    [/(?:\\|\\\\)notin\b/g, '∉'],
    [/(?:\\|\\\\)in\b/g, '∈'],
    [/(?:\\|\\\\)subseteq\b/g, '⊆'],
    [/(?:\\|\\\\)subset\b/g, '⊂'],
    [/(?:\\|\\\\)supseteq\b/g, '⊇'],
    [/(?:\\|\\\\)supset\b/g, '⊃'],
    [/(?:\\|\\\\)cup\b/g, '∪'],
    [/(?:\\|\\\\)cap\b/g, '∩'],
    [/(?:\\|\\\\)(?:emptyset|varnothing)\b/g, '∅'],
    [/(?:\\|\\\\)forall\b/g, '∀'],
    [/(?:\\|\\\\)exists\b/g, '∃'],
    [/(?:\\|\\\\)(?:implies|Longrightarrow|to|rightarrow)\b/g, '⇒'],
    [/(?:\\|\\\\)(?:iff|Longleftrightarrow|leftrightarrow)\b/g, '⇔'],
    [/(?:\\|\\\\)lor\b/g, '∨'],
    [/(?:\\|\\\\)land\b/g, '∧'],
    [/(?:\\|\\\\)neg\b/g, '¬'],

    // Geometry
    [/(?:\\|\\\\)angle\b/g, '∠'],
    [/(?:\\|\\\\)perp\b/g, '⊥'],
    [/(?:\\|\\\\)parallel\b/g, '∥'],
    [/(?:\\|\\\\)triangle\b/g, '△'],

    // Brackets and delimiters
    [/(?:\\|\\\\)left\s*\(/g, '('],
    [/(?:\\|\\\\)right\s*\)/g, ')'],
    [/(?:\\|\\\\)left\s*\[/g, '['],
    [/(?:\\|\\\\)right\s*\]/g, ']'],
    [/(?:\\|\\\\)left\s*\\\{/g, '{'],
    [/(?:\\|\\\\)right\s*\\\}/g, '}'],
    [/(?:\\|\\\\)left\s*\|/g, '|'],
    [/(?:\\|\\\\)right\s*\|/g, '|'],
    [/(?:\\|\\\\)left\./g, ''],
    [/(?:\\|\\\\)right\./g, ''],
    [/(?:\\|\\\\)(?:big|Big|bigg|Bigg)[lrm]?\b/g, ''],
    [/(?:\\|\\\\)\{/g, '{'],
    [/(?:\\|\\\\)\}/g, '}'],
    [/(?:\\|\\\\)lbrace\b/g, '{'],
    [/(?:\\|\\\\)rbrace\b/g, '}'],
    [/(?:\\|\\\\)langle\b/g, '⟨'],
    [/(?:\\|\\\\)rangle\b/g, '⟩'],

    // LaTeX spacing commands
    [/(?:\\|\\\\)[,;:!]/g, ' '],
    [/(?:\\|\\\\)(?:quad|qquad|enspace)\b/g, '  '],
    [/(?:\\|\\\\)\s+/g, ' '],

    // Common escaped characters
    [/(?:\\|\\\\)%/g, '%'],
    [/(?:\\|\\\\)\$/g, '$'],
    [/(?:\\|\\\\)_/g, '_'],
    [/(?:\\|\\\\)&/g, '&'],
    [/(?:\\|\\\\)#/g, '#'],
  ];

  for (const [regex, replacement] of symbolReplacements) {
    text = text.replace(regex, replacement);
  }

  return text;
}

/**
 * Strips formatting wrappers like \text{...}, \mathrm{...}, \mathbf{...}, \boldsymbol{...}
 */
export function replaceTextWrappers(input: string): string {
  let text = input;
  const wrapperPattern = /(?:\\|\\\\)(?:text|mathrm|mathbf|mathit|mathsf|mathtt|boldsymbol|operatorname|textbf|textit)\s*\{([^}]*)\}/g;

  while (wrapperPattern.test(text)) {
    text = text.replace(wrapperPattern, '$1');
  }

  return text;
}

/**
 * Removes LaTeX math delimiters:
 * $$...$$, $...$, \[...\], \(...\)
 */
export function unwrapMathDelimiters(input: string): string {
  let text = input;

  // Display math $$...$$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, '$1');

  // Inline math $...$
  text = text.replace(/\$([^\$\n]+?)\$/g, '$1');

  // LaTeX delimiters \[...\] and \(...\)
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '$1');
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$1');

  return text;
}

/**
 * Scans output text for any lingering unreplaced LaTeX commands or backslash symbols.
 * Returns array of offending tokens (e.g. ['\\frac', '\\sqrt', '\\unknown']).
 */
export function findUnreplacedLatexTokens(text: string): string[] {
  const matches = text.match(/(?:\\|\\\\)[a-zA-Z]+/g);
  if (!matches) return [];

  // Filter out normal escaped chars or valid non-LaTeX backslashes
  const validAllowed = new Set(['\\n', '\\t', '\\r']);
  const offending = matches.filter((t) => !validAllowed.has(t));
  return Array.from(new Set(offending));
}

/**
 * Primary function: formatHumanReadableText
 * 
 * Transforms any raw LaTeX math, markdown formatting, or computer math expressions
 * into clean, natural human-readable text.
 * 
 * Includes a diagnostic logging mechanism that records and alerts when
 * LaTeX symbols (such as \frac or \sqrt) fail to be replaced.
 */
export function formatHumanReadableText(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    return '';
  }

  // 0. Normalize double backslashes before LaTeX commands (e.g. \\frac -> \frac, \\sqrt -> \sqrt)
  let formatted = raw.replace(/\\\\([a-zA-Z]+)/g, '\\$1');

  // 1. Unwrap math delimiters ($$, $, \[, \])
  formatted = unwrapMathDelimiters(formatted);

  // 2. Unwrap text macros like \text{...}, \mathrm{...}
  formatted = replaceTextWrappers(formatted);

  // 3. Process nested fractions (\frac, \dfrac, \tfrac, \cfrac)
  formatted = replaceFractions(formatted);

  // 4. Process square roots and nth roots (\sqrt, \sqrt[3]{...}, sqrt39)
  formatted = replaceRoots(formatted);

  // 5. Process exponents and superscripts (x^2 -> x², ^{...})
  formatted = replaceExponents(formatted);

  // 6. Process subscripts (x_1 -> x₁, _{...})
  formatted = replaceSubscripts(formatted);

  // 7. Process mathematical functions (\sin, \cos, \tan, \log, \int, \sum)
  formatted = replaceMathFunctions(formatted);

  // 8. Process Greek letters and constants (\pi, \theta, \alpha, \Delta)
  formatted = replaceGreekAndConstants(formatted);

  // 9. Process math symbols, operators, logic, sets, and brackets
  formatted = replaceMathSymbols(formatted);

  // 10. Re-check for any second-order fractions or roots produced by nested replacements
  if (/(?:\\|\\\\)(?:frac|sqrt)/i.test(formatted)) {
    formatted = replaceFractions(formatted);
    formatted = replaceRoots(formatted);
  }

  // 11. Clean up stray empty braces or solitary backslashes
  formatted = formatted.replace(/\{([^{}]+)\}/g, '$1');
  formatted = formatted.replace(/\\([a-zA-Z]+)\b/g, '$1'); // Strip remaining backslash on unknown command
  formatted = formatted.replace(/\\\\/g, '\\');

  // 12. Normalize multiple spaces (preserving intentional line breaks)
  formatted = formatted
    .split('\n')
    .map((line) => line.replace(/[ \t]{2,}/g, ' ').trimEnd())
    .join('\n');

  // 13. Logging mechanism: Detect any unreplaced LaTeX tokens and record diagnostics
  const unreplaced = findUnreplacedLatexTokens(formatted);
  if (unreplaced.length > 0) {
    const entry: UnreplacedLogEntry = {
      timestamp: new Date().toISOString(),
      original: raw,
      result: formatted,
      unreplacedTokens: unreplaced,
    };
    unreplacedTokensLog.push(entry);

    if (isLoggingEnabled) {
      console.warn(
        `[examFormatter:formatHumanReadableText] Unreplaced LaTeX token(s) detected: ${unreplaced.join(', ')}`,
        { original: raw, formattedResult: formatted }
      );
    }
  }

  return formatted;
}

/**
 * Formats math text specifically optimized for Text-to-Speech (Thai & English pronunciation)
 * e.g. 1/2 -> "1 ส่วน 2", √x -> "รากที่สองของ x"
 */
export function formatMathToSpeechText(raw: string): string {
  let text = formatHumanReadableText(raw);

  // Convert fractional slashes to Thai words for clearer TTS pronunciation
  text = text.replace(/(\d+)\/(\d+)/g, '$1 ส่วน $2');

  // Square roots
  text = text.replace(/√\(([^)]+)\)/g, 'รากที่สองของ $1');
  text = text.replace(/√([0-9a-zA-Z]+)/g, 'รากที่สองของ $1');
  text = text.replace(/∛\(([^)]+)\)/g, 'รากที่สามของ $1');
  text = text.replace(/∛([0-9a-zA-Z]+)/g, 'รากที่สามของ $1');

  // Exponents
  text = text.replace(/([0-9a-zA-Z]+)²/g, '$1 ยกกำลังสอง');
  text = text.replace(/([0-9a-zA-Z]+)³/g, '$1 ยกกำลังสาม');
  text = text.replace(/([0-9a-zA-Z]+)\^([0-9a-zA-Z]+)/g, '$1 ยกกำลัง $2');

  // Remove markdown symbols that interfere with speech
  text = text.replace(/[*_#`[\]()]/g, ' ');

  return text.trim();
}

export default {
  formatHumanReadableText,
  formatMathToSpeechText,
  replaceFractions,
  replaceRoots,
  replaceExponents,
  replaceSubscripts,
  replaceMathFunctions,
  replaceGreekAndConstants,
  replaceMathSymbols,
  findUnreplacedLatexTokens,
  setExamFormatterLogging,
  getExamFormatterLogs,
  clearExamFormatterLogs,
};
