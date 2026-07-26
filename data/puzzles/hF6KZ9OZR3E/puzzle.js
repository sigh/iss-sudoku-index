// Title: Ladder
// Author: zetamath
// Video: https://www.youtube.com/watch?v=hF6KZ9OZR3E
// Source: https://sudokupad.app/7wxsd2awbv

// Grey (TEN) lines: digits split into non-overlapping segments each summing
// to 10 -> SumLine(10, ...). The payload has no dedicated array for these
// (unlike renban/whisper/entropic/nabner); each is a plain "line" stroke
// that the source editor split into a new entry at every bend, so entries
// sharing an endpoint cell are fragments of one longer line and are joined
// here into the two full paths (the puzzle's two "ladder rails").
// Purple (REN) lines: non-repeating consecutive set, any order -> Renban.
// Green (GW) lines: adjacent digits differ by at least 5 -> Whisper(5, ...).
// Orange (ENT) lines: every 3 sequential cells hold one low(1-3)/mid(4-6)/
// high(7-9) digit -> Entropic.
// Gold (NAB) lines: no repeats anywhere on the line, and no two cells
// anywhere on the line (not just adjacent ones) hold consecutive digits ->
// AllDifferent + an all-pairs "not consecutive" PairX.
// Black dots: 1:2 ratio -> BlackDot. Not all dots are necessarily given, so
// this stays a plain (non-strict) positive constraint.
//
// The source payload's single-cell `cage` entries (value strings "GW",
// "ENT", "TEN", "NAB", "REN") are a colour legend, not additional cage
// totals: each sits on a cell already covered by a line of the matching
// type above, and none carries a numeric total.
//
// Only one grid cell is a true given (`given: true` in the source payload);
// the rest of the payload's `grid` values are the puzzle's solution, not
// used here.

const tenLines = [
  // R1C7-R4C4 (raw entry 3) + R4C4-R5C3 (entry 1) + R5C3-R5C2 (entry 0),
  // joined at the shared R4C4 and R5C3 endpoints.
  ['R1C7', 'R2C7', 'R3C7', 'R4C6', 'R4C5', 'R4C4', 'R5C3', 'R5C2'],
  // R5C8-R6C7 (entry 2) + R6C7-R7C4 (entry 5, reversed) +
  // R7C4-R6C2 (entry 4, reversed), joined at the shared R6C7 and R7C4
  // endpoints.
  ['R5C8', 'R5C7', 'R6C7', 'R7C6', 'R8C5', 'R7C4', 'R6C3', 'R6C2'],
];

const renbanLines = [
  ['R7C8', 'R8C8', 'R9C8'],
  ['R1C2', 'R1C3', 'R2C3'],
];

const whisperLines = [
  ['R4C1', 'R5C1', 'R6C1'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C1', 'R7C2'],
];

const entropicLines = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R9C5', 'R9C4', 'R8C4', 'R8C3'],
];

const nabnerLines = [
  ['R7C7', 'R8C7', 'R9C7', 'R9C6'],
  ['R3C6', 'R3C5', 'R3C4'],
];

const blackDots = [
  ['R9C2', 'R9C3'],
  ['R1C5', 'R2C5'],
];

// Nabner: distinct (AllDifferent) plus no two cells anywhere on the line
// holding consecutive digits (all pairs, not just line-adjacent ones).
const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
function nabner(cells) {
  return [
    new AllDifferent(...cells),
    new PairX(notConsecutive, 'nabner: no consecutive pair', ...cells),
  ];
}

return [
  new Shape('9x9'),

  new Given('R7C5', 9),

  ...tenLines.map(cells => new SumLine(10, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
  ...entropicLines.map(cells => new Entropic(...cells)),
  ...nabnerLines.flatMap(nabner),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
