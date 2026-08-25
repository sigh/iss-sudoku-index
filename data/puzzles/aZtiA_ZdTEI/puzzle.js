// Title: Turtle Sandwich Sudoku: Always 26
// Author: Oyvind Thorsby
// Video: https://www.youtube.com/watch?v=aZtiA_ZdTEI
// Source: https://app.crackingthecryptic.com/sudoku/F92tJ2HbLJ

// Normal Sudoku rules apply.
// Each drawn outside clue gives the sum of the digits strictly between the
// cells holding 2 and 3 in that row/column (order-independent, since the
// rule names an unordered pair). Rows/columns with no drawn clue are
// unconstrained by this rule. Wherever a 4 appears anywhere in the grid, the
// sum of its (in-grid) orthogonal neighbours is 26.

const graph = cellGraph('9x9');

// --- Rule 2: sandwich sum between markers {2, 3} (a generalized Sandwich,
// which ISS's built-in Sandwich fixes at markers {1, 9}). Reads a whole
// row/column: phase 0 = neither marker seen, phase 1 = exactly one marker
// seen (accumulate the sum), phase 2 = both markers seen (sum frozen). The
// clamp at target+1 keeps the state space small without changing whether
// sum === target holds.
const sandwich23Cache = new Map();
function sandwich23(target) {
  if (sandwich23Cache.has(target)) return sandwich23Cache.get(target);
  const spec = NFA.encodeSpec({
    startState: { phase: 0, sum: 0 },
    transition: ({ phase, sum }, value) => {
      const isMarker = value === 2 || value === 3;
      if (phase === 0) {
        return isMarker ? { phase: 1, sum: 0 } : { phase: 0, sum: 0 };
      }
      if (phase === 1) {
        if (isMarker) return { phase: 2, sum };
        return { phase: 1, sum: Math.min(sum + value, target + 1) };
      }
      return { phase: 2, sum };
    },
    accept: ({ phase, sum }) => phase === 2 && sum === target,
  }, 9);
  sandwich23Cache.set(target, spec);
  return spec;
}

// Drawn outside-clue values, transcribed from the printed clues at the
// top/left of the frame (a "0" clue is a real reading, meaning 2 and 3 sit
// in adjacent cells). Undrawn rows/columns carry no clue and are simply
// absent from these tables.
const ROW_CLUES = { 1: 13, 2: 26, 3: 7, 4: 27, 5: 12 };
const COL_CLUES = { 2: 0, 3: 0, 4: 24, 5: 7, 7: 5, 8: 0 };

const rowSandwiches = Object.entries(ROW_CLUES).map(([n, target]) =>
  new NFA(sandwich23(target), 'sandwich23', ...graph.row(Number(n))));
const colSandwiches = Object.entries(COL_CLUES).map(([n, target]) =>
  new NFA(sandwich23(target), 'sandwich23', ...graph.column(Number(n))));

// --- Rule 3: wherever a 4 appears, its orthogonal neighbours sum to 26.
// Reads the cell itself, then each in-grid orthogonal neighbour (2 at a
// corner, 3 on an edge, 4 interior); vacuous unless the cell's own digit is
// 4. Applying it at every cell (not only ones later found to hold 4) checks
// the rule exhaustively, as its own wording ("wherever") requires. The sum
// clamps at 27 (a "already too high" sink, since remaining values only add)
// and maxDepth bounds state creation to the longest stream used (a centre
// plus up to 4 neighbours).
const neighbourSumSpec = NFA.encodeSpec({
  startState: { seenCentre: false, isFour: false, sum: 0 },
  transition: ({ seenCentre, isFour, sum }, value) => {
    if (!seenCentre) return { seenCentre: true, isFour: value === 4, sum: 0 };
    return { seenCentre, isFour, sum: Math.min(sum + value, 27) };
  },
  accept: ({ isFour, sum }) => !isFour || sum === 26,
  maxDepth: 5,
}, 9);

const fourNeighbourSums = graph.cells().map((cell) =>
  new NFA(neighbourSumSpec, 'four26', cell, ...graph.neighbours(cell)));

return [
  new Shape('9x9'),
  ...rowSandwiches,
  ...colSandwiches,
  ...fourNeighbourSums,
];
