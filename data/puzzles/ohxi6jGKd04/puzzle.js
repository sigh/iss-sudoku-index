// Title: Parity Arrows
// Author: Testarossa
// Video: https://www.youtube.com/watch?v=ohxi6jGKd04
// Source: https://app.crackingthecryptic.com/sudoku/TbMnngP7GJ
//
// Normal sudoku rules apply (standard 3x3 boxes, from Shape('9x9')).
//
// Rule 1: "Digits along an arrow must sum to the digit in that arrow's
// circle." -- one Arrow(bulb, ...arm) per drawn arrow; every bulb lands on a
// drawn circle. R3C3 carries two arrows (up and down column 3).
//
// Rule 2: "Digits in circles also show the total number of cells of the same
// even/odd parity that that cell sees horizontally and vertically (including
// itself) before it hits a cell with another parity." This applies to all
// nine circled cells, including R1C7 which has no arrow.
// Encoded with one custom NFA per circle: the origin cell (bulb) is the first
// segment, and the four rays (up/down/left/right, nearest cell first,
// computed from the drawn geometry rather than hand-enumerated) are the
// remaining four segments of one multi-segment scan. The state carries the
// origin's own parity (`target`) and raw digit (`orig`), a running same-
// parity `total` that only increments while the current ray has not yet hit
// a mismatch (`stopped`, reset at each SEGMENT_BREAK so every ray counts
// independently from the origin), clamped so the state stays bounded. It
// accepts iff `total === orig - 1` (the "+1" for the origin cell itself is
// added back algebraically rather than counted). Fixture-tested (accept,
// reject-by-count, stop-at-first-mismatch, all-empty-rays, and stopped-resets
// -across-a-break) against the raw handler before use here.

const parityRunSpec = {
  startState: { target: null, orig: null, stopped: false, total: 0 },
  transition(state, value) {
    if (value === SEGMENT_BREAK) {
      // New ray: only the "stopped so far" flag resets: total keeps
      // accumulating across all four rays, target/orig never change.
      return { ...state, stopped: false };
    }
    if (state.target === null) {
      // First symbol consumed is the origin cell itself.
      return { target: value % 2, orig: value, stopped: false, total: 0 };
    }
    if (state.stopped) return state;
    if ((value % 2) === state.target) {
      // Clamp: orig maxes at 9, so orig - 1 maxes at 8; 9 is a safe sink.
      return { ...state, total: Math.min(state.total + 1, 9) };
    }
    return { ...state, stopped: true };
  },
  accept: (state) => state.target !== null && state.total === state.orig - 1,
  // Bound = cells + (segments - 1) breaks. Max real cells per instance is
  // 1 (origin) + up to 8 (up+down) + up to 8 (left+right) = 17, plus 4 breaks.
  maxDepth: 25,
};
const parityRunNFA = NFA.encodeSpec(parityRunSpec, 9, { multiSegment: true });

// Ray of cells from (row, col) stepping by (dr, dc), 1-indexed, stopping at
// the grid edge -- nearest cell first, matching scan order the rule needs.
const rayCells = (row, col, dr, dc) => {
  const cells = [];
  for (let r = row + dr, c = col + dc; r >= 1 && r <= 9 && c >= 1 && c <= 9; r += dr, c += dc) {
    cells.push(makeCellId(r, c));
  }
  return cells;
};

// Provenance: the nine drawn circle centres.
const CIRCLES = [
  { row: 3, col: 3 }, // R3C3 -- shared bulb of two arrows
  { row: 2, col: 5 }, // R2C5
  { row: 3, col: 8 }, // R3C8
  { row: 3, col: 5 }, // R3C5
  { row: 7, col: 1 }, // R7C1
  { row: 7, col: 3 }, // R7C3
  { row: 8, col: 6 }, // R8C6
  { row: 7, col: 9 }, // R7C9
  { row: 1, col: 7 }, // R1C7 -- no arrow, parity rule only
];

const parityCircles = CIRCLES.map(({ row, col }) => new NFA(
  parityRunNFA, 'ParityRun',
  [makeCellId(row, col)],
  rayCells(row, col, -1, 0), // up
  rayCells(row, col, 1, 0),  // down
  rayCells(row, col, 0, -1), // left
  rayCells(row, col, 0, 1),  // right
));

// Provenance: bulb + arm cells for each drawn arrow, in drawn order.
const arrows = [
  new Arrow('R3C3', 'R2C3', 'R1C3'),
  new Arrow('R3C3', 'R4C3', 'R5C3', 'R6C3'),
  new Arrow('R2C5', 'R2C4', 'R1C4'),
  new Arrow('R3C8', 'R3C7', 'R3C6'),
  new Arrow('R3C5', 'R4C6'),
  new Arrow('R7C1', 'R7C2', 'R8C1'),
  new Arrow('R7C3', 'R7C4', 'R8C5', 'R9C6'),
  new Arrow('R8C6', 'R7C6', 'R6C6'),
  new Arrow('R7C9', 'R6C8', 'R6C7'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...parityCircles,
];
