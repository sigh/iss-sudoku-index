// Title: Hitlines
// Author: Marty Sears & Ratfinkz
// Video: https://www.youtube.com/watch?v=4zDOEZnwmBA
// Source: https://sudokupad.app/x75we00sgg

// Normal sudoku. Beige "hitlines" carry two rules: digits along a hitline do
// not repeat, and the blue clue attached to each hitline gives the total of
// the hitline digits that equal their position number, the cell the clue
// points at being position 1.
//
// A clue is one blue circle, or a two-digit blue pill covering two cells and
// read downwards or from left to right; nothing in the puzzle prints a number
// on a clue, so a clue's value is the digit in its circled cell, or ten times
// the first pill cell's digit plus the second's. The clue cells are ordinary
// sudoku cells and lie on no hitline.
//
// The rules' remaining sentence ("entering correct digits may clear fog") is
// solving UI: it does not restrict the finished grid, so nothing encodes it.

// Drawn data. `cells` is one hitline, transcribed from a beige polyline and
// expanded to every cell the stroke crosses; `clue` is the blue circle, or the
// two circles joined by a connector that make a pill, listed in reading order
// (left to right for the horizontal pill, downwards for the vertical one).
// Each clue also carries a short blue arrow; every arrowhead lands on an
// endpoint of exactly one hitline, which is what pairs a clue with its line
// and fixes which end is position 1. `cells` starts at that endpoint.
const HITLINES = [
  // pill R1C1-R1C2, arrow R1C2 -> R1C3
  { clue: ['R1C1', 'R1C2'], cells: ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'] },
  // pill R8C1-R9C1, arrow R8C1 -> R7C1
  {
    clue: ['R8C1', 'R9C1'],
    cells: ['R7C1', 'R6C1', 'R5C2', 'R4C1', 'R3C1', 'R3C2', 'R3C3', 'R4C3'],
  },
  // circle R6C2, arrow R6C2 -> R7C3
  { clue: ['R6C2'], cells: ['R7C3', 'R8C4', 'R9C3'] },
  // circle R1C9, arrow R1C9 -> R1C8
  {
    clue: ['R1C9'],
    cells: ['R1C8', 'R2C8', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9'],
  },
  // circle R6C8, arrow R6C8 -> R6C7
  { clue: ['R6C8'], cells: ['R6C7', 'R6C6', 'R6C5'] },
  // circle R3C5, arrow R3C5 -> R4C6
  {
    clue: ['R3C5'],
    cells: ['R4C6', 'R5C6', 'R5C5', 'R4C5', 'R3C4', 'R2C4', 'R2C5', 'R2C6',
      'R3C6'],
  },
  // circle R7C6, arrow R7C6 -> R8C5
  {
    clue: ['R7C6'],
    cells: ['R8C5', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C8', 'R7C9'],
  },
];

// One machine per (clue length, hitline length), reading the clue cells and
// then the hitline as a single sequence. While `phase` is 'clue' the machine
// builds the clue's value, most significant digit first. It then walks the
// hitline with `pos` as the position number and `owed` as the part of the clue
// total not yet accounted for, subtracting a digit that equals its position.
// Accepting means the walk finished with the total exactly paid off.
const specFor = (clueLen, lineLen) => {
  // Positions run 1..lineLen and a hitline's digits are distinct, so at most
  // one digit can equal each position: after position p the hitline can still
  // contribute at most (p+1) + ... + lineLen. Rejecting an unreachable `owed`
  // is the rule's own arithmetic, and keeps the compiled machine small.
  const stillPayable = (p) => (lineLen * (lineLen + 1) - p * (p + 1)) / 2;
  return NFA.encodeSpec({
    startState: { phase: 'clue', digits: 0, target: 0 },
    transition: (state, value) => {
      if (state.phase === 'clue') {
        const target = state.target * 10 + value;
        const digits = state.digits + 1;
        if (digits < clueLen) return { phase: 'clue', digits, target };
        if (target > stillPayable(0)) return undefined;
        return { phase: 'line', pos: 0, owed: target };
      }
      const pos = state.pos + 1;
      const owed = state.owed - (value === pos ? value : 0);
      if (owed < 0 || owed > stillPayable(pos)) return undefined;
      return { phase: 'line', pos, owed };
    },
    accept: (state) =>
      state.phase === 'line' && state.pos === lineLen && state.owed === 0,
    maxDepth: clueLen + lineLen,
  }, 9);
};

const specCache = new Map();
const cachedSpec = (clueLen, lineLen) => {
  const key = `${clueLen},${lineLen}`;
  if (!specCache.has(key)) specCache.set(key, specFor(clueLen, lineLen));
  return specCache.get(key);
};

return [
  new Shape('9x9'),

  ...HITLINES.map(({ cells }) => new AllDifferent(...cells)),

  ...HITLINES.map(({ clue, cells }) => new NFA(
    cachedSpec(clue.length, cells.length), 'hitline', ...clue, ...cells)),
];
