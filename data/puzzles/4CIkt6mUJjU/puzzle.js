// Title: Pulley-ing Your Weight
// Author: metagloria
// Video: https://www.youtube.com/watch?v=4CIkt6mUJjU
// Source: https://app.crackingthecryptic.com/sudoku/TLNj6Tfpjd
//
// Normal sudoku. Each green line is a German-whisper line (adjacent cells
// differ by >= 5). The V/X/XV overlays are ordinary two-cell sum markers
// (5/10/15) on the specific adjacent cells the marker's edge sits on. Each
// of the six 2x2 cages has no printed total, so it only forbids a repeat
// inside itself. Each green line also joins two of those cages end to end
// (one line endpoint lies in each cage); the drawn line peaks partway along
// and its two legs run down to the two cages at unequal length for two of
// the three lines and equal length for the third -- read per the "hangs
// lower" / "balanced" rule as: the cage at the end of the longer leg (lower
// in the grid) must have the strictly larger cage total, and a pair with
// equal-length legs must have equal cage totals. Cage totals themselves are
// solver-derived (not given), so each pair is compared with a difference-
// tracking NFA scanning that pair's 8 cells as two 4-cell segments.

const cageA = ['R4C2', 'R4C3', 'R5C2', 'R5C3'];
const cageB = ['R7C1', 'R7C2', 'R8C1', 'R8C2'];
const cageC = ['R7C3', 'R7C4', 'R8C3', 'R8C4'];
const cageD = ['R7C5', 'R7C6', 'R8C5', 'R8C6'];
const cageE = ['R3C7', 'R3C8', 'R4C7', 'R4C8'];
const cageF = ['R8C8', 'R8C9', 'R9C8', 'R9C9'];

const line1 = [
  'R4C3', 'R3C3', 'R2C3', 'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1',
];
const line2 = [
  'R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C5', 'R4C6', 'R5C6', 'R6C6', 'R7C6',
];
const line3 = [
  'R3C7', 'R2C7', 'R1C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9',
];

// Compares two 4-cell cage totals without ever materializing a cage sum as a
// Var (a 2x2 all-different cage totals 10-30, past the 16-value Var/Shape
// cap). Reads `lighter` then `higher` as two NFA segments, carrying only the
// running difference (higher-segment sum minus lighter-segment sum) in
// state; `strict` requires the higher segment strictly larger, otherwise
// the two totals must match.
function cageComparisonNFA(name, lighter, higher, strict) {
  const spec = {
    startState: { seg: 0, diff: 0 },
    transition: ({ seg, diff }, value) => {
      if (value === SEGMENT_BREAK) return { seg: 1, diff };
      return seg === 0 ? { seg: 0, diff: diff - value } : { seg: 1, diff: diff + value };
    },
    accept: ({ diff }) => strict ? diff > 0 : diff === 0,
    // Fixed-length scan: 4 cells + SEGMENT_BREAK + 4 cells = 9 symbols.
    maxDepth: 9,
  };
  return new NFA(
    NFA.encodeSpec(spec, 9, { multiSegment: true }), name, lighter, higher);
}

return [
  new Shape('9x9'),

  // Green lines: German whisper, adjacent cells differ by >= 5.
  new Whisper(5, ...line1),
  new Whisper(5, ...line2),
  new Whisper(5, ...line3),

  // V / X / XV: the two specific adjacent cells each marker's edge sits on.
  new V('R1C2', 'R2C2'),
  new X('R2C5', 'R3C5'),
  new Sum(15, 'R1C8', 'R2C8'),

  // Cages: no printed total, so only "digits may not repeat" applies.
  new AllDifferent(...cageA),
  new AllDifferent(...cageB),
  new AllDifferent(...cageC),
  new AllDifferent(...cageD),
  new AllDifferent(...cageE),
  new AllDifferent(...cageF),

  // Pulley pairs, one per green line (see file header): line 1 joins cage A
  // (short/high leg) to cage B (long/low leg) -- cage B strictly larger.
  cageComparisonNFA('pulley-1', cageA, cageB, true),
  // Line 2 joins cage C and cage D with equal-length legs -- equal totals.
  cageComparisonNFA('pulley-2', cageC, cageD, false),
  // Line 3 joins cage E (short/high leg) to cage F (long/low leg) -- cage F
  // strictly larger.
  cageComparisonNFA('pulley-3', cageE, cageF, true),
];
