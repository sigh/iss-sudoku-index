// Title: Diagonal Mode
// Author: AFrayedKnot
// Video: https://www.youtube.com/watch?v=LSxAtfTSnMM
// Source: https://app.crackingthecryptic.com/sudoku/m2TTpBPtg2

// Normal sudoku rules (default rows/columns/3x3 boxes from Shape('9x9')).
// 9 outside diagonal clues: each names the digit that repeats most often
// among the cells of one drawn "broken" diagonal, and no other digit may
// repeat that same number of times on that diagonal. Each diagonal is a
// maximal run of grid cells the drawn arrow ray passes through -- a
// "broken diagonal" that may be shorter than 9 cells.
//
// Each clue is encoded as one NFA per (clue diagonal, other digit d) pair,
// scanning the diagonal's cells in order and tracking
// count(clueDigit-seen-so-far) - count(d-seen-so-far), clamped by the
// symbol alphabet (state changes by at most 1 per cell, so it never needs
// clamping beyond the natural +-length bound). The clue is satisfied only
// if that running difference ends strictly positive against every other
// digit -- i.e. the clue digit's final count strictly exceeds every other
// digit's final count. Machines are memoized per (clueDigit, otherDigit)
// pair since the same comparison recurs across diagonals sharing a clue
// digit.

const diagonals = [
  { clue: 3, cells: ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'] },
  { clue: 5, cells: ['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9'] },
  { clue: 2, cells: ['R1C6', 'R2C7', 'R3C8', 'R4C9'] },
  { clue: 1, cells: ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'] },
  { clue: 3, cells: ['R9C4', 'R8C3', 'R7C2', 'R6C1'] },
  { clue: 3, cells: ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'] },
  { clue: 1, cells: ['R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'] },
  { clue: 1, cells: ['R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'] },
  { clue: 2, cells: ['R4C1', 'R3C2', 'R2C3', 'R1C4'] },
];

// dominance(clue, other): accepts iff count(clue) - count(other) > 0 over
// the scanned cells. `diff` is clamped to [-9, 9]: no diagonal exceeds 9
// cells, so the true difference never leaves that range, but the NFA
// compiler explores reachable states independent of any particular
// instantiation's length and would otherwise expand diff unboundedly.
const MAX_DIAGONAL_LEN = 9;
const dominanceCache = new Map();
function dominance(clue, other) {
  const key = `${clue}_${other}`;
  if (dominanceCache.has(key)) return dominanceCache.get(key);
  const clampDiff = d => Math.max(-MAX_DIAGONAL_LEN, Math.min(MAX_DIAGONAL_LEN, d));
  const spec = NFA.encodeSpec({
    startState: { diff: 0 },
    transition: ({ diff }, value) => {
      if (value === clue) return { diff: clampDiff(diff + 1) };
      if (value === other) return { diff: clampDiff(diff - 1) };
      return { diff };
    },
    accept: ({ diff }) => diff > 0,
  }, 9);
  dominanceCache.set(key, spec);
  return spec;
}

const diagonalConstraints = diagonals.flatMap(({ clue, cells }, i) => {
  const others = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => d !== clue);
  return others.map(other =>
    new NFA(dominance(clue, other), `diagonal ${i + 1} mode`, ...cells));
});

return [
  new Shape('9x9'),
  new Given('R1C7', 8),
  new Given('R2C9', 7),
  new Given('R3C6', 4),
  new Given('R4C9', 6),
  new Given('R5C6', 7),
  new Given('R6C3', 4),
  new Given('R6C5', 6),
  new Given('R9C2', 6),
  new Given('R9C4', 5),
  ...diagonalConstraints,
];
